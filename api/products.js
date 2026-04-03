const crypto = require("crypto");

const { getSessionUser } = require("../lib/auth");
const { getSearchParam, readJsonBody, sendJson } = require("../lib/http");
const { getProducts, saveProducts } = require("../lib/store");

module.exports = async (req, res) => {
  try {
    if (req.method === "GET") {
      sendJson(res, 200, { products: await getProducts() });
      return;
    }

    const user = getSessionUser(req);
    if (!user || user.role !== "master_admin") {
      sendJson(res, 403, { error: "Admin access required." });
      return;
    }

    if (req.method === "POST") {
      const body = await readJsonBody(req);
      const product = validateProduct(body);
      product.id = crypto.randomUUID();
      product.updatedAt = new Date().toISOString();

      const products = normaliseExistingProducts(body.clientProducts) || (await getProducts());
      products.unshift(product);
      await saveProducts(products);
      sendJson(res, 201, { product });
      return;
    }

    if (req.method === "PUT" || req.method === "DELETE") {
      const productId = getSearchParam(req, "id");
      if (!productId) {
        sendJson(res, 400, { error: "Product id is required." });
        return;
      }

      const body = await readJsonBody(req);
      const products = normaliseExistingProducts(body.clientProducts) || (await getProducts());
      const index = products.findIndex((item) => item.id === productId);

      if (index === -1) {
        sendJson(res, 404, { error: "Product not found." });
        return;
      }

      if (req.method === "DELETE") {
        const [removed] = products.splice(index, 1);
        await saveProducts(products);
        sendJson(res, 200, { ok: true, product: removed });
        return;
      }

      const updated = validateProduct(body);
      updated.id = productId;
      updated.updatedAt = new Date().toISOString();
      products[index] = updated;
      await saveProducts(products);
      sendJson(res, 200, { product: updated });
      return;
    }

    sendJson(res, 405, { error: "Method not allowed." });
  } catch (error) {
    sendJson(res, 400, { error: error.message || "Could not process products." });
  }
};

function validateProduct(input) {
  const product = {
    name: String(input.name || "").trim(),
    soldBy: String(input.soldBy || "").trim(),
    brand: String(input.brand || "").trim(),
    category: String(input.category || "").trim(),
    price: Number(input.price),
    affiliateUrl: String(input.affiliateUrl || "").trim().replace(/^http:\/\//i, "https://"),
    description: String(input.description || "").trim(),
    image: String(input.image || "").trim(),
  };

  if (!product.name) throw new Error("Product name is required.");
  if (!product.soldBy) throw new Error("Sold by is required.");
  if (!product.brand) throw new Error("Brand is required.");
  if (!product.category) throw new Error("Category is required.");
  if (!Number.isFinite(product.price) || product.price < 0) throw new Error("Price must be a valid number.");
  if (!product.affiliateUrl.includes("amazon.co.uk")) throw new Error("Affiliate URL must be an Amazon UK link.");
  if (!product.image) throw new Error("Product image is required.");

  return product;
}

function normaliseExistingProducts(input) {
  if (!Array.isArray(input)) return null;

  return input.map((item) => {
    const product = validateProduct(item);
    return {
      ...product,
      id: String(item.id || "").trim() || crypto.randomUUID(),
      updatedAt: String(item.updatedAt || "").trim() || new Date().toISOString(),
    };
  });
}
