const crypto = require("crypto");

const { getSessionUser, hasPermission } = require("../lib/auth");
const { getSearchParam, readJsonBody, sendJson } = require("../lib/http");
const { getSubscribers, saveSubscribers } = require("../lib/store");

module.exports = async (req, res) => {
  try {
    if (req.method === "GET") {
      const user = getSessionUser(req);
      if (!hasPermission(user, "viewSubscribers")) {
        sendJson(res, 403, { error: "Admin access required." });
        return;
      }

      const subscribers = await getSubscribers();
      sendJson(res, 200, { subscribers });
      return;
    }

    if (req.method === "POST") {
      const body = await readJsonBody(req);
      const entry = validateSubscriber(body);
      const subscribers = await getSubscribers();
      const existing = subscribers.find((item) => item.email === entry.email);

      if (existing) {
        existing.active = true;
        existing.name = entry.name || existing.name;
        existing.updatedAt = new Date().toISOString();
        await saveSubscribers(subscribers);
        sendJson(res, 200, { subscriber: existing, message: "You are already subscribed." });
        return;
      }

      entry.id = crypto.randomUUID();
      entry.createdAt = new Date().toISOString();
      entry.updatedAt = entry.createdAt;
      subscribers.unshift(entry);
      await saveSubscribers(subscribers);
      sendJson(res, 201, { subscriber: entry, message: "Subscription confirmed." });
      return;
    }

    if (req.method === "DELETE") {
      const user = getSessionUser(req);
      if (!hasPermission(user, "manageNewsletter")) {
        sendJson(res, 403, { error: "Master admin access required." });
        return;
      }

      const subscriberId = getSearchParam(req, "id");
      if (!subscriberId) {
        sendJson(res, 400, { error: "Subscriber id is required." });
        return;
      }

      const subscribers = await getSubscribers();
      const index = subscribers.findIndex((item) => item.id === subscriberId);
      if (index === -1) {
        sendJson(res, 404, { error: "Subscriber not found." });
        return;
      }

      const [removed] = subscribers.splice(index, 1);
      await saveSubscribers(subscribers);
      sendJson(res, 200, { ok: true, subscriber: removed });
      return;
    }

    const user = getSessionUser(req);
    if (!hasPermission(user, "viewSubscribers")) {
      sendJson(res, 403, { error: "Admin access required." });
      return;
    }

    sendJson(res, 405, { error: "Method not allowed." });
  } catch (error) {
    sendJson(res, 400, { error: error.message || "Could not manage subscribers." });
  }
};

function validateSubscriber(input) {
  const subscriber = {
    name: String(input.name || "").trim(),
    email: String(input.email || "").trim().toLowerCase(),
    active: true,
  };

  if (!subscriber.email || !subscriber.email.includes("@")) throw new Error("A valid email is required.");
  return subscriber;
}
