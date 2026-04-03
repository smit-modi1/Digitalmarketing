const crypto = require("crypto");

const { getSessionUser } = require("../lib/auth");
const { getSearchParam, readJsonBody, sendJson } = require("../lib/http");
const { getArticles, saveArticles } = require("../lib/store");

module.exports = async (req, res) => {
  try {
    if (req.method === "GET") {
      const user = getSessionUser(req);
      const articles = await getArticles();
      const visibleArticles = user && user.role === "master_admin" ? articles : articles.filter((item) => item.status === "published");
      sendJson(res, 200, { articles: visibleArticles });
      return;
    }

    const user = getSessionUser(req);
    if (!user || user.role !== "master_admin") {
      sendJson(res, 403, { error: "Admin access required." });
      return;
    }

    if (req.method === "POST") {
      const body = await readJsonBody(req);
      const article = validateArticle(body);
      article.id = crypto.randomUUID();
      article.updatedAt = new Date().toISOString();

      const articles = normaliseExistingArticles(body.clientArticles) || (await getArticles());
      articles.unshift(article);
      await saveArticles(articles);
      sendJson(res, 201, { article });
      return;
    }

    if (req.method === "PUT" || req.method === "DELETE") {
      const articleId = getSearchParam(req, "id");
      if (!articleId) {
        sendJson(res, 400, { error: "Article id is required." });
        return;
      }

      const body = await readJsonBody(req);
      const articles = normaliseExistingArticles(body.clientArticles) || (await getArticles());
      const index = articles.findIndex((item) => item.id === articleId);

      if (index === -1) {
        sendJson(res, 404, { error: "Article not found." });
        return;
      }

      if (req.method === "DELETE") {
        const [removed] = articles.splice(index, 1);
        await saveArticles(articles);
        sendJson(res, 200, { ok: true, article: removed });
        return;
      }

      const updated = validateArticle(body);
      updated.id = articleId;
      updated.updatedAt = new Date().toISOString();
      articles[index] = updated;
      await saveArticles(articles);
      sendJson(res, 200, { article: updated });
      return;
    }

    sendJson(res, 405, { error: "Method not allowed." });
  } catch (error) {
    sendJson(res, 400, { error: error.message || "Could not process articles." });
  }
};

function validateArticle(input) {
  const article = {
    slug: slugify(input.slug || input.title),
    title: String(input.title || "").trim(),
    summary: String(input.summary || "").trim(),
    category: String(input.category || "").trim(),
    problem: String(input.problem || "").trim(),
    intro: cleanList(input.intro),
    whatToLookFor: cleanList(input.whatToLookFor),
    picks: cleanPicks(input.picks),
    pros: cleanList(input.pros),
    cons: cleanList(input.cons),
    finalRecommendation: String(input.finalRecommendation || "").trim(),
    links: cleanLinks(input.links),
    status: String(input.status || "published").trim().toLowerCase(),
  };

  if (!article.slug) throw new Error("Article slug is required.");
  if (!article.title) throw new Error("Article title is required.");
  if (!article.summary) throw new Error("Article summary is required.");
  if (!article.category) throw new Error("Article category is required.");
  if (!article.problem) throw new Error("Problem statement is required.");
  if (!article.intro.length) throw new Error("At least one introduction paragraph is required.");
  if (!article.whatToLookFor.length) throw new Error("Add at least one buying factor.");
  if (!article.picks.length) throw new Error("Add at least one recommended pick.");
  if (!article.pros.length) throw new Error("Add at least one pro.");
  if (!article.cons.length) throw new Error("Add at least one con.");
  if (!article.finalRecommendation) throw new Error("Final recommendation is required.");
  if (!article.links.length) throw new Error("Add at least one Amazon UK link.");
  if (article.links.length > 2) throw new Error("Use at most two Amazon links per article.");
  if (!["draft", "published"].includes(article.status)) throw new Error("Article status must be draft or published.");

  return article;
}

function normaliseExistingArticles(input) {
  if (!Array.isArray(input)) return null;

  return input.map((item) => ({
    ...validateArticle(item),
    id: String(item.id || "").trim() || crypto.randomUUID(),
    updatedAt: String(item.updatedAt || "").trim() || new Date().toISOString(),
  }));
}

function cleanList(input) {
  if (!Array.isArray(input)) return [];
  return input.map((item) => String(item || "").trim()).filter(Boolean);
}

function cleanPicks(input) {
  if (!Array.isArray(input)) return [];
  return input
    .map((item) => ({
      name: String(item?.name || "").trim(),
      text: String(item?.text || "").trim(),
    }))
    .filter((item) => item.name && item.text);
}

function cleanLinks(input) {
  if (!Array.isArray(input)) return [];
  return input
    .map((item) => ({
      label: String(item?.label || "").trim(),
      url: String(item?.url || "").trim().replace(/^http:\/\//i, "https://"),
    }))
    .filter((item) => item.label && item.url)
    .map((item) => {
      if (!item.url.includes("amazon.co.uk")) throw new Error("Article links must be Amazon UK links.");
      return item;
    });
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
