const fs = require("fs");
const path = require("path");

const { fallbackArticles } = require("./article-seed");
const { fallbackProducts } = require("./seed-data");

const dataDir = path.join(process.cwd(), "data");
const localProductsFile = path.join(dataDir, "products.json");
const localMessagesFile = path.join(dataDir, "messages.json");
const localArticlesFile = path.join(dataDir, "articles.json");
const localAdminUsersFile = path.join(dataDir, "admin-users.json");
const localSubscribersFile = path.join(dataDir, "subscribers.json");
const localNewsletterLogsFile = path.join(dataDir, "newsletter-logs.json");
const blobProductsPath = "ukshoppinghub/products.json";
const blobMessagesPath = "ukshoppinghub/messages.json";
const blobArticlesPath = "ukshoppinghub/articles.json";
const blobAdminUsersPath = "ukshoppinghub/admin-users.json";
const blobSubscribersPath = "ukshoppinghub/subscribers.json";
const blobNewsletterLogsPath = "ukshoppinghub/newsletter-logs.json";
const blobAccess = "public";

let blobSdk;

function getBlobSdk() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
  if (typeof blobSdk !== "undefined") return blobSdk;

  try {
    blobSdk = require("@vercel/blob");
  } catch {
    blobSdk = null;
  }

  return blobSdk;
}

async function getProducts() {
  return readDocument(blobProductsPath, fallbackProducts);
}

async function saveProducts(products) {
  return writeDocument(blobProductsPath, products);
}

async function getArticles() {
  return readDocument(blobArticlesPath, fallbackArticles);
}

async function saveArticles(articles) {
  return writeDocument(blobArticlesPath, articles);
}

async function getMessages() {
  return readDocument(blobMessagesPath, []);
}

async function saveMessages(messages) {
  return writeDocument(blobMessagesPath, messages);
}

async function getAdminUsers() {
  return readDocument(blobAdminUsersPath, []);
}

async function saveAdminUsers(users) {
  return writeDocument(blobAdminUsersPath, users);
}

async function getSubscribers() {
  return readDocument(blobSubscribersPath, []);
}

async function saveSubscribers(subscribers) {
  return writeDocument(blobSubscribersPath, subscribers);
}

async function getNewsletterLogs() {
  return readDocument(blobNewsletterLogsPath, []);
}

async function saveNewsletterLogs(logs) {
  return writeDocument(blobNewsletterLogsPath, logs);
}

async function readDocument(pathname, fallbackValue) {
  const blob = getBlobSdk();
  if (!blob) {
    return readLocalDocument(pathname, fallbackValue);
  }

  const { blobs } = await blob.list({
    prefix: pathname,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  const latestMatch = blobs
    .filter((item) => item.pathname === pathname)
    .sort((left, right) => new Date(right.uploadedAt) - new Date(left.uploadedAt))[0];

  if (!latestMatch || !latestMatch.url) {
    await writeDocument(pathname, fallbackValue);
    return cloneValue(fallbackValue);
  }

  const response = await fetch(latestMatch.url, { cache: "no-store" });
  const raw = await response.text();

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // Fall through to recovery path below.
  }

  await writeDocument(pathname, fallbackValue);
  return cloneValue(fallbackValue);
}

async function writeDocument(pathname, value) {
  const blob = getBlobSdk();
  if (!blob) {
    writeLocalDocument(pathname, value);
    return cloneValue(value);
  }

  await blob.put(pathname, JSON.stringify(value, null, 2), {
    access: blobAccess,
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json; charset=utf-8",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  return cloneValue(value);
}

function readLocalDocument(pathname, fallbackValue) {
  ensureLocalDataFiles();
  const target = getLocalTarget(pathname);

  try {
    const raw = fs.readFileSync(target, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : cloneValue(fallbackValue);
  } catch {
    return cloneValue(fallbackValue);
  }
}

function writeLocalDocument(pathname, value) {
  ensureLocalDataFiles();
  const target = getLocalTarget(pathname);
  fs.writeFileSync(target, JSON.stringify(value, null, 2));
}

function ensureLocalDataFiles() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(localProductsFile)) fs.writeFileSync(localProductsFile, JSON.stringify(fallbackProducts, null, 2));
  if (!fs.existsSync(localMessagesFile)) fs.writeFileSync(localMessagesFile, JSON.stringify([], null, 2));
  if (!fs.existsSync(localArticlesFile)) fs.writeFileSync(localArticlesFile, JSON.stringify(fallbackArticles, null, 2));
  if (!fs.existsSync(localAdminUsersFile)) fs.writeFileSync(localAdminUsersFile, JSON.stringify([], null, 2));
  if (!fs.existsSync(localSubscribersFile)) fs.writeFileSync(localSubscribersFile, JSON.stringify([], null, 2));
  if (!fs.existsSync(localNewsletterLogsFile)) fs.writeFileSync(localNewsletterLogsFile, JSON.stringify([], null, 2));
}

function getLocalTarget(pathname) {
  if (pathname === blobProductsPath) return localProductsFile;
  if (pathname === blobMessagesPath) return localMessagesFile;
  if (pathname === blobArticlesPath) return localArticlesFile;
  if (pathname === blobAdminUsersPath) return localAdminUsersFile;
  if (pathname === blobSubscribersPath) return localSubscribersFile;
  if (pathname === blobNewsletterLogsPath) return localNewsletterLogsFile;
  return localMessagesFile;
}

function cloneValue(value) {
  return JSON.parse(JSON.stringify(value));
}

module.exports = {
  getAdminUsers,
  getArticles,
  getMessages,
  getNewsletterLogs,
  getProducts,
  getSubscribers,
  saveAdminUsers,
  saveArticles,
  saveMessages,
  saveNewsletterLogs,
  saveProducts,
  saveSubscribers,
};
