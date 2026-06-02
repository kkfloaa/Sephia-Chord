const {
  buildNotionProperties,
  getDataSourceId,
  getDataSourceSchema,
  handleError,
  json,
  methodNotAllowed,
  normalizeItem,
  notionRequest,
  readJson,
  requireAuth
} = require("./_lib");

module.exports = async function handler(req, res) {
  if (!requireAuth(req, res)) return;

  try {
    if (req.method === "GET") {
      await listItems(req, res);
      return;
    }

    if (req.method === "POST") {
      await createItem(req, res);
      return;
    }

    if (req.method === "PATCH") {
      await updateItem(req, res);
      return;
    }

    if (req.method === "DELETE") {
      await trashItem(req, res);
      return;
    }

    methodNotAllowed(res);
  } catch (error) {
    handleError(res, error);
  }
};

async function listItems(req, res) {
  const url = new URL(req.url, "http://localhost");
  const start = url.searchParams.get("start");
  const end = url.searchParams.get("end");
  const { schema, titleProperty } = await getDataSourceSchema();
  const results = [];
  let startCursor = undefined;

  do {
    const body = {
      page_size: 100,
      result_type: "page",
      sorts: [
        { property: "날짜", direction: "ascending" },
        { property: "시작", direction: "ascending" }
      ]
    };

    if (start && end) {
      body.filter = {
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
          }
        ]
      };
    }

    if (startCursor) body.start_cursor = startCursor;

    const payload = await notionRequest(`/data_sources/${getDataSourceId()}/query`, {
      method: "POST",
      body
    });

    results.push(...(payload.results || []));
    startCursor = payload.has_more ? payload.next_cursor : undefined;
  } while (startCursor);

  json(res, 200, {
    items: results
      .filter((item) => item.object === "page" && !item.in_trash)
      .map((item) => normalizeItem(item, schema, titleProperty))
  });
}

async function createItem(req, res) {
  const body = sanitizePayload(await readJson(req));
  const { schema, titleProperty } = await getDataSourceSchema();

  if (!body.title) {
    json(res, 400, { error: "missing_title" });
    return;
  }

  if (!body.type) {
    json(res, 400, { error: "missing_type" });
    return;
  }

  if (body.type === "감정" && body.date) {
    await upsertEmotionItem(res, body, schema, titleProperty);
    return;
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

  json(res, 201, { item: normalizeItem(payload, schema, titleProperty) });
}

async function upsertEmotionItem(res, body, schema, titleProperty) {
  const existing = await findEmotionPagesByDate(body.date);

  if (existing.length) {
    const [primary, ...duplicates] = existing;
    const payload = await notionRequest(`/pages/${primary.id}`, {
      method: "PATCH",
      body: {
        properties: buildNotionProperties(body, schema, titleProperty)
      }
    });

    await trashDuplicatePages(duplicates);
    json(res, 200, { item: normalizeItem(payload, schema, titleProperty), deduped: duplicates.length });
    return;
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

  json(res, 201, { item: normalizeItem(payload, schema, titleProperty) });
}

async function findEmotionPagesByDate(date) {
  const payload = await notionRequest(`/data_sources/${getDataSourceId()}/query`, {
    method: "POST",
    body: {
      page_size: 100,
      result_type: "page",
      filter: {
        and: [
          {
            property: "날짜",
            date: {
              equals: date
            }
          },
          {
            or: [
              {
                property: "유형",
                select: {
                  equals: "감정"
                }
              },
              {
                property: "유형",
                select: {
                  equals: "기분"
                }
              }
            ]
          }
        ]
      },
      sorts: [
        { timestamp: "last_edited_time", direction: "descending" }
      ]
    }
  });

  return (payload.results || []).filter((item) => item.object === "page" && !item.in_trash);
}

async function trashDuplicatePages(pages) {
  await Promise.all(
    pages.map((page) =>
      notionRequest(`/pages/${page.id}`, {
        method: "PATCH",
        body: { in_trash: true }
      })
    )
  );
}

async function updateItem(req, res) {
  const body = sanitizePayload(await readJson(req), true);
  const { schema, titleProperty } = await getDataSourceSchema();

  if (!body.id) {
    json(res, 400, { error: "missing_id" });
    return;
  }

  const properties = buildNotionProperties(body, schema, titleProperty);
  if (Object.keys(properties).length === 0) {
    json(res, 400, { error: "nothing_to_update" });
    return;
  }

  const payload = await notionRequest(`/pages/${body.id}`, {
    method: "PATCH",
    body: { properties }
  });

  json(res, 200, { item: normalizeItem(payload, schema, titleProperty) });
}

async function trashItem(req, res) {
  const url = new URL(req.url, "http://localhost");
  const body = await readJson(req);
  const id = body.id || url.searchParams.get("id");

  if (!id) {
    json(res, 400, { error: "missing_id" });
    return;
  }

  await notionRequest(`/pages/${id}`, {
    method: "PATCH",
    body: { in_trash: true }
  });

  json(res, 200, { ok: true });
}

function sanitizePayload(input, isPatch) {
  const allowedTypes = new Set(["일정", "할일", "루틴", "루틴기록", "감정", "기분"]);
  const allowedStatuses = new Set(["예정", "진행", "완료", "보류", "취소"]);
  const allowedDays = new Set(["월", "화", "수", "목", "금", "토", "일"]);
  const allowedEmotions = new Set([
    "빨강 5",
    "빨강 4",
    "빨강 3",
    "빨강 2",
    "빨강 1",
    "파랑 5",
    "파랑 4",
    "파랑 3",
    "파랑 2",
    "파랑 1",
    "초록 5",
    "초록 4",
    "초록 3",
    "초록 2",
    "초록 1"
  ]);
  const body = {};

  if (input.id !== undefined) body.id = String(input.id);
  if (input.title !== undefined) body.title = String(input.title).trim();
  if (input.type !== undefined && allowedTypes.has(input.type)) body.type = input.type;
  if (input.date !== undefined && isDate(input.date)) body.date = input.date;
  if (input.endDate !== undefined && isDate(input.endDate)) body.endDate = input.endDate;
  if (input.startTime !== undefined && isTime(input.startTime)) body.startTime = input.startTime;
  if (input.endTime !== undefined && isTime(input.endTime)) body.endTime = input.endTime;
  if (input.completed !== undefined) body.completed = Boolean(input.completed);
  if (input.status !== undefined && allowedStatuses.has(input.status)) body.status = input.status;
  const hasEmotionInput = input.emotion !== undefined || input.mood !== undefined;
  const emotion = input.emotion !== undefined ? input.emotion : input.mood;
  const normalizedEmotion = normalizeEmotionValue(emotion);
  if (hasEmotionInput && (emotion === null || String(emotion).trim() === "")) {
    body.emotion = "";
  } else if (normalizedEmotion !== undefined && allowedEmotions.has(normalizedEmotion)) {
    body.emotion = normalizedEmotion;
  }
  if (input.note !== undefined) body.note = String(input.note).slice(0, 2000);
  if (input.sourceRoutineId !== undefined) body.sourceRoutineId = String(input.sourceRoutineId);

  if (Array.isArray(input.repeatDays)) {
    body.repeatDays = input.repeatDays.filter((day) => allowedDays.has(day));
  }

  if (!isPatch) {
    if (body.type === "일정") {
      body.status = body.status || "예정";
    }
    if (body.type === "할일") {
      body.status = body.completed ? "완료" : body.status || "예정";
    }
    if (body.type === "루틴") {
      body.status = body.status || "진행";
    }
    if (body.type === "루틴기록") {
      body.status = body.completed ? "완료" : "예정";
    }
    if (body.type === "기분") {
      body.type = "감정";
    }
    if (body.type === "감정") {
      body.status = "완료";
      body.completed = true;
    }
  }

  return body;
}

function isDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value));
}

function isTime(value) {
  return /^\d{2}:\d{2}$/.test(String(value));
}

function normalizeEmotionValue(value) {
  return {
    "나쁨": "빨강 3",
    "애매함": "파랑 3",
    "좋음": "초록 3"
  }[value] || value;
}
