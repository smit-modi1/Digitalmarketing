const { createSessionToken, verifyAdminCredentials } = require("../lib/auth");
const { readJsonBody, sendJson } = require("../lib/http");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed." });
    return;
  }

  try {
    const body = await readJsonBody(req);
    const user = await verifyAdminCredentials(body.username, body.password);

    if (!user) {
      sendJson(res, 401, { error: "Invalid username or password." });
      return;
    }

    sendJson(res, 200, {
      token: createSessionToken(user),
      user,
    });
  } catch (error) {
    sendJson(res, 400, { error: error.message || "Login failed." });
  }
};
