const { buildWeeklyNewsletterPayload, getIsoWeekKey } = require("../../lib/newsletter");
const { sendNewsletterEmail } = require("../../lib/email");
const { sendJson } = require("../../lib/http");
const { getArticles, getNewsletterLogs, getSubscribers, saveNewsletterLogs, saveSubscribers } = require("../../lib/store");

module.exports = async (req, res) => {
  try {
    const cronHeader = req.headers["x-vercel-cron"] || "";
    const cronKey = req.query?.key || "";
    if (!cronHeader && (!process.env.CRON_SECRET || cronKey !== process.env.CRON_SECRET)) {
      sendJson(res, 403, { error: "Unauthorized cron request." });
      return;
    }

    const weekKey = getIsoWeekKey();
    const logs = await getNewsletterLogs();
    if (logs.some((item) => item.type === "weekly_digest" && item.weekKey === weekKey)) {
      sendJson(res, 200, { ok: true, skipped: true, reason: "Weekly newsletter already sent." });
      return;
    }

    const subscribers = (await getSubscribers()).filter((item) => item.active !== false);
    if (!subscribers.length) {
      sendJson(res, 200, { ok: true, skipped: true, reason: "No subscribers." });
      return;
    }

    const articles = (await getArticles()).filter((item) => item.status === "published");
    const campaign = {
      type: "weekly_digest",
      weekKey,
      createdAt: new Date().toISOString(),
      ...buildWeeklyNewsletterPayload(articles),
    };

    let sentCount = 0;
    for (const subscriber of subscribers) {
      const delivered = await sendNewsletterEmail(subscriber, campaign).catch(() => false);
      if (delivered) {
        sentCount += 1;
        subscriber.lastSentAt = campaign.createdAt;
      }
    }

    logs.unshift({
      ...campaign,
      subscriberCount: subscribers.length,
      deliveredCount: sentCount,
    });

    await Promise.all([saveNewsletterLogs(logs), saveSubscribers(subscribers)]);
    sendJson(res, 200, { ok: true, sentCount, subscriberCount: subscribers.length });
  } catch (error) {
    sendJson(res, 400, { error: error.message || "Could not run weekly newsletter." });
  }
};
