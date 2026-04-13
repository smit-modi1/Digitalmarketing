const siteConfig = {
  brandName: "DailyDealsUK",
  siteLabel: "dailydealsuk.com",
  publicUrl: process.env.PUBLIC_SITE_URL || "https://point-marketing-uk.vercel.app",
  contactEmail: process.env.CONTACT_INBOX_EMAIL || "info.dailydealsuk@gmail.com",
};

module.exports = {
  siteConfig,
};
