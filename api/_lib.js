const crypto = require("crypto");

const DEFAULT_DATA_SOURCE_ID = "372e8d7a-8351-806b-ab7c-000b31321073";
const DEFAULT_NOTION_VERSION = "2026-03-11";
const DEFAULT_TIME_ZONE_OFFSET = "+09:00";
const SESSION_COOKIE = "daily_session";
const SESSION_AGE_SECONDS = 60 * 60 * 24 * 30;

let schemaCache = {
  expiresAt: 0,
  schema: null,
  titleProperty: null
};

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function methodNotAllowed(res) {
  json(res, 405, { error: "method_not_allowed" });
}

function readJson(req) {
  if (req.body && typeof req.body === "object") {
    return Promise.resolve(req.body);
  }

  if (typeof req.body === "string") {
    try {
      return Promise.resolve(JSON.parse(req.body || "{}"));
    } catch {
      return Promise.resolve({});
    }
  }

  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 1024 * 1024) {
        reject(new Error("Request body is too large."));
      }
    });
    req.on("end", () => {
      if (!data) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(data));
      } catch {
        resolve({});
      }
    });
    req.on("error", reject);
  });
}

function parseCookies(req) {
  return String(req.headers.cookie || "")
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((cookies, part) => {
      const index = part.indexOf("=");
      if (index === -1) return cookies;
      cookies[decodeURIComponent(part.slice(0, index))] = decodeURIComponent(part.slice(index + 1));
      return cookies;
    }, {});
}

function getSessionSecret() {
  return process.env.SESSION_SECRET || process.env.APP_PASSWORD || "local-development-secret";
}

function sign(value) {
  return crypto.createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

function createSessionToken() {
  const payload = Buffer.from(
    JSON.stringify({
      exp: Math.floor(Date.now() / 1000) + SESSION_AGE_SECONDS
    })
  ).toString("base64url");

  return `${payload}.${sign(payload)}`;
}

function verifySessionToken(token) {
  if (!token || !token.includes(".")) return false;
  const [payload, signature] = token.split(".");
  const expected = sign(payload);
  if (!safeEqual(signature, expected)) return false;

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return Number(session.exp || 0) > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

function safeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function passwordMatches(input) {
  const configured = process.env.APP_PASSWORD;
  if (!configured) return false;

  const left = crypto.createHash("sha256").update(String(input || "")).digest();
  const right = crypto.createHash("sha256").update(String(configured)).digest();
  return crypto.timingSafeEqual(left, right);
}

function setSessionCookie(res) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=${encodeURIComponent(createSessionToken())}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_AGE_SECONDS}${secure}`
  );
}

function clearSessionCookie(res) {
  res.setHeader("Set-Cookie", `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}

function isAuthenticated(req) {
  const cookies = parseCookies(req);
  return verifySessionToken(cookies[SESSION_COOKIE]);
}

function requireAuth(req, res) {
  if (isAuthenticated(req)) return true;
  json(res, 401, { error: "unauthorized" });
  return false;
}

function getDataSourceId() {
  return String(process.env.NOTION_DATA_SOURCE_ID || DEFAULT_DATA_SOURCE_ID).replace(/^collection:\/\//, "");
}

function getNotionVersion() {
  return process.env.NOTION_VERSION || DEFAULT_NOTION_VERSION;
}

function notionHeaders() {
  if (!process.env.NOTION_TOKEN) {
    const error = new Error("NOTION_TOKEN is not configured.");
    error.status = 500;
    error.code = "missing_notion_token";
    throw error;
  }

  return {
    Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
    "Content-Type": "application/json",
    "Notion-Version": getNotionVersion()
  };
}

async function notionRequest(path, options = {}) {
  const response = await fetch(`https://api.notion.com/v1${path}`, {
    method: options.method || "GET",
    headers: notionHeaders(),
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const text = await response.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = { raw: text };
  }

  if (!response.ok) {
    const error = new Error(payload && payload.message ? payload.message : "Notion request failed.");
    error.status = response.status;
    error.code = payload && payload.code ? payload.code : "notion_error";
    error.notion = payload;
    throw error;
  }

  return payload;
}

async function getDataSourceSchema() {
  if (schemaCache.schema && schemaCache.expiresAt > Date.now()) {
    return schemaCache;
  }

  const source = await notionRequest(`/data_sources/${getDataSourceId()}`);
  const schema = source.properties || {};
  const titleProperty =
    Object.entries(schema).find(([, property]) => property && property.type === "title")?.[0] ||
    ["이름", "제목", "Name", "Title"].find((name) => schema[name]) ||
    "제목";

  schemaCache = {
    expiresAt: Date.now() + 1000 * 60 * 5,
    schema,
    titleProperty
  };

  return schemaCache;
}

function hasProperty(schema, name) {
  return Boolean(schema && schema[name]);
}

function textProperty(content) {
  const value = String(content || "").trim();
  return value ? { rich_text: [{ text: { content: value } }] } : { rich_text: [] };
}

function titleProperty(content) {
  return { title: [{ text: { content: String(content || "").trim() || "제목 없음" } }] };
}

function selectProperty(value) {
  return value ? { select: { name: value } } : { select: null };
}

function multiSelectProperty(values) {
  return {
    multi_select: Array.isArray(values)
      ? values.filter(Boolean).map((name) => ({ name }))
      : []
  };
}

function checkboxProperty(value) {
  return { checkbox: Boolean(value) };
}

function dateProperty(value, isDateTime, end) {
  if (!value) return { date: null };
  return { date: end ? { start: value, end } : { start: value } };
}

function dateTimeWithOffset(date, time) {
  if (!date || !time) return null;
  const seconds = time.length === 5 ? `${time}:00` : time;
  return `${date}T${seconds}${process.env.NOTION_TIME_ZONE_OFFSET || DEFAULT_TIME_ZONE_OFFSET}`;
}

function buildNotionProperties(input, schema, detectedTitleProperty) {
  const properties = {};
  const titleName = detectedTitleProperty || "제목";

  if (input.title !== undefined) {
    properties[titleName] = titleProperty(input.title);
  }

  addIfPresent(properties, schema, "유형", input.type, selectProperty);
  if (input.date !== undefined && hasProperty(schema, "날짜")) {
    properties["날짜"] = dateProperty(input.date, false, input.endDate);
  }

  const timeDate = input.date || (input.type === "루틴" ? "2000-01-01" : undefined);
  const endTimeDate = input.endDate || input.date || (input.type === "루틴" ? "2000-01-01" : undefined);
  const start = input.start !== undefined ? input.start : dateTimeWithOffset(timeDate, input.startTime);
  const end = input.end !== undefined ? input.end : dateTimeWithOffset(endTimeDate, input.endTime);
  if (input.start !== undefined || input.startTime !== undefined) {
    addIfPresent(properties, schema, "시작", start, (value) => dateProperty(value, true));
  }
  if (input.end !== undefined || input.endTime !== undefined) {
    addIfPresent(properties, schema, "종료", end, (value) => dateProperty(value, true));
  }

  if (input.completed !== undefined && hasProperty(schema, "완료")) {
    properties["완료"] = checkboxProperty(input.completed);
  }

  addIfPresent(properties, schema, "상태", input.status, selectProperty);
  addIfPresent(properties, schema, "감정", input.emotion, selectProperty);
  addIfPresent(properties, schema, "기분", input.emotion, selectProperty);

  if (input.repeatDays !== undefined && hasProperty(schema, "반복요일")) {
    properties["반복요일"] = multiSelectProperty(input.repeatDays);
  }

  addIfPresent(properties, schema, "원본루틴", input.sourceRoutineId, textProperty);
  addIfPresent(properties, schema, "메모", input.note, textProperty);

  return properties;
}

function addIfPresent(target, schema, name, value, builder) {
  if (value === undefined || !hasProperty(schema, name)) return;
  target[name] = builder(value);
}

function plainText(property) {
  if (!property) return "";
  const values = property.title || property.rich_text || [];
  return values.map((item) => item.plain_text || item.text?.content || "").join("");
}

function selectName(property) {
  return property && property.select ? property.select.name : "";
}

function multiSelectNames(property) {
  return property && Array.isArray(property.multi_select)
    ? property.multi_select.map((item) => item.name)
    : [];
}

function checkboxValue(property) {
  return Boolean(property && property.checkbox);
}

function dateStart(property) {
  return property && property.date ? property.date.start || "" : "";
}

function dateEnd(property) {
  return property && property.date ? property.date.end || "" : "";
}

function normalizeDate(iso) {
  if (!iso) return "";
  if (!iso.includes("T")) return iso.slice(0, 10);
  return formatKoreanDate(new Date(iso));
}

function normalizeTime(iso) {
  if (!iso || !iso.includes("T")) return "";
  const offsetTime = iso.match(/T(\d{2}:\d{2})/);
  if (offsetTime && /[+-]\d{2}:\d{2}$/.test(iso)) return offsetTime[1];

  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  })
    .format(new Date(iso))
    .replace(/^24:/, "00:");
}

function formatKoreanDate(date) {
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

function normalizeItem(page, schema, detectedTitleProperty) {
  const properties = page.properties || {};
  const titleName =
    detectedTitleProperty ||
    Object.entries(properties).find(([, property]) => property && property.type === "title")?.[0] ||
    "제목";
  const type = selectName(properties["유형"]);
  const start = dateStart(properties["시작"]);
  const end = dateStart(properties["종료"]);
  const date = dateStart(properties["날짜"]) || (type === "루틴" ? "" : start);
  const endDate = dateEnd(properties["날짜"]);

  return {
    id: page.id,
    url: page.url,
    title: plainText(properties[titleName]),
    type,
    date: normalizeDate(date),
    endDate: normalizeDate(endDate),
    start,
    end,
    startTime: normalizeTime(start),
    endTime: normalizeTime(end),
    completed: checkboxValue(properties["완료"]),
    status: selectName(properties["상태"]),
    emotion: selectName(properties["감정"]) || selectName(properties["기분"]),
    mood: selectName(properties["감정"]) || selectName(properties["기분"]),
    repeatDays: multiSelectNames(properties["반복요일"]),
    sourceRoutineId: plainText(properties["원본루틴"]),
    note: plainText(properties["메모"]),
    createdTime: page.created_time,
    lastEditedTime: page.last_edited_time
  };
}

function handleError(res, error) {
  const status = error.status && error.status >= 400 ? error.status : 500;
  json(res, status, {
    error: error.code || "server_error",
    message: error.message || "Unexpected server error."
  });
}

module.exports = {
  buildNotionProperties,
  clearSessionCookie,
  getDataSourceId,
  getDataSourceSchema,
  getNotionVersion,
  handleError,
  isAuthenticated,
  json,
  methodNotAllowed,
  normalizeItem,
  notionRequest,
  passwordMatches,
  readJson,
  requireAuth,
  setSessionCookie
};
