const { sendJson } = require("../lib/http");

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method not allowed." });
    return;
  }

  sendJson(res, 200, {
    ok: true,
    runtime: "vercel-functions",
    date: new Date().toISOString(),
  });
};
