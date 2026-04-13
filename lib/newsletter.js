const { siteConfig } = require("./site-config");

function buildWeeklyNewsletterPayload(articles) {
  const featuredArticles = Array.isArray(articles) ? articles.slice(0, 4) : [];
  const weekLabel = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return {
    subject: `${siteConfig.brandName} weekly picks for ${weekLabel}`,
    body: [
      `Hello from ${siteConfig.brandName},`,
      "",
      "Here are this week's useful buying guides and product roundups:",
      "",
      ...featuredArticles.map(
        (article, index) =>
          `${index + 1}. ${article.title}\n${article.summary}\n${siteConfig.publicUrl}/article.html?slug=${article.slug}`,
      ),
      "",
      `You are receiving this email because you subscribed on ${siteConfig.brandName}.`,
      `If you no longer want these updates, reply to ${siteConfig.contactEmail}.`,
    ].join("\n"),
  };
}

function getIsoWeekKey(date = new Date()) {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNumber = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNumber);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil(((target - yearStart) / 86400000 + 1) / 7);
  return `${target.getUTCFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
}

module.exports = {
  buildWeeklyNewsletterPayload,
  getIsoWeekKey,
};
