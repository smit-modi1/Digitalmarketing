const storageKeys = {
  token: "affiliate-uk-token-v1",
  sessionUser: "affiliate-uk-session-user-v1",
};

const fallbackImage =
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80";

const articles = [
  {
    title: "Best Amazon UK products that feel worth the click",
    summary: "A buyer-first shortlist of useful products with simple explanations, clear positioning, and less marketplace noise.",
  },
  {
    title: "How to choose discounted products without buying junk",
    summary: "Low prices can drive conversions, but quality, fit-for-purpose use, and clear product framing still matter most.",
  },
  {
    title: "What brands need before a tester or influencer push",
    summary: "A product needs a convincing offer, clear targeting, and a landing page that helps buyers and creators understand the value fast.",
  },
];

let state = {
  token: localStorage.getItem(storageKeys.token) || "",
  user: readStoredUser(),
  products: [],
  messages: [],
  editingId: null,
  selectedProductId: "",
  searchTerm: "",
  activeCategory: "All",
  uploadedImage: "",
};

document.addEventListener("DOMContentLoaded", async () => {
  wireEvents();
  renderArticles();
  await bootstrap();
});

function wireEvents() {
  document.getElementById("product-form").addEventListener("submit", handleSubmit);
  document.getElementById("contact-form").addEventListener("submit", handleContactSubmit);
  document.getElementById("reset-form-button").addEventListener("click", resetForm);
  document.getElementById("cancel-edit").addEventListener("click", cancelEdit);
  document.getElementById("add-product-button").addEventListener("click", focusFormForNewItem);
  document.getElementById("search-input").addEventListener("input", (event) => {
    state.searchTerm = event.target.value.trim().toLowerCase();
    if (state.searchTerm) {
      state.activeCategory = "All";
      renderCategories();
    }
    renderProducts();
  });
  document.getElementById("image-upload").addEventListener("change", handleImageUpload);
  document.getElementById("login-trigger").addEventListener("click", openLoginModal);
  document.getElementById("close-login-modal").addEventListener("click", closeLoginModal);
  document.getElementById("login-modal").addEventListener("click", (event) => {
    if (event.target.id === "login-modal") closeLoginModal();
  });
  document.getElementById("login-form").addEventListener("submit", handleLogin);
  document.getElementById("logout-button").addEventListener("click", handleLogout);
  document.getElementById("scroll-to-catalogue").addEventListener("click", () => {
    document.getElementById("catalogue").scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

async function bootstrap() {
  renderSession();
  toggleWorkspace(Boolean(state.user));
  setWorkspaceLocked(!state.user);
  await validateSession();
  await loadProducts();
  await loadMessages();
}

async function validateSession() {
  if (!state.token) {
    state.user = null;
    clearStoredSession();
    renderSession();
    return;
  }

  try {
    const response = await apiFetch("/api/session");
    state.user = response.user;
    storeSession();
  } catch {
    state.user = null;
    clearStoredSession();
  }

  renderSession();
  toggleWorkspace(Boolean(state.user));
  setWorkspaceLocked(!state.user);
}

async function loadProducts() {
  try {
    const response = await fetch("/api/products");
    const data = await response.json();
    state.products = data.products || [];
    if (!state.selectedProductId && state.products.length) state.selectedProductId = state.products[0].id;
    renderCategories();
    renderFeatureProduct();
    renderProducts();
    renderInventory();
  } catch {
    showToast("Could not load products.");
  }
}

async function loadMessages() {
  if (!state.user) {
    state.messages = [];
    renderMessages();
    return;
  }

  try {
    const response = await apiFetch("/api/contact");
    state.messages = response.messages || [];
    renderMessages();
  } catch {
    state.messages = [];
    renderMessages();
  }
}

function renderSession() {
  const activeUserName = document.getElementById("active-user-name");
  const activeUserRole = document.getElementById("active-user-role");
  const sessionSummary = document.getElementById("session-summary");
  const authStatus = document.getElementById("auth-status");
  const authHint = document.getElementById("auth-hint");
  const logoutButton = document.getElementById("logout-button");

  if (state.user) {
    activeUserName.textContent = state.user.name;
    activeUserRole.textContent = state.user.role;
    sessionSummary.textContent = state.user.name;
    authStatus.textContent = `${state.user.name} signed in`;
    authHint.textContent = "You can add, edit, and remove products, and review contact enquiries.";
    logoutButton.classList.remove("hidden");
  } else {
    activeUserName.textContent = "Guest Visitor";
    activeUserRole.textContent = "signed_out";
    sessionSummary.textContent = "Guest";
    authStatus.textContent = "Not signed in";
    authHint.textContent = "Private admin login only. Sign in as masteradmin to manage the storefront.";
    logoutButton.classList.add("hidden");
  }
}

function renderFeatureProduct() {
  const product = state.products.find((item) => item.id === state.selectedProductId) || state.products[0];
  const summary = document.getElementById("hero-summary");

  if (!product) {
    summary.textContent = "Add your first product to start building the catalogue.";
    document.getElementById("feature-image").src = fallbackImage;
    document.getElementById("feature-name").textContent = "No product selected";
    document.getElementById("feature-category").textContent = "General";
    document.getElementById("feature-brand").textContent = "-";
    document.getElementById("feature-seller").textContent = "-";
    document.getElementById("feature-price").textContent = "GBP 0.00";
    document.getElementById("feature-description").textContent = "No product overview added yet.";
    document.getElementById("feature-link").href = "https://www.amazon.co.uk/";
    return;
  }

  state.selectedProductId = product.id;
  summary.textContent = `Currently showing ${product.name} from ${product.brand}.`;
  document.getElementById("feature-image").src = product.image || fallbackImage;
  document.getElementById("feature-image").alt = product.name;
  document.getElementById("feature-name").textContent = product.name;
  document.getElementById("feature-category").textContent = product.category || "General";
  document.getElementById("feature-brand").textContent = product.brand;
  document.getElementById("feature-seller").textContent = product.soldBy;
  document.getElementById("feature-price").textContent = `GBP ${formatPrice(product.price)}`;
  document.getElementById("feature-description").textContent = product.description || "No product overview added yet.";
  document.getElementById("feature-link").href = product.affiliateUrl;
}

function renderCategories() {
  const wrap = document.getElementById("category-chips");
  const categories = ["All", ...new Set(state.products.map((product) => product.category).filter(Boolean))];

  wrap.innerHTML = categories
    .map(
      (category) => `
        <button class="chip ${category === state.activeCategory ? "active" : ""}" type="button" data-category="${escapeAttribute(category)}">
          ${escapeHtml(category)}
        </button>
      `,
    )
    .join("");

  wrap.querySelectorAll("[data-category]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeCategory = button.dataset.category;
      renderCategories();
      renderProducts();
    });
  });
}

function renderArticles() {
  const wrap = document.getElementById("article-grid");
  wrap.innerHTML = articles
    .map(
      (article) => `
        <article class="article-card">
          <p class="section-label">Guide</p>
          <h3>${escapeHtml(article.title)}</h3>
          <p>${escapeHtml(article.summary)}</p>
        </article>
      `,
    )
    .join("");
}

function renderProducts() {
  const grid = document.getElementById("product-grid");
  const emptyState = document.getElementById("empty-state");
  const filteredProducts = getFilteredProducts();

  document.getElementById("product-count").textContent = filteredProducts.length;

  grid.innerHTML = filteredProducts
    .map(
      (product) => `
        <article class="product-card ${product.id === state.selectedProductId ? "selected" : ""}">
          <button class="product-select" type="button" data-select-id="${product.id}">
            <img class="product-image" src="${escapeAttribute(product.image || fallbackImage)}" alt="${escapeAttribute(product.name)}">
            <div class="product-body">
              <div class="product-copy">
                <span class="mini-tag">${escapeHtml(product.category || "General")}</span>
                <h3>${escapeHtml(product.name)}</h3>
                <p>${escapeHtml(product.description || "Amazon affiliate product listing for the UK store.")}</p>
              </div>
              <dl class="product-meta">
                <div><dt>Brand</dt><dd>${escapeHtml(product.brand)}</dd></div>
                <div><dt>Sold by</dt><dd>${escapeHtml(product.soldBy)}</dd></div>
                <div><dt>Price</dt><dd>GBP ${formatPrice(product.price)}</dd></div>
              </dl>
            </div>
          </button>
          <div class="product-actions">
            <a class="primary-cta compact" href="${escapeAttribute(product.affiliateUrl)}" target="_blank" rel="noopener noreferrer">Buy Now</a>
            ${state.user ? `<button class="secondary-cta compact" type="button" data-edit-id="${product.id}">Edit</button>` : ""}
            ${state.user ? `<button class="secondary-cta compact danger" type="button" data-delete-id="${product.id}">Delete</button>` : ""}
          </div>
        </article>
      `,
    )
    .join("");

  emptyState.classList.toggle("hidden", filteredProducts.length > 0);
  bindProductActions(grid);
}

function renderInventory() {
  const container = document.getElementById("inventory-list");

  if (!state.user) {
    container.innerHTML = `
      <div class="inventory-empty">
        <strong>Workspace locked</strong>
        <p>Sign in to edit the product database.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = state.products
    .map(
      (product) => `
        <article class="inventory-item ${product.id === state.selectedProductId ? "active" : ""}">
          <button class="inventory-main" type="button" data-select-id="${product.id}">
            <img src="${escapeAttribute(product.image || fallbackImage)}" alt="${escapeAttribute(product.name)}">
            <div>
              <strong>${escapeHtml(product.name)}</strong>
              <p>${escapeHtml(product.category || "General")} | ${escapeHtml(product.brand)} | ${escapeHtml(product.soldBy)}</p>
            </div>
          </button>
          <span>GBP ${formatPrice(product.price)}</span>
          <div class="inventory-actions">
            <button class="text-button" type="button" data-edit-id="${product.id}">Edit</button>
            <button class="text-button danger-text" type="button" data-delete-id="${product.id}">Delete</button>
          </div>
        </article>
      `,
    )
    .join("");

  bindProductActions(container);
}

function renderMessages() {
  const container = document.getElementById("message-list");

  if (!state.user) {
    container.innerHTML = `
      <div class="inventory-empty">
        <strong>Inbox locked</strong>
        <p>Sign in to review contact form submissions.</p>
      </div>
    `;
    return;
  }

  if (!state.messages.length) {
    container.innerHTML = `
      <div class="inventory-empty">
        <strong>No messages yet</strong>
        <p>Contact form submissions will appear here.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = state.messages
    .map(
      (message) => `
        <article class="message-item">
          <div class="message-meta">
            <strong>${escapeHtml(message.subject)}</strong>
            <span>${formatDate(message.createdAt)}</span>
          </div>
          <p><strong>${escapeHtml(message.name)}</strong> (${escapeHtml(message.email)})</p>
          <p>${escapeHtml(message.message)}</p>
        </article>
      `,
    )
    .join("");
}

function bindProductActions(container) {
  container.querySelectorAll("[data-select-id]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedProductId = button.dataset.selectId;
      renderFeatureProduct();
      renderProducts();
      renderInventory();
    });
  });

  container.querySelectorAll("[data-edit-id]").forEach((button) => {
    button.addEventListener("click", () => startEdit(button.dataset.editId));
  });

  container.querySelectorAll("[data-delete-id]").forEach((button) => {
    button.addEventListener("click", () => deleteProduct(button.dataset.deleteId));
  });
}

function getFilteredProducts() {
  return state.products.filter((product) => {
    const matchesCategory = state.activeCategory === "All" || product.category === state.activeCategory;
    const searchable = `${product.name} ${product.brand} ${product.soldBy} ${product.category || ""}`.toLowerCase();
    const matchesSearch = !state.searchTerm || searchable.includes(state.searchTerm);
    return matchesCategory && matchesSearch;
  });
}

async function handleLogin(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);

  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: formData.get("username"),
        password: formData.get("password"),
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Login failed.");

    state.token = data.token;
    state.user = data.user;
    storeSession();
    renderSession();
    toggleWorkspace(true);
    setWorkspaceLocked(false);
    renderProducts();
    renderInventory();
    await loadMessages();
    closeLoginModal();
    event.currentTarget.reset();
    document.getElementById("workspace").scrollIntoView({ behavior: "smooth", block: "start" });
    showToast(`Signed in as ${state.user.name}.`);
  } catch (error) {
    showToast(error.message || "Login failed. Use the master admin account.");
  }
}

async function handleLogout() {
  try {
    if (state.token) {
      await fetch("/api/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${state.token}` },
      });
    }
  } catch {
    // Keep logout resilient even if the request fails.
  }

  state.token = "";
  state.user = null;
  clearStoredSession();
  resetForm();
  renderSession();
  toggleWorkspace(false);
  setWorkspaceLocked(true);
  renderProducts();
  renderInventory();
  await loadMessages();
  showToast("Signed out.");
}

async function handleSubmit(event) {
  event.preventDefault();
  if (!state.user) {
    openLoginModal();
    showToast("Please sign in to manage products.");
    return;
  }

  const formData = new FormData(event.currentTarget);
  const payload = {
    name: formData.get("name").toString().trim(),
    soldBy: formData.get("soldBy").toString().trim(),
    brand: formData.get("brand").toString().trim(),
    category: formData.get("category").toString().trim(),
    price: Number(formData.get("price")),
    affiliateUrl: normaliseAmazonUrl(formData.get("affiliateUrl").toString().trim()),
    description: formData.get("description").toString().trim(),
    image: state.uploadedImage || formData.get("imageUrl").toString().trim() || "",
  };

  try {
    const method = state.editingId ? "PUT" : "POST";
    const endpoint = state.editingId ? `/api/products/${state.editingId}` : "/api/products";
    const response = await apiFetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (state.editingId) {
      state.products = state.products.map((item) => (item.id === state.editingId ? response.product : item));
      state.selectedProductId = response.product.id;
      showToast("Product updated.");
    } else {
      state.products.unshift(response.product);
      state.selectedProductId = response.product.id;
      showToast("Product added.");
    }

    state.activeCategory = "All";
    state.searchTerm = "";
    document.getElementById("search-input").value = "";
    renderCategories();
    renderFeatureProduct();
    renderProducts();
    renderInventory();
    resetForm();
  } catch (error) {
    showToast(error.message || "Could not save product.");
  }
}

async function handleContactSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);

  try {
    await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        subject: formData.get("subject"),
        message: formData.get("message"),
      }),
    }).then(async (response) => {
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not send message.");
      return data;
    });

    form.reset();
    if (state.user) await loadMessages();
    showToast("Message sent successfully.");
  } catch (error) {
    showToast(error.message || "Could not send message.");
  }
}

function handleImageUpload(event) {
  const [file] = event.target.files;
  if (!file) {
    state.uploadedImage = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    state.uploadedImage = String(reader.result || "");
    showToast("Image uploaded.");
  };
  reader.readAsDataURL(file);
}

function startEdit(productId) {
  if (!state.user) return;
  const product = state.products.find((item) => item.id === productId);
  if (!product) return;

  state.editingId = product.id;
  state.uploadedImage = product.image;
  state.selectedProductId = product.id;

  document.getElementById("product-name").value = product.name;
  document.getElementById("sold-by").value = product.soldBy;
  document.getElementById("brand").value = product.brand;
  document.getElementById("category").value = product.category || "";
  document.getElementById("price").value = product.price;
  document.getElementById("affiliate-url").value = product.affiliateUrl;
  document.getElementById("description").value = product.description || "";
  document.getElementById("image-url").value = product.image.startsWith("data:") ? "" : product.image;
  document.getElementById("form-title").textContent = "Edit Product";
  document.getElementById("save-product-button").textContent = "Update Product";
  document.getElementById("cancel-edit").classList.remove("hidden");
  renderFeatureProduct();
  renderProducts();
  renderInventory();
  document.getElementById("workspace").scrollIntoView({ behavior: "smooth", block: "start" });
}

async function deleteProduct(productId) {
  if (!state.user) return;
  const product = state.products.find((item) => item.id === productId);
  if (!product) return;

  try {
    await apiFetch(`/api/products/${productId}`, { method: "DELETE" });
    state.products = state.products.filter((item) => item.id !== productId);
    if (state.selectedProductId === productId) state.selectedProductId = state.products[0]?.id || "";
    if (state.editingId === productId) resetForm();
    if (!state.products.some((item) => item.category === state.activeCategory)) state.activeCategory = "All";
    renderCategories();
    renderFeatureProduct();
    renderProducts();
    renderInventory();
    showToast(`Removed ${product.name}.`);
  } catch (error) {
    showToast(error.message || "Could not delete product.");
  }
}

function focusFormForNewItem() {
  if (!state.user) {
    openLoginModal();
    showToast("Sign in to add products.");
    return;
  }

  resetForm();
  document.getElementById("workspace").scrollIntoView({ behavior: "smooth", block: "start" });
  document.getElementById("product-name").focus();
}

function cancelEdit() {
  resetForm();
  showToast("Edit cancelled.");
}

function resetForm() {
  state.editingId = null;
  state.uploadedImage = "";
  document.getElementById("product-form").reset();
  document.getElementById("form-title").textContent = "Add Product";
  document.getElementById("save-product-button").textContent = "Save Product";
  document.getElementById("cancel-edit").classList.add("hidden");
}

function setWorkspaceLocked(locked) {
  const lockPanel = document.getElementById("workspace-lock");
  const form = document.getElementById("product-form");
  const addButton = document.getElementById("add-product-button");

  lockPanel.classList.toggle("hidden", !locked);
  form.classList.toggle("form-disabled", locked);
  addButton.disabled = locked;

  form.querySelectorAll("input, textarea, button").forEach((element) => {
    element.disabled = locked;
  });
}

function toggleWorkspace(isVisible) {
  const workspace = document.getElementById("workspace");
  workspace.classList.toggle("hidden", !isVisible);
}

function openLoginModal() {
  const modal = document.getElementById("login-modal");
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
}

function closeLoginModal() {
  const modal = document.getElementById("login-modal");
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
}

async function apiFetch(url, options = {}) {
  const headers = new Headers(options.headers || {});
  if (state.token) headers.set("Authorization", `Bearer ${state.token}`);

  const response = await fetch(url, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) throw new Error(data.error || "Request failed.");
  return data;
}

function storeSession() {
  localStorage.setItem(storageKeys.token, state.token);
  localStorage.setItem(storageKeys.sessionUser, JSON.stringify(state.user));
}

function clearStoredSession() {
  localStorage.removeItem(storageKeys.token);
  localStorage.removeItem(storageKeys.sessionUser);
}

function readStoredUser() {
  try {
    const raw = localStorage.getItem(storageKeys.sessionUser);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function normaliseAmazonUrl(url) {
  return url.replace(/^http:\/\//i, "https://");
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

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2400);
}
