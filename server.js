const fs = require("fs");
const http = require("http");
const path = require("path");

loadEnv(".env.local");
loadEnv(".env");

const publicDir = path.join(__dirname, "public");
const apiHandlers = {
  "/api/auth": require("./api/auth"),
  "/api/health": require("./api/health"),
  "/api/items": require("./api/items")
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");

  if (apiHandlers[url.pathname]) {
    await apiHandlers[url.pathname](req, res);
    return;
  }

  serveStatic(url.pathname, res);
});

const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "127.0.0.1";
server.listen(port, host, () => {
  console.log(`Sephia Chord is running at http://${host}:${port}`);
});

function serveStatic(urlPath, res) {
  const safePath = urlPath === "/" ? "/index.html" : urlPath;
  const filePath = path.normalize(path.join(publicDir, safePath));

  if (!filePath.startsWith(publicDir)) {
    res.statusCode = 403;
    res.end("Forbidden");
    return;
  }

  const target = fs.existsSync(filePath) && fs.statSync(filePath).isFile()
    ? filePath
    : path.join(publicDir, "index.html");

  fs.readFile(target, (error, data) => {
    if (error) {
      res.statusCode = 404;
      res.end("Not found");
      return;
    }

    res.setHeader("Content-Type", contentType(target));
    res.end(data);
  });
}

function contentType(filePath) {
  const ext = path.extname(filePath);
  return {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8"
  }[ext] || "text/plain; charset=utf-8";
}

function loadEnv(fileName) {
  const envPath = path.join(__dirname, fileName);
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#")) continue;
    const index = line.indexOf("=");
    if (index === -1) continue;
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim();
    if (key && process.env[key] === undefined) {
      process.env[key] = value.replace(/^["']|["']$/g, "");
    }
  }
}
