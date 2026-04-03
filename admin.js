const siteApi = window.PointMarketingSite;

let adminState = {
  user: null,
  products: [],
  messages: [],
  editingId: null,
  uploadedImage: "",
};

document.addEventListener("DOMContentLoaded", async () => {
  wireAdminEvents();
  await bootstrapAdmin();
});

function wireAdminEvents() {
  document.getElementById("admin-product-form")?.addEventListener("submit", handleProductSubmit);
  document.getElementById("admin-reset-button")?.addEventListener("click", resetForm);
  document.getElementById("admin-cancel-button")?.addEventListener("click", cancelEdit);
  document.getElementById("admin-image-upload")?.addEventListener("change", handleImageUpload);
}

async function bootstrapAdmin() {
  const lock = document.getElementById("dashboard-lock");
  const shell = document.getElementById("dashboard-shell");

  if (!siteApi.getStoredToken()) {
    lock?.classList.remove("hidden");
    shell?.classList.add("hidden");
    document.getElementById("login-trigger")?.click();
    return;
  }

  try {
    const session = await siteApi.apiFetch("/api/session");
    adminState.user = session.user;
    renderAdminHeader();
    lock?.classList.add("hidden");
    shell?.classList.remove("hidden");
    await Promise.all([loadProducts(), loadMessages()]);
  } catch {
    siteApi.clearStoredSession();
    lock?.classList.remove("hidden");
    shell?.classList.add("hidden");
  }
}

function renderAdminHeader() {
  const target = document.getElementById("admin-status");
  if (!target || !adminState.user) return;

  target.innerHTML = `
    <span class="status-pill">Signed in as ${escapeHtml(adminState.user.name)}</span>
    <span class="status-pill">${escapeHtml(adminState.user.role)}</span>
  `;
}

async function loadProducts() {
  const response = await fetch("/api/products");
  const data = await siteApi.readResponseData(response);
  if (!response.ok) throw new Error(data.error || "Could not load products.");
  adminState.products = data.products || [];
  renderInventory();
}

async function loadMessages() {
  const response = await siteApi.apiFetch("/api/contact");
  adminState.messages = response.messages || [];
  renderMessages();
}

function renderInventory() {
  const wrap = document.getElementById("inventory-list");
  if (!wrap) return;

  wrap.innerHTML = adminState.products.length
    ? adminState.products
        .map(
          (product) => `
            <article class="inventory-item">
              <button class="inventory-main" type="button" data-select-id="${product.id}">
                <img src="${escapeAttribute(product.image)}" alt="${escapeAttribute(product.name)}">
                <div>
                  <strong>${escapeHtml(product.name)}</strong>
                  <p>${escapeHtml(product.category)} | ${escapeHtml(product.brand)} | ${escapeHtml(product.soldBy)}</p>
                </div>
              </button>
              <strong>GBP ${formatPrice(product.price)}</strong>
              <div class="inventory-actions">
                <button class="text-button" type="button" data-edit-id="${product.id}">Edit</button>
                <button class="text-button danger-text" type="button" data-delete-id="${product.id}">Delete</button>
              </div>
            </article>
          `,
        )
        .join("")
    : `<article class="dashboard-lock"><p>No recommendations yet. Add your first product below.</p></article>`;

  wrap.querySelectorAll("[data-edit-id]").forEach((button) => {
    button.addEventListener("click", () => startEdit(button.dataset.editId));
  });
  wrap.querySelectorAll("[data-delete-id]").forEach((button) => {
    button.addEventListener("click", () => deleteProduct(button.dataset.deleteId));
  });
}

function renderMessages() {
  const wrap = document.getElementById("message-list");
  if (!wrap) return;

  wrap.innerHTML = adminState.messages.length
    ? adminState.messages
        .map(
          (message) => `
            <article class="message-item">
              <div class="admin-status">
                <strong>${escapeHtml(message.subject)}</strong>
                <span>${formatDate(message.createdAt)}</span>
              </div>
              <p><strong>${escapeHtml(message.name)}</strong> (${escapeHtml(message.email)})</p>
              <p>${escapeHtml(message.message)}</p>
            </article>
          `,
        )
        .join("")
    : `<article class="dashboard-lock"><p>No enquiries yet.</p></article>`;
}

async function handleProductSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const payload = {
    name: String(formData.get("name") || "").trim(),
    soldBy: String(formData.get("soldBy") || "").trim(),
    brand: String(formData.get("brand") || "").trim(),
    category: String(formData.get("category") || "").trim(),
    price: Number(formData.get("price")),
    affiliateUrl: String(formData.get("affiliateUrl") || "").trim(),
    description: String(formData.get("description") || "").trim(),
    image: adminState.uploadedImage || String(formData.get("imageUrl") || "").trim(),
    clientProducts: adminState.products,
  };

  try {
    const method = adminState.editingId ? "PUT" : "POST";
    const endpoint = adminState.editingId ? `/api/products?id=${encodeURIComponent(adminState.editingId)}` : "/api/products";
    const response = await siteApi.apiFetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (adminState.editingId) {
      adminState.products = adminState.products.map((item) => (item.id === adminState.editingId ? response.product : item));
      siteApi.showToast("Product updated.");
    } else {
      adminState.products = [response.product, ...adminState.products];
      siteApi.showToast("Product added.");
    }

    renderInventory();
    resetForm();
  } catch (error) {
    siteApi.showToast(error.message || "Could not save product.");
  }
}

function startEdit(productId) {
  const product = adminState.products.find((item) => item.id === productId);
  if (!product) return;

  adminState.editingId = product.id;
  adminState.uploadedImage = product.image;

  document.getElementById("admin-form-title").textContent = "Edit recommendation";
  document.getElementById("admin-save-button").textContent = "Update Recommendation";
  document.getElementById("admin-cancel-button").classList.remove("hidden");
  document.getElementById("admin-product-name").value = product.name;
  document.getElementById("admin-sold-by").value = product.soldBy;
  document.getElementById("admin-brand").value = product.brand;
  document.getElementById("admin-category").value = product.category;
  document.getElementById("admin-price").value = product.price;
  document.getElementById("admin-affiliate-url").value = product.affiliateUrl;
  document.getElementById("admin-description").value = product.description;
  document.getElementById("admin-image-url").value = product.image.startsWith("data:") ? "" : product.image;
  document.getElementById("admin-product-form").scrollIntoView({ behavior: "smooth", block: "start" });
}

async function deleteProduct(productId) {
  const product = adminState.products.find((item) => item.id === productId);
  if (!product) return;

  try {
    await siteApi.apiFetch(`/api/products?id=${encodeURIComponent(productId)}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientProducts: adminState.products }),
    });
    adminState.products = adminState.products.filter((item) => item.id !== productId);
    renderInventory();
    if (adminState.editingId === productId) resetForm();
    siteApi.showToast(`Removed ${product.name}.`);
  } catch (error) {
    siteApi.showToast(error.message || "Could not delete product.");
  }
}

function resetForm() {
  adminState.editingId = null;
  adminState.uploadedImage = "";
  document.getElementById("admin-product-form")?.reset();
  document.getElementById("admin-form-title").textContent = "Add recommendation";
  document.getElementById("admin-save-button").textContent = "Save Recommendation";
  document.getElementById("admin-cancel-button").classList.add("hidden");
}

function cancelEdit() {
  resetForm();
  siteApi.showToast("Edit cancelled.");
}

function handleImageUpload(event) {
  const [file] = event.target.files;
  if (!file) {
    adminState.uploadedImage = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    adminState.uploadedImage = String(reader.result || "");
    siteApi.showToast("Image uploaded.");
  };
  reader.readAsDataURL(file);
}

function formatPrice(price) {
  return Number(price).toFixed(2);
}

function formatDate(value) {
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}
