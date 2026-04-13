const crypto = require("crypto");

const { getAdminUsers } = require("./store");
const { buildDefaultPermissions } = require("./user-seed");

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

function getMasterAdmin() {
  return {
    id: "master-admin",
    username: process.env.ADMIN_USERNAME || "masteradmin",
    email: process.env.ADMIN_EMAIL || "info.dailydealsuk@gmail.com",
    name: "Master Admin",
    contactNumber: process.env.ADMIN_CONTACT_NUMBER || "",
    role: "master_admin",
    permissions: {
      manageProducts: true,
      manageArticles: true,
      manageUsers: true,
      manageNewsletter: true,
      viewMessages: true,
      viewSubscribers: true,
    },
  };
}

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "admin123";
}

function getSessionSecret() {
  return process.env.SESSION_SECRET || "dailydealsuk-demo-session-secret";
}

async function verifyAdminCredentials(username, password) {
  const candidate = String(username || "").trim().toLowerCase();
  const masterUser = getMasterAdmin();

  if (candidate === masterUser.username.toLowerCase() || candidate === masterUser.email.toLowerCase()) {
    if (String(password || "") === getAdminPassword()) {
      return { ...masterUser };
    }
  }

  const users = await getAdminUsers();
  const match = users.find((item) => item.active !== false && [item.username, item.email].filter(Boolean).some((value) => String(value).toLowerCase() === candidate));
  if (!match) return null;
  if (!verifyPassword(password, match.passwordHash, match.passwordSalt)) return null;
  return sanitiseUser(match);
}

function createSessionToken(user) {
  const payload = {
    user: sanitiseUser(user),
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
    if (!payload.user || !["master_admin", "sub_admin"].includes(payload.user.role)) return null;
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

function hasPermission(user, permissionKey) {
  if (!user) return false;
  if (user.role === "master_admin") return true;
  return Boolean(user.permissions && user.permissions[permissionKey]);
}

function buildSubAdminRecord(input) {
  const email = String(input.email || "").trim().toLowerCase();
  const password = String(input.password || "");
  const record = {
    id: crypto.randomUUID(),
    username: String(input.username || email).trim().toLowerCase(),
    email,
    name: String(input.name || "").trim(),
    contactNumber: String(input.contactNumber || "").trim(),
    role: "sub_admin",
    active: true,
    permissions: {
      ...buildDefaultPermissions(),
    },
    createdAt: new Date().toISOString(),
  };

  if (!record.name) throw new Error("Sub-admin name is required.");
  if (!record.contactNumber) throw new Error("Contact number is required.");
  if (!record.email || !record.email.includes("@")) throw new Error("A valid email is required.");
  if (password.length < 8) throw new Error("Password must be at least 8 characters.");

  const passwordData = hashPassword(password);
  return {
    ...record,
    passwordHash: passwordData.hash,
    passwordSalt: passwordData.salt,
  };
}

function sanitiseUser(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    contactNumber: user.contactNumber || "",
    role: user.role,
    active: user.active !== false,
    permissions: user.permissions || buildDefaultPermissions(),
  };
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(String(password || ""), salt, 64).toString("hex");
  return { hash, salt };
}

function verifyPassword(password, storedHash, salt) {
  if (!storedHash || !salt) return false;
  const candidateHash = crypto.scryptSync(String(password || ""), salt, 64).toString("hex");
  return safeEqual(candidateHash, storedHash);
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left || ""));
  const rightBuffer = Buffer.from(String(right || ""));
  if (leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

module.exports = {
  buildSubAdminRecord,
  createSessionToken,
  getMasterAdmin,
  getSessionUser,
  hasPermission,
  sanitiseUser,
  verifyAdminCredentials,
};
