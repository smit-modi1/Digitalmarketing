const crypto = require("crypto");

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const defaultUser = {
  id: "master-admin",
  username: process.env.ADMIN_USERNAME || "masteradmin",
  name: "Master Admin",
  role: "master_admin",
};

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "admin123";
}

function getSessionSecret() {
  return process.env.SESSION_SECRET || "point-marketing-demo-session-secret";
}

function verifyAdminCredentials(username, password) {
  const candidate = String(username || "").trim().toLowerCase();
  if (candidate !== defaultUser.username.toLowerCase()) return null;
  if (String(password || "") !== getAdminPassword()) return null;
  return { ...defaultUser };
}

function createSessionToken(user) {
  const payload = {
    user,
    exp: Date.now() + SESSION_TTL_MS,
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", getSessionSecret()).update(encodedPayload).digest("base64url");
  return `${encodedPayload}.${signature}`;
}

function verifySessionToken(token) {
  if (!token || !token.includes(".")) return null;

  const [encodedPayload, signature] = String(token).split(".");
  const expectedSignature = crypto.createHmac("sha256", getSessionSecret()).update(encodedPayload).digest("base64url");

  if (!safeEqual(signature, expectedSignature)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
    if (!payload || payload.exp < Date.now()) return null;
    if (!payload.user || payload.user.role !== "master_admin") return null;
    return payload.user;
  } catch {
    return null;
  }
}

function getBearerToken(req) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return "";
  return header.slice(7).trim();
}

function getSessionUser(req) {
  return verifySessionToken(getBearerToken(req));
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left || ""));
  const rightBuffer = Buffer.from(String(right || ""));
  if (leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

module.exports = {
  createSessionToken,
  getSessionUser,
  verifyAdminCredentials,
};
