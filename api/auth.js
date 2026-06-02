const {
  clearSessionCookie,
  handleError,
  isAuthenticated,
  json,
  methodNotAllowed,
  passwordMatches,
  readJson,
  setSessionCookie
} = require("./_lib");

const MAX_AUTH_FAILURES = 3;
const AUTH_LOCK_SECONDS = 60 * 10;
const attempts = new Map();

module.exports = async function handler(req, res) {
  try {
    if (req.method === "GET") {
      json(res, 200, { authenticated: isAuthenticated(req) });
      return;
    }

    if (req.method === "POST") {
      const body = await readJson(req);
      const key = clientKey(req);
      const attempt = attempts.get(key);

      if (attempt && attempt.lockUntil > Date.now()) {
        sendLocked(res, attempt.lockUntil);
        return;
      }

      if (!process.env.APP_PASSWORD) {
        json(res, 500, {
          error: "missing_app_password",
          message: "APP_PASSWORD is not configured."
        });
        return;
      }

      if (!/^\d{4}$/.test(String(body.password || "")) || !passwordMatches(body.password)) {
        const nextAttempt = registerFailure(key);
        if (nextAttempt.lockUntil > Date.now()) {
          sendLocked(res, nextAttempt.lockUntil);
          return;
        }

        json(res, 401, {
          error: "invalid_password",
          remainingAttempts: Math.max(0, MAX_AUTH_FAILURES - nextAttempt.count)
        });
        return;
      }

      attempts.delete(key);
      setSessionCookie(res);
      json(res, 200, { authenticated: true });
      return;
    }

    if (req.method === "DELETE") {
      clearSessionCookie(res);
      json(res, 200, { authenticated: false });
      return;
    }

    methodNotAllowed(res);
  } catch (error) {
    handleError(res, error);
  }
};

function registerFailure(key) {
  const current = attempts.get(key);
  const expiredLock = current && current.lockUntil && current.lockUntil <= Date.now();
  const count = !current || expiredLock ? 1 : current.count + 1;
  const next = {
    count,
    lockUntil: count >= MAX_AUTH_FAILURES ? Date.now() + AUTH_LOCK_SECONDS * 1000 : 0
  };
  attempts.set(key, next);
  return next;
}

function sendLocked(res, lockUntil) {
  const retryAfterSeconds = Math.max(1, Math.ceil((lockUntil - Date.now()) / 1000));
  res.setHeader("Retry-After", String(retryAfterSeconds));
  json(res, 429, {
    error: "login_locked",
    retryAfterSeconds,
    lockedUntil: new Date(lockUntil).toISOString()
  });
}

function clientKey(req) {
  const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  const ip = forwarded || req.socket?.remoteAddress || "unknown";
  const ua = String(req.headers["user-agent"] || "unknown").slice(0, 120);
  return `${ip}:${ua}`;
}
