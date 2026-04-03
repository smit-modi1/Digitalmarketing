const crypto = require("crypto");

const { getSessionUser } = require("../lib/auth");
const { readJsonBody, sendJson } = require("../lib/http");
const { getMessages, saveMessages } = require("../lib/store");

module.exports = async (req, res) => {
  try {
    if (req.method === "GET") {
      const user = getSessionUser(req);
      if (!user || user.role !== "master_admin") {
        sendJson(res, 403, { error: "Admin access required." });
        return;
      }

      sendJson(res, 200, { messages: await getMessages() });
      return;
    }

    if (req.method === "POST") {
      const body = await readJsonBody(req);
      const message = validateMessage(body);
      message.id = crypto.randomUUID();
      message.createdAt = new Date().toISOString();

      const messages = await getMessages();
      messages.unshift(message);
      await saveMessages(messages);
      sendJson(res, 201, { ok: true, message });
      return;
    }

    sendJson(res, 405, { error: "Method not allowed." });
  } catch (error) {
    sendJson(res, 400, { error: error.message || "Could not send message." });
  }
};

function validateMessage(input) {
  const message = {
    name: String(input.name || "").trim(),
    email: String(input.email || "").trim(),
    subject: String(input.subject || "").trim(),
    message: String(input.message || "").trim(),
  };

  if (!message.name) throw new Error("Name is required.");
  if (!message.email || !message.email.includes("@")) throw new Error("A valid email is required.");
  if (!message.subject) throw new Error("Subject is required.");
  if (!message.message || message.message.length < 10) throw new Error("Message must be at least 10 characters.");

  return message;
}
