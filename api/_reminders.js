const crypto = require("crypto");

const {
  buildNotionProperties,
  getDataSourceId,
  getDataSourceSchema,
  normalizeItem,
  notionRequest
} = require("./_lib");

const SUBSCRIPTION_TYPE = "알림구독";
const SUBSCRIPTION_NOTE_KIND = "push-subscription";
const REMINDER_LEAD_MINUTES = 30;
const REMINDER_WINDOW_MS = Number(process.env.REMINDER_CRON_WINDOW_MS || 6 * 60 * 1000);
const SENT_RETENTION_MS = 3 * 24 * 60 * 60 * 1000;
const SENT_MAX_KEYS = 12;
const TIME_ZONE_OFFSET = process.env.NOTION_TIME_ZONE_OFFSET || "+09:00";
const ROUTINE_DAYS = ["일", "월", "화", "수", "목", "금", "토"];

let webPush = null;

function pushPublicConfig() {
  return {
    configured: pushConfigured(),
    vapidPublicKey: process.env.VAPID_PUBLIC_KEY || ""
  };
}

function pushConfigured() {
  return Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

async function savePushSubscription(subscription) {
  if (!pushConfigured()) {
    const error = new Error("VAPID keys are not configured.");
    error.status = 503;
    error.code = "push_not_configured";
    throw error;
  }

  validateSubscription(subscription);
  const existing = await findSubscriptionByEndpoint(subscription.endpoint);
  const metadata = normalizeSubscriptionMetadata(existing?.metadata || {}, subscription);
  const { schema, titleProperty } = await getDataSourceSchema();
  const body = {
    title: `Push ${metadata.endpointHash.slice(0, 8)}`,
    type: SUBSCRIPTION_TYPE,
    status: "활성",
    note: stringifySubscriptionMetadata(metadata)
  };

  if (existing) {
    const payload = await notionRequest(`/pages/${existing.item.id}`, {
      method: "PATCH",
      body: {
        properties: buildNotionProperties(body, schema, titleProperty),
        in_trash: false
      }
    });
    return normalizeItem(payload, schema, titleProperty);
  }

  const payload = await notionRequest("/pages", {
    method: "POST",
    body: {
      parent: {
        data_source_id: getDataSourceId()
      },
      properties: buildNotionProperties(body, schema, titleProperty)
    }
  });

  return normalizeItem(payload, schema, titleProperty);
}

async function deletePushSubscription(endpoint) {
  if (!endpoint) return false;
  const existing = await findSubscriptionByEndpoint(endpoint);
  if (!existing) return false;

  await notionRequest(`/pages/${existing.item.id}`, {
    method: "PATCH",
    body: { in_trash: true }
  });
  return true;
}

async function sendDuePushReminders(now = new Date()) {
  if (!pushConfigured()) {
    const error = new Error("VAPID keys are not configured.");
    error.status = 503;
    error.code = "push_not_configured";
    throw error;
  }

  const [subscriptions, items] = await Promise.all([
    listSubscriptionRecords(),
    listReminderSourceItems(now)
  ]);
  const reminders = dueReminders(items, now);
  let sent = 0;
  let removed = 0;

  for (const record of subscriptions) {
    if (!record.metadata.subscription || record.item.status === "비활성") continue;
    const metadata = {
      ...record.metadata,
      sent: pruneSentReminders(record.metadata.sent || {}, now)
    };
    let changed = false;
    let removeSubscription = false;

    for (const reminder of reminders) {
      if (metadata.sent[reminder.key]) continue;

      try {
        await sendPushNotification(record.metadata.subscription, reminder.payload);
        metadata.sent[reminder.key] = now.getTime();
        changed = true;
        sent += 1;
      } catch (error) {
        if (isExpiredSubscriptionError(error)) {
          removeSubscription = true;
          break;
        }
        throw error;
      }
    }

    if (removeSubscription) {
      await trashSubscriptionRecord(record.item.id);
      removed += 1;
      continue;
    }

    if (changed) {
      await updateSubscriptionMetadata(record.item.id, metadata);
    }
  }

  return {
    subscriptions: subscriptions.length,
    reminders: reminders.length,
    sent,
    removed
  };
}

async function sendPushNotification(subscription, payload) {
  const push = getWebPush();
  push.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:sephia-chord@example.com",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );

  return push.sendNotification(subscription, JSON.stringify(payload), {
    TTL: 60 * 60,
    urgency: "normal"
  });
}

function getWebPush() {
  if (webPush) return webPush;

  try {
    webPush = require("web-push");
    return webPush;
  } catch {
    const error = new Error("web-push dependency is not installed.");
    error.status = 500;
    error.code = "missing_web_push";
    throw error;
  }
}

async function listSubscriptionRecords() {
  const { schema, titleProperty } = await getDataSourceSchema();
  const results = [];
  let startCursor = undefined;

  do {
    const body = {
      page_size: 100,
      result_type: "page",
      filter: {
        property: "유형",
        select: {
          equals: SUBSCRIPTION_TYPE
        }
      },
      sorts: [
        { timestamp: "last_edited_time", direction: "descending" }
      ]
    };
    if (startCursor) body.start_cursor = startCursor;

    const payload = await notionRequest(`/data_sources/${getDataSourceId()}/query`, {
      method: "POST",
      body
    });
    results.push(...(payload.results || []));
    startCursor = payload.has_more ? payload.next_cursor : undefined;
  } while (startCursor);

  return results
    .filter((item) => item.object === "page" && !item.in_trash)
    .map((page) => normalizeItem(page, schema, titleProperty))
    .map((item) => ({
      item,
      metadata: parseSubscriptionMetadata(item.note)
    }))
    .filter((record) => record.metadata.kind === SUBSCRIPTION_NOTE_KIND && record.metadata.endpointHash);
}

async function findSubscriptionByEndpoint(endpoint) {
  const hash = endpointHash(endpoint);
  const records = await listSubscriptionRecords();
  return records.find((record) => record.metadata.endpointHash === hash) || null;
}

async function updateSubscriptionMetadata(pageId, metadata) {
  const { schema, titleProperty } = await getDataSourceSchema();
  await notionRequest(`/pages/${pageId}`, {
    method: "PATCH",
    body: {
      properties: buildNotionProperties({
        type: SUBSCRIPTION_TYPE,
        status: "활성",
        note: stringifySubscriptionMetadata(metadata)
      }, schema, titleProperty)
    }
  });
}

async function trashSubscriptionRecord(pageId) {
  await notionRequest(`/pages/${pageId}`, {
    method: "PATCH",
    body: { in_trash: true }
  });
}

async function listReminderSourceItems(now = new Date()) {
  const start = kstDateString(now);
  const end = addDays(start, 1);
  const { schema, titleProperty } = await getDataSourceSchema();
  const results = [];
  let startCursor = undefined;

  do {
    const body = {
      page_size: 100,
      result_type: "page",
      filter: {
        or: [
          {
            property: "날짜",
            date: {
              on_or_after: start,
              on_or_before: end
            }
          },
          {
            property: "유형",
            select: {
              equals: "루틴"
            }
          },
          {
            property: "유형",
            select: {
              equals: "고정일정"
            }
          }
        ]
      },
      sorts: [
        { property: "날짜", direction: "ascending" },
        { property: "시작", direction: "ascending" }
      ]
    };
    if (startCursor) body.start_cursor = startCursor;

    const payload = await notionRequest(`/data_sources/${getDataSourceId()}/query`, {
      method: "POST",
      body
    });
    results.push(...(payload.results || []));
    startCursor = payload.has_more ? payload.next_cursor : undefined;
  } while (startCursor);

  return results
    .filter((item) => item.object === "page" && !item.in_trash)
    .map((item) => normalizeItem(item, schema, titleProperty));
}

function dueReminders(items, now = new Date()) {
  const today = kstDateString(now);
  const dates = [today, addDays(today, 1)];
  const lowerBound = now.getTime();
  const upperBound = lowerBound + REMINDER_WINDOW_MS;

  return dates
    .flatMap((date) => reminderItemsForDate(items, date))
    .map((item) => reminderFromItem(items, item))
    .filter(Boolean)
    .filter((reminder) => reminder.reminderAt >= lowerBound && reminder.reminderAt <= upperBound);
}

function reminderItemsForDate(items, date) {
  const datedItems = items.filter((item) =>
    (item.type === "일정" || item.type === "할일") &&
    item.date === date
  );
  const fixed = items
    .filter((item) => item.type === "고정일정" && isRoutineActive(item, date) && !recurringItemSkipped(items, item.id, date))
    .map((item) => ({ ...item, date, endDate: date }));
  const routines = items
    .filter((item) => item.type === "루틴" && isRoutineActive(item, date) && !recurringItemSkipped(items, item.id, date))
    .map((item) => ({
      ...item,
      date,
      startTime: item.startTime || "08:00",
      endTime: item.endTime || "09:00"
    }));

  return [...datedItems, ...fixed, ...routines];
}

function reminderFromItem(items, item) {
  if (!item || !isTimedReminderType(item.type) || !isTimeString(item.startTime)) return null;
  if (item.startTime === "00:00" && item.endTime === "24:00") return null;
  if (item.completed || item.status === "완료" || item.status === "취소") return null;
  if (item.type === "루틴" && routineRecord(items, item.id, item.date)?.completed) return null;

  const startsAt = new Date(`${item.date}T${item.startTime}:00${TIME_ZONE_OFFSET}`).getTime();
  if (!Number.isFinite(startsAt)) return null;
  const reminderAt = startsAt - REMINDER_LEAD_MINUTES * 60 * 1000;
  const key = `${item.date}|${item.id}|${item.startTime}|${REMINDER_LEAD_MINUTES}`;

  return {
    key,
    reminderAt,
    payload: {
      title: `${item.title || "Untitled"} starts in 30 min`,
      body: [
        displayType(item.type),
        item.date,
        item.startTime
      ].filter(Boolean).join(" · "),
      tag: `sephia-reminder-${key}`,
      data: {
        id: item.id,
        date: item.date,
        type: item.type
      }
    }
  };
}

function normalizeSubscriptionMetadata(previous, subscription) {
  const now = new Date().toISOString();
  return {
    kind: SUBSCRIPTION_NOTE_KIND,
    endpointHash: endpointHash(subscription.endpoint),
    subscription,
    createdAt: previous.createdAt || now,
    updatedAt: now,
    sent: pruneSentReminders(previous.sent || {})
  };
}

function parseSubscriptionMetadata(note) {
  try {
    const metadata = JSON.parse(note || "{}");
    return metadata && typeof metadata === "object" ? metadata : {};
  } catch {
    return {};
  }
}

function stringifySubscriptionMetadata(metadata) {
  const compact = {
    ...metadata,
    sent: pruneSentReminders(metadata.sent || {})
  };
  return JSON.stringify(compact);
}

function pruneSentReminders(sent, now = new Date()) {
  const cutoff = now.getTime() - SENT_RETENTION_MS;
  return Object.entries(sent || {})
    .filter(([, value]) => Number(value || 0) >= cutoff)
    .sort((left, right) => Number(right[1] || 0) - Number(left[1] || 0))
    .slice(0, SENT_MAX_KEYS)
    .reduce((next, [key, value]) => {
      next[key] = Number(value || 0);
      return next;
    }, {});
}

function validateSubscription(subscription) {
  if (!subscription || typeof subscription !== "object" || !subscription.endpoint) {
    const error = new Error("Missing push subscription.");
    error.status = 400;
    error.code = "missing_subscription";
    throw error;
  }

  if (!subscription.keys || !subscription.keys.p256dh || !subscription.keys.auth) {
    const error = new Error("Invalid push subscription.");
    error.status = 400;
    error.code = "invalid_subscription";
    throw error;
  }
}

function endpointHash(endpoint) {
  return crypto.createHash("sha256").update(String(endpoint || "")).digest("base64url");
}

function isExpiredSubscriptionError(error) {
  return error && (error.statusCode === 404 || error.statusCode === 410);
}

function isTimedReminderType(type) {
  return type === "일정" || type === "할일" || type === "루틴" || type === "고정일정";
}

function isRoutineActive(routine, date) {
  if (!routine.repeatDays || routine.repeatDays.length === 0) return true;
  return routine.repeatDays.includes(ROUTINE_DAYS[new Date(`${date}T00:00:00${TIME_ZONE_OFFSET}`).getDay()]);
}

function recurringItemSkipped(items, itemId, date) {
  return routineRecord(items, itemId, date)?.status === "취소";
}

function routineRecord(items, routineId, date) {
  return items.find((item) => item.type === "루틴기록" && item.sourceRoutineId === routineId && item.date === date);
}

function displayType(type) {
  return {
    "일정": "Event",
    "고정일정": "Fixed",
    "할일": "Task",
    "루틴": "Routine"
  }[type] || type || "";
}

function isTimeString(value) {
  return /^([01]\d|2[0-4]):[0-5]\d$/.test(String(value || ""));
}

function kstDateString(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year").value;
  const month = parts.find((part) => part.type === "month").value;
  const day = parts.find((part) => part.type === "day").value;
  return `${year}-${month}-${day}`;
}

function addDays(date, amount) {
  const [year, month, day] = String(date || "").split("-").map(Number);
  if (!year || !month || !day) return date;
  const next = new Date(Date.UTC(year, month - 1, day + amount));
  return next.toISOString().slice(0, 10);
}

module.exports = {
  deletePushSubscription,
  pushConfigured,
  pushPublicConfig,
  savePushSubscription,
  sendDuePushReminders
};
