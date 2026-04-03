let transporter;

function getInboxAddress() {
  return process.env.CONTACT_INBOX_EMAIL || "info.intellicons@gmail.com";
}

function getMailer() {
  if (typeof transporter !== "undefined") return transporter;

  const user = process.env.EMAIL_SMTP_USER || getInboxAddress();
  const pass = process.env.EMAIL_SMTP_PASS || "";

  if (!pass) {
    transporter = null;
    return transporter;
  }

  const nodemailer = require("nodemailer");
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });

  return transporter;
}

async function sendContactEmail(message) {
  const mailer = getMailer();
  if (!mailer) return false;

  const recipient = getInboxAddress();
  const sender = process.env.EMAIL_SMTP_USER || recipient;

  await mailer.sendMail({
    from: `"Intellicons Website" <${sender}>`,
    to: recipient,
    replyTo: message.email,
    subject: `[Intellicons] ${message.subject}`,
    text: [
      `Name: ${message.name}`,
      `Email: ${message.email}`,
      "",
      message.message,
      "",
      `Sent at: ${message.createdAt}`,
    ].join("\n"),
  });

  return true;
}

module.exports = {
  getInboxAddress,
  sendContactEmail,
};
