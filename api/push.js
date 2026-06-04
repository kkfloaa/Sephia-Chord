const {
  handleError,
  json,
  methodNotAllowed,
  readJson,
  requireAuth
} = require("./_lib");
const {
  deletePushSubscription,
  pushConfigured,
  pushPublicConfig,
  savePushSubscription
} = require("./_reminders");

module.exports = async function handler(req, res) {
  if (!requireAuth(req, res)) return;

  try {
    if (req.method === "GET") {
      json(res, 200, pushPublicConfig());
      return;
    }

    if (req.method === "POST") {
      if (!pushConfigured()) {
        json(res, 503, {
          error: "push_not_configured",
          message: "VAPID keys are not configured."
        });
        return;
      }

      const body = await readJson(req);
      const item = await savePushSubscription(body.subscription);
      json(res, 200, { ok: true, id: item.id });
      return;
    }

    if (req.method === "DELETE") {
      const body = await readJson(req);
      const removed = await deletePushSubscription(body.endpoint);
      json(res, 200, { ok: true, removed });
      return;
    }

    methodNotAllowed(res);
  } catch (error) {
    handleError(res, error);
  }
};
