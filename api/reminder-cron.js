const {
  handleError,
  json,
  methodNotAllowed
} = require("./_lib");
const {
  sendDuePushReminders
} = require("./_reminders");

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "GET" && req.method !== "POST") {
      methodNotAllowed(res);
      return;
    }

    if (!cronAuthorized(req)) {
      json(res, 401, { error: "unauthorized" });
      return;
    }

    const result = await sendDuePushReminders();
    json(res, 200, { ok: true, ...result });
  } catch (error) {
    handleError(res, error);
  }
};

function cronAuthorized(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret && process.env.NODE_ENV !== "production") return true;
  if (!secret) return false;
  return String(req.headers.authorization || "") === `Bearer ${secret}`;
}
