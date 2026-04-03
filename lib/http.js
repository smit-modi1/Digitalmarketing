function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

function getSearchParam(req, key) {
  if (req.query && typeof req.query[key] !== "undefined") {
    const value = req.query[key];
    return Array.isArray(value) ? String(value[0] || "") : String(value || "");
  }

  try {
    const url = new URL(req.url, "http://localhost");
    return url.searchParams.get(key) || "";
  } catch {
    return "";
  }
}

function readJsonBody(req) {
  if (req.body && typeof req.body === "object") {
    return Promise.resolve(req.body);
  }

  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 5 * 1024 * 1024) {
        reject(new Error("Request body is too large."));
        req.destroy();
      }
    });

    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Invalid JSON body."));
      }
    });

    req.on("error", reject);
  });
}

module.exports = {
  getSearchParam,
  readJsonBody,
  sendJson,
};
