const { getSessionUser } = require("../lib/auth");
const { sendJson } = require("../lib/http");

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method not allowed." });
    return;
  }

  const user = getSessionUser(req);
  if (!user) {
    sendJson(res, 403, { error: "Admin access required." });
    return;
  }

  sendJson(res, 200, { user });
};
