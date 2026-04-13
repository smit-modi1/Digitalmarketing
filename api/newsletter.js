const crypto = require("crypto");

const { getSessionUser, hasPermission } = require("../lib/auth");
const { buildWeeklyNewsletterPayload, getIsoWeekKey } = require("../lib/newsletter");
const { sendNewsletterEmail } = require("../lib/email");
const { readJsonBody, sendJson } = require("../lib/http");
const { getArticles, getNewsletterLogs, getSubscribers, saveNewsletterLogs, saveSubscribers } = require("../lib/store");

module.exports = async (req, res) => {
  try {
    const user = getSessionUser(req);
    if (!hasPermission(user, "manageNewsletter")) {
      sendJson(res, 403, { error: "Master admin access required." });
      return;
    }

    if (req.method === "GET") {
      const [subscribers, logs] = await Promise.all([getSubscribers(), getNewsletterLogs()]);
      sendJson(res, 200, { subscribers, logs });
      return;
    }

    if (req.method === "POST") {
      const body = await readJsonBody(req);
      const mode = String(body.mode || "custom").trim();
      const subscribers = (await getSubscribers()).filter((item) => item.active !== false);

      if (!subscribers.length) {
        throw new Error("There are no active newsletter subscribers yet.");
      }

      let campaign;
      if (mode === "weekly_digest") {
        const articles = (await getArticles()).filter((item) => item.status === "published");
        campaign = {
          id: crypto.randomUUID(),
          type: "weekly_digest",
          weekKey: getIsoWeekKey(),
          createdAt: new Date().toISOString(),
          ...buildWeeklyNewsletterPayload(articles),
        };
      } else {
        campaign = {
          id: crypto.randomUUID(),
          type: "manual",
          createdAt: new Date().toISOString(),
          subject: String(body.subject || "").trim(),
          body: String(body.body || "").trim(),
        };
      }

      if (!campaign.subject) throw new Error("Newsletter subject is required.");
      if (!campaign.body) throw new Error("Newsletter body is required.");

      let sentCount = 0;
      for (const subscriber of subscribers) {
        const delivered = await sendNewsletterEmail(subscriber, campaign).catch(() => false);
        if (delivered) {
          sentCount += 1;
          subscriber.lastSentAt = campaign.createdAt;
        }
      }

      const logs = await getNewsletterLogs();
      logs.unshift({
        ...campaign,
        subscriberCount: subscribers.length,
        deliveredCount: sentCount,
      });
      await Promise.all([saveNewsletterLogs(logs), saveSubscribers(subscribers)]);

      sendJson(res, 200, {
        ok: true,
        campaign: logs[0],
        smtpConfigured: sentCount > 0,
      });
      return;
    }

    sendJson(res, 405, { error: "Method not allowed." });
  } catch (error) {
    sendJson(res, 400, { error: error.message || "Could not send newsletter." });
  }
};
