const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const root = __dirname;
const dataDir = path.join(root, "data");
const productsFile = path.join(dataDir, "products.json");
const messagesFile = path.join(dataDir, "messages.json");
const port = process.env.PORT || 3000;

const users = [
  { id: "master-admin", username: "masteradmin", password: "admin123", name: "Master Admin", role: "master_admin" },
  { id: "second-user", username: "seconduser", password: "user123", name: "Second User", role: "second_user" },
];

const sessions = new Map();

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
};

const fallbackProducts = [
  {
    id: crypto.randomUUID(),
    name: "DEWALT 18V XR Brushless Combi Drill Kit",
    soldBy: "Amazon UK",
    brand: "DEWALT",
    category: "Tools & DIY",
    price: 189.99,
    affiliateUrl: "https://www.amazon.co.uk/",
    description: "Trade-ready combi drill kit with two batteries, charger, carry case, and all-round power for home and site use.",
    image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=80",
    updatedAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    name: "Ninja Foodi Dual Zone Air Fryer",
    soldBy: "Amazon UK",
    brand: "Ninja",
    category: "Kitchen",
    price: 199.00,
    affiliateUrl: "https://www.amazon.co.uk/",
    description: "Popular double-drawer air fryer for busy households that want crisp results and flexible cooking zones.",
    image: "https://images.unsplash.com/photo-1585515656626-4e83d8710d6d?auto=format&fit=crop&w=900&q=80",
    updatedAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    name: "Apple AirPods Pro (2nd generation)",
    soldBy: "Amazon UK",
    brand: "Apple",
    category: "Electronics",
    price: 229.00,
    affiliateUrl: "https://www.amazon.co.uk/",
    description: "Premium wireless earbuds with adaptive audio, noise cancellation, and a comfortable in-ear fit.",
    image: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f37?auto=format&fit=crop&w=900&q=80",
    updatedAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    name: "Shark Stratos Upright Vacuum Cleaner",
    soldBy: "Amazon UK",
    brand: "Shark",
    category: "Home",
    price: 299.99,
    affiliateUrl: "https://www.amazon.co.uk/",
    description: "Powerful upright vacuum with anti-hair-wrap technology for carpets, stairs, and busy family homes.",
    image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=900&q=80",
    updatedAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    name: "Ring Video Doorbell Plus",
    soldBy: "Amazon UK",
    brand: "Ring",
    category: "Smart Home",
    price: 149.99,
    affiliateUrl: "https://www.amazon.co.uk/",
    description: "Smart video doorbell with head-to-toe view, motion alerts, and app-based visitor monitoring.",
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=900&q=80",
    updatedAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    name: "Philips Hue Starter Kit",
    soldBy: "Amazon UK",
    brand: "Philips Hue",
    category: "Lighting",
    price: 169.99,
    affiliateUrl: "https://www.amazon.co.uk/",
    description: "Easy smart lighting starter pack with coloured bulbs, bridge, and app automation for every room.",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80",
    updatedAt: new Date().toISOString(),
  },
];

ensureDataFile();

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname.startsWith("/api/")) {
    await handleApi(req, res, url);
    return;
  }

  serveStatic(res, url.pathname);
});

server.listen(port, () => {
  console.log(`Affiliate UK app running at http://localhost:${port}`);
});

async function handleApi(req, res, url) {
  try {
    if (req.method === "GET" && url.pathname === "/api/health") {
      return json(res, 200, { ok: true, date: new Date().toISOString() });
    }

    if (req.method === "POST" && url.pathname === "/api/login") {
      const body = await readJsonBody(req);
      const username = String(body.username || "").trim().toLowerCase();
      const password = String(body.password || "");
      const user = users.find((item) => item.username === username && item.password === password);

      if (!user) return json(res, 401, { error: "Invalid username or password." });

      const token = crypto.randomBytes(24).toString("hex");
      const sessionUser = { id: user.id, username: user.username, name: user.name, role: user.role };
      sessions.set(token, sessionUser);
      return json(res, 200, { token, user: sessionUser });
    }

    if (req.method === "GET" && url.pathname === "/api/session") {
      const user = requireAuth(req);
      if (!user) return json(res, 401, { error: "Unauthorized" });
      return json(res, 200, { user });
    }

    if (req.method === "POST" && url.pathname === "/api/logout") {
      const token = getBearerToken(req);
      if (token) sessions.delete(token);
      return json(res, 200, { ok: true });
    }

    if (req.method === "GET" && url.pathname === "/api/products") {
      return json(res, 200, { products: readProducts() });
    }

    if (req.method === "POST" && url.pathname === "/api/contact") {
      const body = await readJsonBody(req);
      const message = validateMessage(body);
      message.id = crypto.randomUUID();
      message.createdAt = new Date().toISOString();

      const messages = readMessages();
      messages.unshift(message);
      writeMessages(messages);
      return json(res, 201, { ok: true, message });
    }

    if (req.method === "GET" && url.pathname === "/api/contact") {
      const user = requireAuth(req);
      if (!user) return json(res, 401, { error: "Unauthorized" });
      return json(res, 200, { messages: readMessages() });
    }

    if (req.method === "POST" && url.pathname === "/api/products") {
      const user = requireAuth(req);
      if (!user) return json(res, 401, { error: "Unauthorized" });

      const body = await readJsonBody(req);
      const product = validateProduct(body);
      product.id = crypto.randomUUID();
      product.updatedAt = new Date().toISOString();

      const products = readProducts();
      products.unshift(product);
      writeProducts(products);
      return json(res, 201, { product });
    }

    if ((req.method === "PUT" || req.method === "DELETE") && url.pathname.startsWith("/api/products/")) {
      const user = requireAuth(req);
      if (!user) return json(res, 401, { error: "Unauthorized" });

      const id = url.pathname.split("/").pop();
      const products = readProducts();
      const index = products.findIndex((item) => item.id === id);

      if (index === -1) return json(res, 404, { error: "Product not found." });

      if (req.method === "DELETE") {
        const [removed] = products.splice(index, 1);
        writeProducts(products);
        return json(res, 200, { ok: true, product: removed });
      }

      const body = await readJsonBody(req);
      const updated = validateProduct(body);
      updated.id = id;
      updated.updatedAt = new Date().toISOString();
      products[index] = updated;
      writeProducts(products);
      return json(res, 200, { product: updated });
    }

    return json(res, 404, { error: "Not found" });
  } catch (error) {
    const message = error && error.message ? error.message : "Something went wrong.";
    return json(res, 400, { error: message });
  }
}

function serveStatic(res, urlPath) {
  const filePath = resolvePath(urlPath);
  if (!filePath) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
    res.end(data);
  });
}

function resolvePath(urlPath) {
  if (urlPath === "/" || urlPath === "/index.html") return path.join(root, "index.html");

  const cleaned = path.normalize(urlPath.replace(/^\/+/, ""));
  const target = path.join(root, cleaned);
  if (!target.startsWith(root)) return null;
  return target;
}

function ensureDataFile() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(productsFile)) fs.writeFileSync(productsFile, JSON.stringify(fallbackProducts, null, 2));
  if (!fs.existsSync(messagesFile)) fs.writeFileSync(messagesFile, JSON.stringify([], null, 2));
}

function readProducts() {
  try {
    const raw = fs.readFileSync(productsFile, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : fallbackProducts;
  } catch {
    return fallbackProducts;
  }
}

function writeProducts(products) {
  fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
}

function readMessages() {
  try {
    const raw = fs.readFileSync(messagesFile, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeMessages(messages) {
  fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2));
}

function requireAuth(req) {
  const token = getBearerToken(req);
  return token ? sessions.get(token) : null;
}

function getBearerToken(req) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return "";
  return header.slice(7).trim();
}

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

function validateMessage(input) {
  const message = {
    name: String(input.name || "").trim(),
    email: String(input.email || "").trim(),
    subject: String(input.subject || "").trim(),
    message: String(input.message || "").trim(),
  };

  if (!message.name) throw new Error("Name is required.");
  if (!message.email || !message.email.includes("@")) throw new Error("A valid email is required.");
  if (!message.subject) throw new Error("Subject is required.");
  if (!message.message || message.message.length < 10) throw new Error("Message must be at least 10 characters.");

  return message;
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 5 * 1024 * 1024) {
        reject(new Error("Request body is too large."));
        req.destroy();
      }
    });

    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Invalid JSON body."));
      }
    });

    req.on("error", reject);
  });
}

function json(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}
