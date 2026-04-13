const siteApi = window.DailyDealsUkSite;
const content = window.DailyDealsUkContent || { categories: [] };

let adminState = {
  user: null,
  products: [],
  articles: [],
  messages: [],
  adminUsers: [],
  subscribers: [],
  newsletterLogs: [],
  editingProductId: null,
  editingArticleId: null,
  uploadedImage: "",
};

document.addEventListener("DOMContentLoaded", async () => {
  wireAdminEvents();
  populateCategorySuggestions();
  await bootstrapAdmin();
});

function wireAdminEvents() {
  document.getElementById("admin-product-form")?.addEventListener("submit", handleProductSubmit);
  document.getElementById("admin-reset-button")?.addEventListener("click", resetProductForm);
  document.getElementById("admin-cancel-button")?.addEventListener("click", cancelProductEdit);
  document.getElementById("admin-image-upload")?.addEventListener("change", handleImageUpload);
  document.getElementById("admin-article-form")?.addEventListener("submit", handleArticleSubmit);
  document.getElementById("admin-article-reset-button")?.addEventListener("click", resetArticleForm);
  document.getElementById("admin-article-cancel-button")?.addEventListener("click", cancelArticleEdit);
  document.getElementById("admin-user-form")?.addEventListener("submit", handleSubAdminSubmit);
  document.getElementById("admin-user-reset-button")?.addEventListener("click", resetSubAdminForm);
  document.getElementById("newsletter-form")?.addEventListener("submit", handleManualNewsletter);
  document.getElementById("weekly-newsletter-button")?.addEventListener("click", sendWeeklyDigestNow);
}

function populateCategorySuggestions() {
  const datalist = document.getElementById("category-suggestions");
  if (!datalist) return;

  datalist.innerHTML = (content.categories || [])
    .map((category) => `<option value="${escapeAttribute(category.name)}"></option>`)
    .join("");
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
    applyRoleVisibility();
    lock?.classList.add("hidden");
    shell?.classList.remove("hidden");
    await loadDashboardData();
  } catch {
    siteApi.clearStoredSession();
    lock?.classList.remove("hidden");
    shell?.classList.add("hidden");
  }
}

async function loadDashboardData() {
  await Promise.all([loadProducts(), loadArticles(), loadMessages(), loadSubscribers()]);
  if (can("manageUsers")) await loadAdminUsers();
  if (can("manageNewsletter")) await loadNewsletterData();
}

function applyRoleVisibility() {
  toggleHidden("restricted-note", adminState.user?.role !== "sub_admin");
  toggleHidden("product-form-card", !can("manageProducts"));
  toggleHidden("article-form-card", !can("manageArticles"));
  toggleHidden("user-management-card", !can("manageUsers"));
  toggleHidden("admin-user-list-card", !can("manageUsers"));
  toggleHidden("newsletter-card", !can("manageNewsletter"));
}

function renderAdminHeader() {
  const target = document.getElementById("admin-status");
  if (!target || !adminState.user) return;

  target.innerHTML = `
    <span class="status-pill">Signed in as ${escapeHtml(adminState.user.name)}</span>
    <span class="status-pill">${escapeHtml(adminState.user.role.replaceAll("_", " "))}</span>
  `;
}

async function loadProducts() {
  const response = await fetch("/api/products");
  const data = await siteApi.readResponseData(response);
  if (!response.ok) throw new Error(data.error || "Could not load products.");
  adminState.products = data.products || [];
  renderInventory();
}

async function loadArticles() {
  const response = await siteApi.apiFetch("/api/articles");
  adminState.articles = response.articles || [];
  renderArticles();
}

async function loadMessages() {
  const response = await siteApi.apiFetch("/api/contact");
  adminState.messages = response.messages || [];
  renderMessages();
}

async function loadSubscribers() {
  const response = await siteApi.apiFetch("/api/subscribers");
  adminState.subscribers = response.subscribers || [];
  renderSubscribers();
}

async function loadAdminUsers() {
  const response = await siteApi.apiFetch("/api/admin-users");
  adminState.adminUsers = response.users || [];
  renderAdminUsers();
}

async function loadNewsletterData() {
  const response = await siteApi.apiFetch("/api/newsletter");
  adminState.newsletterLogs = response.logs || [];
  renderNewsletterLogs();
}

function renderInventory() {
  const wrap = document.getElementById("inventory-list");
  if (!wrap) return;

  wrap.innerHTML = adminState.products.length
    ? adminState.products
        .map(
          (product) => `
            <article class="inventory-item">
              <button class="inventory-main" type="button" ${can("manageProducts") ? `data-edit-id="${product.id}"` : ""}>
                <img src="${escapeAttribute(product.image)}" alt="${escapeAttribute(product.name)}">
                <div>
                  <strong>${escapeHtml(product.name)}</strong>
                  <p>${escapeHtml(product.category)} | ${escapeHtml(product.brand)} | ${escapeHtml(product.soldBy)}</p>
                </div>
              </button>
              <strong>GBP ${formatPrice(product.price)}</strong>
              <div class="inventory-actions">
                ${can("manageProducts") ? `<button class="text-button" type="button" data-edit-id="${product.id}">Edit</button>` : ""}
                ${can("manageProducts") ? `<button class="text-button danger-text" type="button" data-delete-id="${product.id}">Delete</button>` : ""}
                ${!can("manageProducts") ? `<span class="muted-note">View only</span>` : ""}
              </div>
            </article>
          `,
        )
        .join("")
    : `<article class="dashboard-lock"><p>No recommendations are available right now.</p></article>`;

  if (can("manageProducts")) {
    wrap.querySelectorAll("[data-edit-id]").forEach((button) => {
      button.addEventListener("click", () => startProductEdit(button.dataset.editId));
    });
    wrap.querySelectorAll("[data-delete-id]").forEach((button) => {
      button.addEventListener("click", () => deleteProduct(button.dataset.deleteId));
    });
  }
}

function renderArticles() {
  const wrap = document.getElementById("article-list");
  if (!wrap) return;

  wrap.innerHTML = adminState.articles.length
    ? adminState.articles
        .map(
          (article) => `
            <article class="inventory-item inventory-item-copy">
              <div>
                <strong>${escapeHtml(article.title)}</strong>
                <p>${escapeHtml(article.category)} | ${escapeHtml(article.slug)}</p>
              </div>
              <span class="status-pill">${escapeHtml(article.status)}</span>
              <div class="inventory-actions">
                ${can("manageArticles") ? `<button class="text-button" type="button" data-article-edit-id="${article.id}">Edit</button>` : ""}
                ${can("manageArticles") ? `<button class="text-button danger-text" type="button" data-article-delete-id="${article.id}">Delete</button>` : ""}
                ${!can("manageArticles") ? `<span class="muted-note">View only</span>` : ""}
              </div>
            </article>
          `,
        )
        .join("")
    : `<article class="dashboard-lock"><p>No articles are available right now.</p></article>`;

  if (can("manageArticles")) {
    wrap.querySelectorAll("[data-article-edit-id]").forEach((button) => {
      button.addEventListener("click", () => startArticleEdit(button.dataset.articleEditId));
    });
    wrap.querySelectorAll("[data-article-delete-id]").forEach((button) => {
      button.addEventListener("click", () => deleteArticle(button.dataset.articleDeleteId));
    });
  }
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

function renderAdminUsers() {
  const wrap = document.getElementById("admin-user-list");
  if (!wrap) return;

  wrap.innerHTML = adminState.adminUsers.length
    ? adminState.adminUsers
        .map(
          (user) => `
            <article class="inventory-item inventory-item-copy">
              <div>
                <strong>${escapeHtml(user.name)}</strong>
                <p>${escapeHtml(user.email || user.username)} | ${escapeHtml(user.contactNumber || "No contact number")}</p>
              </div>
              <span class="status-pill">${escapeHtml(user.role.replaceAll("_", " "))}</span>
              <div class="inventory-actions">
                ${user.role === "sub_admin" ? `<button class="text-button danger-text" type="button" data-user-delete-id="${user.id}">Delete</button>` : `<span class="muted-note">Protected</span>`}
              </div>
            </article>
          `,
        )
        .join("")
    : `<article class="dashboard-lock"><p>No admin users available.</p></article>`;

  wrap.querySelectorAll("[data-user-delete-id]").forEach((button) => {
    button.addEventListener("click", () => deleteSubAdmin(button.dataset.userDeleteId));
  });
}

function renderSubscribers() {
  const wrap = document.getElementById("subscriber-list");
  if (!wrap) return;

  wrap.innerHTML = adminState.subscribers.length
    ? adminState.subscribers
        .map(
          (subscriber) => `
            <article class="inventory-item inventory-item-copy">
              <div>
                <strong>${escapeHtml(subscriber.name || "Newsletter subscriber")}</strong>
                <p>${escapeHtml(subscriber.email)}</p>
              </div>
              <span class="status-pill">${subscriber.active === false ? "inactive" : "active"}</span>
              <div class="inventory-actions">
                ${can("manageNewsletter") ? `<button class="text-button danger-text" type="button" data-subscriber-delete-id="${subscriber.id}">Remove</button>` : `<span class="muted-note">View only</span>`}
              </div>
            </article>
          `,
        )
        .join("")
    : `<article class="dashboard-lock"><p>No subscribers yet.</p></article>`;

  if (can("manageNewsletter")) {
    wrap.querySelectorAll("[data-subscriber-delete-id]").forEach((button) => {
      button.addEventListener("click", () => deleteSubscriber(button.dataset.subscriberDeleteId));
    });
  }
}

function renderNewsletterLogs() {
  const wrap = document.getElementById("newsletter-log-list");
  if (!wrap) return;

  wrap.innerHTML = adminState.newsletterLogs.length
    ? adminState.newsletterLogs
        .slice(0, 5)
        .map(
          (log) => `
            <article class="message-item">
              <div class="admin-status">
                <strong>${escapeHtml(log.subject)}</strong>
                <span>${formatDate(log.createdAt)}</span>
              </div>
              <p>Type: ${escapeHtml(log.type)}</p>
              <p>Sent to ${escapeHtml(String(log.deliveredCount || 0))} of ${escapeHtml(String(log.subscriberCount || 0))} subscribers.</p>
            </article>
          `,
        )
        .join("")
    : `<article class="dashboard-lock"><p>No newsletter campaigns sent yet.</p></article>`;
}

async function handleProductSubmit(event) {
  event.preventDefault();
  if (!can("manageProducts")) {
    siteApi.showToast("Your role cannot manage products.");
    return;
  }

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
    const method = adminState.editingProductId ? "PUT" : "POST";
    const endpoint = adminState.editingProductId ? `/api/products?id=${encodeURIComponent(adminState.editingProductId)}` : "/api/products";
    const response = await siteApi.apiFetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (adminState.editingProductId) {
      adminState.products = adminState.products.map((item) => (item.id === adminState.editingProductId ? response.product : item));
      siteApi.showToast("Product updated.");
    } else {
      adminState.products = [response.product, ...adminState.products];
      siteApi.showToast("Product added.");
    }

    renderInventory();
    resetProductForm();
  } catch (error) {
    siteApi.showToast(error.message || "Could not save product.");
  }
}

async function handleArticleSubmit(event) {
  event.preventDefault();
  if (!can("manageArticles")) {
    siteApi.showToast("Your role cannot manage articles.");
    return;
  }

  const form = event.currentTarget;
  const formData = new FormData(form);
  const payload = {
    title: String(formData.get("title") || "").trim(),
    slug: String(formData.get("slug") || "").trim() || slugify(String(formData.get("title") || "")),
    category: String(formData.get("category") || "").trim(),
    status: String(formData.get("status") || "published").trim(),
    summary: String(formData.get("summary") || "").trim(),
    problem: String(formData.get("problem") || "").trim(),
    intro: parseParagraphs(formData.get("intro")),
    whatToLookFor: parseLines(formData.get("whatToLookFor")),
    picks: parsePicks(formData.get("picks")),
    pros: parseLines(formData.get("pros")),
    cons: parseLines(formData.get("cons")),
    finalRecommendation: String(formData.get("finalRecommendation") || "").trim(),
    links: buildArticleLinks(formData),
    clientArticles: adminState.articles,
  };

  try {
    const method = adminState.editingArticleId ? "PUT" : "POST";
    const endpoint = adminState.editingArticleId ? `/api/articles?id=${encodeURIComponent(adminState.editingArticleId)}` : "/api/articles";
    const response = await siteApi.apiFetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (adminState.editingArticleId) {
      adminState.articles = adminState.articles.map((item) => (item.id === adminState.editingArticleId ? response.article : item));
      siteApi.showToast(`Article ${response.article.status === "draft" ? "saved as draft" : "updated"}.`);
    } else {
      adminState.articles = [response.article, ...adminState.articles];
      siteApi.showToast(response.article.status === "draft" ? "Draft article saved." : "Article published.");
    }

    renderArticles();
    resetArticleForm();
  } catch (error) {
    siteApi.showToast(error.message || "Could not save article.");
  }
}

async function handleSubAdminSubmit(event) {
  event.preventDefault();
  if (!can("manageUsers")) {
    siteApi.showToast("Only the master admin can manage users.");
    return;
  }

  const formData = new FormData(event.currentTarget);
  try {
    const response = await siteApi.apiFetch("/api/admin-users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        contactNumber: formData.get("contactNumber"),
        email: formData.get("email"),
        password: formData.get("password"),
      }),
    });
    adminState.adminUsers = [response.user, ...adminState.adminUsers];
    renderAdminUsers();
    resetSubAdminForm();
    siteApi.showToast("Sub-admin created.");
  } catch (error) {
    siteApi.showToast(error.message || "Could not create sub-admin.");
  }
}

async function handleManualNewsletter(event) {
  event.preventDefault();
  if (!can("manageNewsletter")) {
    siteApi.showToast("Only the master admin can send newsletters.");
    return;
  }

  const formData = new FormData(event.currentTarget);
  try {
    const response = await siteApi.apiFetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: formData.get("subject"),
        body: formData.get("body"),
        mode: "manual",
      }),
    });
    adminState.newsletterLogs = [response.campaign, ...adminState.newsletterLogs];
    renderNewsletterLogs();
    event.currentTarget.reset();
    siteApi.showToast(
      response.smtpConfigured ? "Newsletter sent to subscribers." : "Newsletter campaign saved, but SMTP is not configured yet.",
    );
  } catch (error) {
    siteApi.showToast(error.message || "Could not send newsletter.");
  }
}

async function sendWeeklyDigestNow() {
  if (!can("manageNewsletter")) {
    siteApi.showToast("Only the master admin can send newsletters.");
    return;
  }

  try {
    const response = await siteApi.apiFetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "weekly_digest",
      }),
    });
    adminState.newsletterLogs = [response.campaign, ...adminState.newsletterLogs];
    renderNewsletterLogs();
    siteApi.showToast(
      response.smtpConfigured ? "Weekly digest sent." : "Weekly digest prepared, but SMTP is not configured yet.",
    );
  } catch (error) {
    siteApi.showToast(error.message || "Could not send the weekly digest.");
  }
}

function startProductEdit(productId) {
  const product = adminState.products.find((item) => item.id === productId);
  if (!product || !can("manageProducts")) return;

  adminState.editingProductId = product.id;
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

function startArticleEdit(articleId) {
  const article = adminState.articles.find((item) => item.id === articleId);
  if (!article || !can("manageArticles")) return;

  adminState.editingArticleId = article.id;
  document.getElementById("admin-article-form-title").textContent = "Edit article";
  document.getElementById("admin-article-save-button").textContent = "Update Article";
  document.getElementById("admin-article-cancel-button").classList.remove("hidden");
  document.getElementById("admin-article-title").value = article.title;
  document.getElementById("admin-article-slug").value = article.slug;
  document.getElementById("admin-article-category").value = article.category;
  document.getElementById("admin-article-status").value = article.status || "published";
  document.getElementById("admin-article-summary").value = article.summary;
  document.getElementById("admin-article-problem").value = article.problem;
  document.getElementById("admin-article-intro").value = (article.intro || []).join("\n\n");
  document.getElementById("admin-article-look-for").value = (article.whatToLookFor || []).join("\n");
  document.getElementById("admin-article-picks").value = (article.picks || []).map((pick) => `${pick.name} | ${pick.text}`).join("\n");
  document.getElementById("admin-article-pros").value = (article.pros || []).join("\n");
  document.getElementById("admin-article-cons").value = (article.cons || []).join("\n");
  document.getElementById("admin-article-final").value = article.finalRecommendation;
  document.getElementById("admin-article-link1-label").value = article.links?.[0]?.label || "";
  document.getElementById("admin-article-link1-url").value = article.links?.[0]?.url || "";
  document.getElementById("admin-article-link2-label").value = article.links?.[1]?.label || "";
  document.getElementById("admin-article-link2-url").value = article.links?.[1]?.url || "";
  document.getElementById("admin-article-form").scrollIntoView({ behavior: "smooth", block: "start" });
}

async function deleteProduct(productId) {
  if (!can("manageProducts")) return;
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
    if (adminState.editingProductId === productId) resetProductForm();
    siteApi.showToast(`Removed ${product.name}.`);
  } catch (error) {
    siteApi.showToast(error.message || "Could not delete product.");
  }
}

async function deleteArticle(articleId) {
  if (!can("manageArticles")) return;
  const article = adminState.articles.find((item) => item.id === articleId);
  if (!article) return;

  try {
    await siteApi.apiFetch(`/api/articles?id=${encodeURIComponent(articleId)}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientArticles: adminState.articles }),
    });
    adminState.articles = adminState.articles.filter((item) => item.id !== articleId);
    renderArticles();
    if (adminState.editingArticleId === articleId) resetArticleForm();
    siteApi.showToast(`Removed ${article.title}.`);
  } catch (error) {
    siteApi.showToast(error.message || "Could not delete article.");
  }
}

async function deleteSubAdmin(userId) {
  if (!can("manageUsers")) return;

  try {
    await siteApi.apiFetch(`/api/admin-users?id=${encodeURIComponent(userId)}`, {
      method: "DELETE",
    });
    adminState.adminUsers = adminState.adminUsers.filter((item) => item.id !== userId);
    renderAdminUsers();
    siteApi.showToast("Sub-admin removed.");
  } catch (error) {
    siteApi.showToast(error.message || "Could not delete sub-admin.");
  }
}

async function deleteSubscriber(subscriberId) {
  if (!can("manageNewsletter")) return;

  try {
    await siteApi.apiFetch(`/api/subscribers?id=${encodeURIComponent(subscriberId)}`, {
      method: "DELETE",
    });
    adminState.subscribers = adminState.subscribers.filter((item) => item.id !== subscriberId);
    renderSubscribers();
    siteApi.showToast("Subscriber removed.");
  } catch (error) {
    siteApi.showToast(error.message || "Could not remove subscriber.");
  }
}

function resetProductForm() {
  adminState.editingProductId = null;
  adminState.uploadedImage = "";
  document.getElementById("admin-product-form")?.reset();
  document.getElementById("admin-form-title").textContent = "Add recommendation";
  document.getElementById("admin-save-button").textContent = "Save Recommendation";
  document.getElementById("admin-cancel-button").classList.add("hidden");
}

function resetArticleForm() {
  adminState.editingArticleId = null;
  document.getElementById("admin-article-form")?.reset();
  document.getElementById("admin-article-form-title").textContent = "Publish article";
  document.getElementById("admin-article-save-button").textContent = "Publish Article";
  document.getElementById("admin-article-status").value = "published";
  document.getElementById("admin-article-cancel-button").classList.add("hidden");
}

function resetSubAdminForm() {
  document.getElementById("admin-user-form")?.reset();
}

function cancelProductEdit() {
  resetProductForm();
  siteApi.showToast("Product edit cancelled.");
}

function cancelArticleEdit() {
  resetArticleForm();
  siteApi.showToast("Article edit cancelled.");
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

function buildArticleLinks(formData) {
  return [
    {
      label: String(formData.get("link1Label") || "").trim(),
      url: String(formData.get("link1Url") || "").trim(),
    },
    {
      label: String(formData.get("link2Label") || "").trim(),
      url: String(formData.get("link2Url") || "").trim(),
    },
  ].filter((link) => link.label && link.url);
}

function parseParagraphs(value) {
  return String(value || "")
    .split(/\n\s*\n|\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseLines(value) {
  return String(value || "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parsePicks(value) {
  return parseLines(value)
    .map((line) => {
      const [name, ...rest] = line.split("|");
      return {
        name: String(name || "").trim(),
        text: rest.join("|").trim(),
      };
    })
    .filter((pick) => pick.name && pick.text);
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function can(permissionKey) {
  if (!adminState.user) return false;
  if (adminState.user.role === "master_admin") return true;
  return Boolean(adminState.user.permissions && adminState.user.permissions[permissionKey]);
}

function toggleHidden(id, shouldHide) {
  const element = document.getElementById(id);
  if (!element) return;
  element.classList.toggle("hidden", shouldHide);
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
