const storageKeys = {
  token: "affiliate-uk-token-v1",
  sessionUser: "affiliate-uk-session-user-v1",
};

const content = window.DailyDealsUkContent || { articles: [], categories: [] };
const siteState = {
  articles: Array.isArray(content.articles) ? content.articles : [],
  categories: Array.isArray(content.categories) ? content.categories : [],
};
const brandName = "DailyDealsUK";
const contactEmail = "info.dailydealsuk@gmail.com";
const mobileMenuQuery = typeof window !== "undefined" && window.matchMedia ? window.matchMedia("(max-width: 860px)") : null;

document.addEventListener("DOMContentLoaded", async () => {
  renderShell();
  wireGlobalEvents();
  await validateSession();
  await renderPage();
});

function renderShell() {
  const active = document.body.dataset.active || "";
  const headerTarget = document.getElementById("site-header-slot");
  const footerTarget = document.getElementById("site-footer-slot");
  const modalTarget = document.getElementById("site-modal-slot");

  if (headerTarget) {
    headerTarget.innerHTML = `
      <div class="announcement-bar">${brandName} is reader-supported. As an Amazon Associate, we may earn from qualifying purchases.</div>
      <header class="site-header">
        <div class="brand-block">
          <a class="brand" href="/index.html">${brandName}</a>
        </div>
        <button class="nav-toggle" type="button" id="nav-toggle" aria-expanded="false" aria-controls="primary-nav">
          <span class="nav-toggle-lines" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </span>
          <span>Menu</span>
        </button>
        <nav class="main-nav" id="primary-nav" aria-label="Primary">
          ${navLink("Home", "/index.html", active === "home")}
          ${navLink("Articles", "/articles.html", active === "articles")}
          ${navLink("Recommendations", "/recommendations.html", active === "recommendations")}
          ${navLink("About Us", "/about.html", active === "about")}
          ${navLink("Privacy Policy", "/privacy.html", active === "privacy")}
          ${navLink("Contact Us", "/contact.html", active === "contact")}
          ${navLink("Categories", "/categories.html", active === "categories")}
        </nav>
        <div class="header-actions">
          <button class="sign-button" type="button" id="login-trigger">Sign In</button>
          <a class="ghost-link hidden" id="dashboard-link" href="/admin.html">Dashboard</a>
          <button class="ghost-button hidden" type="button" id="logout-button">Logout</button>
        </div>
      </header>
    `;
  }

  if (footerTarget) {
    footerTarget.innerHTML = `
      <footer class="site-footer">
        <div class="footer-block">
          <strong>${brandName}</strong>
          <p>Practical buying guides, product comparisons, and everyday recommendations designed to help readers make clearer shopping decisions.</p>
        </div>
        <div class="footer-block">
          <strong>Disclosure</strong>
          <p>As an Amazon Associate, we earn from qualifying purchases. Prices and availability can change, so always check current details before you buy.</p>
        </div>
        <div class="footer-block">
          <strong>Weekly Newsletter</strong>
          <p>Subscribe for one useful weekly email featuring fresh articles, practical picks, and reader-friendly buying advice.</p>
          <form class="stack-form" id="newsletter-subscribe-form">
            <label>
              <span>Name</span>
              <input name="name" type="text" placeholder="Your name">
            </label>
            <label>
              <span>Email</span>
              <input name="email" type="email" required placeholder="you@example.com">
            </label>
            <div class="inline-actions">
              <button class="button-primary" type="submit">Subscribe</button>
            </div>
          </form>
        </div>
      </footer>
    `;
  }

  if (modalTarget) {
    modalTarget.innerHTML = `
      <div class="modal-backdrop hidden" id="login-modal" aria-hidden="true">
        <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="login-title">
          <button class="modal-close" type="button" id="close-login-modal" aria-label="Close login">&times;</button>
          <p class="eyebrow">Private Access</p>
          <h2 id="login-title">Sign in to the dashboard</h2>
          <p>This login is for ${brandName} administrators only. Public readers can browse guides, recommendations, and newsletter signup without an account.</p>
          <form id="login-form" class="stack-form">
            <label>
              <span>Email or Username</span>
              <input name="username" type="text" required placeholder="masteradmin or admin email">
            </label>
            <label>
              <span>Password</span>
              <input name="password" type="password" required placeholder="admin123">
            </label>
            <div class="inline-actions">
              <button class="button-primary" type="submit">Sign In</button>
            </div>
          </form>
        </div>
      </div>
      <div class="toast" id="toast" role="status" aria-live="polite"></div>
    `;
  }
}

function navLink(label, href, isActive) {
  return `<a class="${isActive ? "active" : ""}" href="${href}">${label}</a>`;
}

function wireGlobalEvents() {
  document.getElementById("nav-toggle")?.addEventListener("click", toggleMobileMenu);
  document.querySelectorAll(".main-nav a").forEach((link) => {
    link.addEventListener("click", closeMobileMenu);
  });
  document.getElementById("login-trigger")?.addEventListener("click", openLoginModal);
  document.getElementById("close-login-modal")?.addEventListener("click", closeLoginModal);
  document.getElementById("login-modal")?.addEventListener("click", (event) => {
    if (event.target.id === "login-modal") closeLoginModal();
  });
  document.getElementById("login-form")?.addEventListener("submit", handleLogin);
  document.getElementById("logout-button")?.addEventListener("click", handleLogout);
  document.getElementById("contact-form")?.addEventListener("submit", handleContactSubmit);
  document.getElementById("newsletter-subscribe-form")?.addEventListener("submit", handleNewsletterSubscribe);
  mobileMenuQuery?.addEventListener?.("change", syncMobileMenuToViewport);
  syncMobileMenuToViewport();
}

async function validateSession() {
  const token = getStoredToken();
  if (!token) {
    updateAuthUi(null);
    return null;
  }

  try {
    const response = await apiFetch("/api/session");
    storeSession(token, response.user);
    updateAuthUi(response.user);
    return response.user;
  } catch {
    clearStoredSession();
    updateAuthUi(null);
    return null;
  }
}

function updateAuthUi(user) {
  const loginTrigger = document.getElementById("login-trigger");
  const dashboardLink = document.getElementById("dashboard-link");
  const logoutButton = document.getElementById("logout-button");

  if (user) {
    loginTrigger?.classList.add("hidden");
    dashboardLink?.classList.remove("hidden");
    logoutButton?.classList.remove("hidden");
  } else {
    loginTrigger?.classList.remove("hidden");
    dashboardLink?.classList.add("hidden");
    logoutButton?.classList.add("hidden");
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);

  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: formData.get("username"),
        password: formData.get("password"),
      }),
    });

    const data = await readResponseData(response);
    if (!response.ok) throw new Error(data.error || "Login failed.");

    storeSession(data.token, data.user);
    closeMobileMenu();
    closeLoginModal();
    form.reset();
    showToast(`Signed in as ${data.user.name}.`);
    window.location.href = "/admin.html";
  } catch (error) {
    showToast(error.message || "Login failed.");
  }
}

async function handleLogout() {
  try {
    const token = getStoredToken();
    if (token) {
      await fetch("/api/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  } catch {
    // Keep logout resilient.
  }

  clearStoredSession();
  updateAuthUi(null);
  closeMobileMenu();
  showToast("Signed out.");
  if (document.body.dataset.page === "admin") {
    window.location.href = "/index.html";
  }
}

async function handleContactSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);

  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        subject: formData.get("subject"),
        message: formData.get("message"),
      }),
    });

    const data = await readResponseData(response);
    if (!response.ok) throw new Error(data.error || "Could not send message.");

    form.reset();
    showToast("Message sent successfully.");
    return data;
  } catch (error) {
    showToast(error.message || "Could not send message.");
    return null;
  }
}

async function handleNewsletterSubscribe(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);

  try {
    const response = await fetch("/api/subscribers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
      }),
    });

    const data = await readResponseData(response);
    if (!response.ok) throw new Error(data.error || "Could not subscribe right now.");

    form.reset();
    showToast(data.message || "Subscription confirmed.");
  } catch (error) {
    showToast(error.message || "Could not subscribe right now.");
  }
}

async function renderPage() {
  const page = document.body.dataset.page;

  if (page === "home") {
    await renderHomePage();
  } else if (page === "articles") {
    await renderArticlesPage();
  } else if (page === "article") {
    await renderArticleDetailPage();
  } else if (page === "categories") {
    renderCategoriesPage();
  } else if (page === "category") {
    await renderCategoryDetailPage();
  } else if (page === "recommendations") {
    await renderRecommendationsPage();
  } else if (page === "contact") {
    renderContactSidebar();
  }
}

async function ensureArticlesLoaded(force = false) {
  if (!force && siteState.articles.length) return siteState.articles;

  try {
    const response = await fetch("/api/articles");
    const data = await readResponseData(response);
    if (response.ok && Array.isArray(data.articles) && data.articles.length) {
      siteState.articles = data.articles;
    }
  } catch {
    // Keep fallback content if live articles cannot be loaded.
  }

  return siteState.articles;
}

async function renderHomePage() {
  const articleWrap = document.getElementById("home-article-grid");
  const categoryWrap = document.getElementById("home-category-grid");
  const articles = await ensureArticlesLoaded();

  if (articleWrap) {
    articleWrap.innerHTML = articles.length
      ? articles
          .slice(0, 4)
          .map(
            (article) => `
              <article class="content-card">
                <p class="eyebrow">${escapeHtml(article.category)}</p>
                <h3>${escapeHtml(article.title)}</h3>
                <p>${escapeHtml(article.summary)}</p>
                <a class="text-link" href="/article.html?slug=${encodeURIComponent(article.slug)}">Read full guide</a>
              </article>
            `,
          )
          .join("")
      : `<article class="page-panel"><p>Articles are being prepared right now. Please check back shortly.</p></article>`;
  }

  if (categoryWrap) {
    categoryWrap.innerHTML = siteState.categories
      .slice(0, 8)
      .map(
        (category) => `
          <article class="content-card">
            <p class="eyebrow">Category</p>
            <h3>${escapeHtml(category.name)}</h3>
            <p>${escapeHtml(category.description)}</p>
            <a class="text-link" href="/category.html?slug=${encodeURIComponent(category.slug)}">Explore category</a>
          </article>
        `,
      )
      .join("");
  }
}

async function renderArticlesPage() {
  const wrap = document.getElementById("articles-grid");
  if (!wrap) return;
  const articles = await ensureArticlesLoaded();

  wrap.innerHTML = articles.length
    ? articles
        .map(
          (article) => `
            <article class="content-card">
              <p class="eyebrow">${escapeHtml(article.category)}</p>
              <h3>${escapeHtml(article.title)}</h3>
              <p>${escapeHtml(article.summary)}</p>
              <div class="tag-row">
                <span class="tag">Buying Guide</span>
                <span class="tag">${escapeHtml(article.status === "draft" ? "Draft" : "Published")}</span>
              </div>
              <a class="text-link" href="/article.html?slug=${encodeURIComponent(article.slug)}">Open guide</a>
            </article>
          `,
        )
        .join("")
    : `<article class="page-panel"><p>No articles are available yet.</p></article>`;
}

async function renderArticleDetailPage() {
  const slug = new URLSearchParams(window.location.search).get("slug");
  const articles = await ensureArticlesLoaded();
  const article = articles.find((item) => item.slug === slug) || articles[0];
  const hero = document.getElementById("article-hero");
  const body = document.getElementById("article-body");
  const related = document.getElementById("related-articles");

  if (!article) {
    if (hero) {
      hero.innerHTML = `
        <p class="eyebrow">Article</p>
        <h1>Article not found</h1>
        <p class="lede">This guide could not be loaded. Please return to the articles page and choose another topic.</p>
      `;
    }
    if (body) {
      body.innerHTML = `<section class="page-panel"><p>The requested article is not available right now.</p></section>`;
    }
    if (related) related.innerHTML = "";
    return;
  }

  if (hero) {
    document.title = `${article.title} | ${brandName}`;
    hero.innerHTML = `
      <p class="eyebrow">${escapeHtml(article.category)}</p>
      <h1>${escapeHtml(article.title)}</h1>
      <p class="lede">${escapeHtml(article.summary)}</p>
    `;
  }

  if (body) {
    body.innerHTML = `
      <section class="page-panel">
        <h2>The problem this guide solves</h2>
        <p>${escapeHtml(article.problem)}</p>
      </section>
      <section class="page-panel">
        <h2>Introduction</h2>
        ${article.intro.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
      </section>
      <section class="page-panel">
        <h2>What to look for</h2>
        <ul class="article-list">
          ${article.whatToLookFor.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </section>
      <section class="page-panel">
        <h2>Recommended picks</h2>
        <div class="detail-grid">
          ${article.picks
            .map(
              (pick) => `
                <article class="sub-card">
                  <h3>${escapeHtml(pick.name)}</h3>
                  <p>${escapeHtml(pick.text)}</p>
                </article>
              `,
            )
            .join("")}
        </div>
      </section>
      <section class="page-panel dual-panel">
        <article class="sub-card">
          <h3>Pros</h3>
          <ul class="article-list">
            ${article.pros.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
        </article>
        <article class="sub-card">
          <h3>Cons</h3>
          <ul class="article-list">
            ${article.cons.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
        </article>
      </section>
      <section class="page-panel">
        <h2>Final recommendation</h2>
        <p>${escapeHtml(article.finalRecommendation)}</p>
      </section>
      <section class="page-panel">
        <h2>Useful links</h2>
        <div class="link-stack">
          ${article.links
            .map(
              (link) => `
                <a class="affiliate-link" href="${escapeAttribute(link.url)}" target="_blank" rel="nofollow sponsored noopener noreferrer">${escapeHtml(link.label)}</a>
              `,
            )
            .join("")}
        </div>
        <p class="muted-note">We keep Amazon links limited and only add them where they help readers compare a product or check current availability.</p>
      </section>
    `;
  }

  if (related) {
    related.innerHTML = articles
      .filter((item) => item.slug !== article.slug)
      .slice(0, 3)
      .map(
        (item) => `
          <article class="content-card">
            <p class="eyebrow">${escapeHtml(item.category)}</p>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.summary)}</p>
            <a class="text-link" href="/article.html?slug=${encodeURIComponent(item.slug)}">Read guide</a>
          </article>
        `,
      )
      .join("");
  }
}

function renderCategoriesPage() {
  const wrap = document.getElementById("categories-grid");
  if (!wrap) return;

  wrap.innerHTML = siteState.categories
    .map(
      (category) => `
        <article class="content-card">
          <p class="eyebrow">Category</p>
          <h3>${escapeHtml(category.name)}</h3>
          <p>${escapeHtml(category.description)}</p>
          <a class="text-link" href="/category.html?slug=${encodeURIComponent(category.slug)}">Open category page</a>
        </article>
      `,
    )
    .join("");
}

async function renderCategoryDetailPage() {
  const slug = new URLSearchParams(window.location.search).get("slug");
  await ensureArticlesLoaded();
  const category = siteState.categories.find((item) => item.slug === slug) || siteState.categories[0];
  const hero = document.getElementById("category-hero");
  const sections = document.getElementById("category-sections");
  const productsWrap = document.getElementById("category-products");

  if (hero) {
    document.title = `${category.name} | ${brandName}`;
    hero.innerHTML = `
      <p class="eyebrow">Category</p>
      <h1>${escapeHtml(category.name)}</h1>
      <p class="lede">${escapeHtml(category.description)}</p>
    `;
  }

  if (sections) {
    sections.innerHTML = category.sections
      .map(
        (section) => `
          <article class="sub-card">
            <h3>${escapeHtml(section.title)}</h3>
            <p>${escapeHtml(section.text)}</p>
          </article>
        `,
      )
      .join("");
  }

  if (productsWrap) {
    try {
      const response = await fetch("/api/products");
      const data = await readResponseData(response);
      const products = (data.products || []).filter((item) => item.category === category.productCategory || item.category === category.name);

      productsWrap.innerHTML = products.length
        ? products
            .map(
              (product) => `
                <article class="product-card compact-card">
                  <img class="product-image" src="${escapeAttribute(product.image)}" alt="${escapeAttribute(product.name)}">
                  <div class="product-body">
                    <span class="tag">${escapeHtml(product.category)}</span>
                    <h3>${escapeHtml(product.name)}</h3>
                    <p>${escapeHtml(product.description)}</p>
                    <div class="product-meta-line">
                      <span>${escapeHtml(product.brand)}</span>
                      <strong>GBP ${formatPrice(product.price)}</strong>
                    </div>
                    <a class="button-primary inline-button" href="${escapeAttribute(product.affiliateUrl)}" target="_blank" rel="nofollow sponsored noopener noreferrer">Check current price</a>
                  </div>
                </article>
              `,
            )
            .join("")
        : `<article class="page-panel"><p>No recommendations are currently available in this category.</p></article>`;
    } catch {
      productsWrap.innerHTML = `<article class="page-panel"><p>Could not load recommendations right now.</p></article>`;
    }
  }

  const relatedArticleLink = document.getElementById("category-related-article");
  const relatedArticle = siteState.articles.find((item) => item.slug === category.relatedArticle);
  if (relatedArticleLink) {
    relatedArticleLink.innerHTML = relatedArticle
      ? `<a class="text-link" href="/article.html?slug=${encodeURIComponent(relatedArticle.slug)}">Read the related guide: ${escapeHtml(relatedArticle.title)}</a>`
      : `<p class="muted-note">This category is being expanded with more editorial guides.</p>`;
  }
}

async function renderRecommendationsPage() {
  const featureWrap = document.getElementById("recommendation-feature");
  const chipsWrap = document.getElementById("recommendation-chips");
  const gridWrap = document.getElementById("recommendation-grid");
  const searchInput = document.getElementById("recommendation-search");
  if (!gridWrap) return;

  try {
    const response = await fetch("/api/products");
    const data = await readResponseData(response);
    const products = data.products || [];
    let activeCategory = "All";
    let searchTerm = "";

    const render = () => {
      const filtered = products.filter((product) => {
        const matchesCategory = activeCategory === "All" || product.category === activeCategory;
        const haystack = `${product.name} ${product.brand} ${product.soldBy} ${product.category}`.toLowerCase();
        const matchesSearch = !searchTerm || haystack.includes(searchTerm);
        return matchesCategory && matchesSearch;
      });

      const feature = filtered[0] || products[0];
      if (featureWrap && feature) {
        featureWrap.innerHTML = `
          <article class="feature-card">
            <img src="${escapeAttribute(feature.image)}" alt="${escapeAttribute(feature.name)}">
            <div>
              <p class="eyebrow">Featured Recommendation</p>
              <h2>${escapeHtml(feature.name)}</h2>
              <p>${escapeHtml(feature.description)}</p>
              <div class="feature-meta">
                <span>${escapeHtml(feature.brand)}</span>
                <span>${escapeHtml(feature.soldBy)}</span>
                <strong>GBP ${formatPrice(feature.price)}</strong>
              </div>
              <a class="button-primary inline-button" href="${escapeAttribute(feature.affiliateUrl)}" target="_blank" rel="nofollow sponsored noopener noreferrer">Check current price</a>
            </div>
          </article>
        `;
      }

      gridWrap.innerHTML = filtered.length
        ? filtered
            .map(
              (product) => `
                <article class="product-card compact-card">
                  <img class="product-image" src="${escapeAttribute(product.image)}" alt="${escapeAttribute(product.name)}">
                  <div class="product-body">
                    <span class="tag">${escapeHtml(product.category)}</span>
                    <h3>${escapeHtml(product.name)}</h3>
                    <p>${escapeHtml(product.description)}</p>
                    <div class="product-meta-line">
                      <span>${escapeHtml(product.brand)}</span>
                      <strong>GBP ${formatPrice(product.price)}</strong>
                    </div>
                    <a class="button-primary inline-button" href="${escapeAttribute(product.affiliateUrl)}" target="_blank" rel="nofollow sponsored noopener noreferrer">Check current price</a>
                  </div>
                </article>
              `,
            )
            .join("")
        : `<article class="page-panel"><p>No recommendations match that search right now.</p></article>`;
    };

    if (chipsWrap) {
      const categories = ["All", ...new Set(products.map((product) => product.category).filter(Boolean))];
      const renderChips = () => {
        chipsWrap.innerHTML = categories
          .map(
            (category) => `
              <button class="chip ${category === activeCategory ? "active" : ""}" type="button" data-category="${escapeAttribute(category)}">${escapeHtml(category)}</button>
            `,
          )
          .join("");
        chipsWrap.querySelectorAll("[data-category]").forEach((button) => {
          button.addEventListener("click", () => {
            activeCategory = button.dataset.category;
            renderChips();
            render();
          });
        });
      };
      renderChips();
    }

    searchInput?.addEventListener("input", (event) => {
      searchTerm = event.target.value.trim().toLowerCase();
      render();
    });

    render();
  } catch {
    gridWrap.innerHTML = `<article class="page-panel"><p>Could not load recommendations right now.</p></article>`;
  }
}

function renderContactSidebar() {
  const target = document.getElementById("contact-sidebar");
  if (!target) return;

  target.innerHTML = `
    <article class="sub-card">
      <h3>What to send</h3>
      <p>Questions, correction requests, broken-link reports, or suggestions for future buying guides are all welcome.</p>
    </article>
    <article class="sub-card">
      <h3>What to expect</h3>
      <p>We review messages regularly and try to reply as soon as possible. This is an editorial contact point, not a checkout support line.</p>
    </article>
    <article class="sub-card">
      <h3>Important note</h3>
      <p>Purchases are completed on Amazon, not on this website. If an order issue relates to shipping or returns, Amazon support will usually be the right place to check first. For editorial or partnership requests, email ${contactEmail}.</p>
    </article>
  `;
}

function toggleMobileMenu() {
  const shouldOpen = !document.body.classList.contains("nav-open");
  setMobileMenuState(shouldOpen);
}

function closeMobileMenu() {
  setMobileMenuState(false);
}

function setMobileMenuState(isOpen) {
  const toggle = document.getElementById("nav-toggle");
  if (!mobileMenuQuery?.matches) {
    document.body.classList.remove("nav-open");
    toggle?.setAttribute("aria-expanded", "false");
    return;
  }

  document.body.classList.toggle("nav-open", isOpen);
  toggle?.setAttribute("aria-expanded", isOpen ? "true" : "false");
}

function syncMobileMenuToViewport() {
  if (!mobileMenuQuery?.matches) {
    document.body.classList.remove("nav-open");
    document.getElementById("nav-toggle")?.setAttribute("aria-expanded", "false");
  }
}

function openLoginModal() {
  const modal = document.getElementById("login-modal");
  modal?.classList.remove("hidden");
  modal?.setAttribute("aria-hidden", "false");
}

function closeLoginModal() {
  const modal = document.getElementById("login-modal");
  modal?.classList.add("hidden");
  modal?.setAttribute("aria-hidden", "true");
}

function getStoredToken() {
  return localStorage.getItem(storageKeys.token) || "";
}

function getStoredUser() {
  try {
    const raw = localStorage.getItem(storageKeys.sessionUser);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function storeSession(token, user) {
  localStorage.setItem(storageKeys.token, token);
  localStorage.setItem(storageKeys.sessionUser, JSON.stringify(user));
}

function clearStoredSession() {
  localStorage.removeItem(storageKeys.token);
  localStorage.removeItem(storageKeys.sessionUser);
}

async function apiFetch(url, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = getStoredToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(url, { ...options, headers });
  const data = await readResponseData(response);
  if (!response.ok) throw new Error(data.error || "Request failed.");
  return data;
}

async function readResponseData(response) {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json().catch(() => ({}));
  }

  const text = await response.text().catch(() => "");
  return {
    error: normaliseServerError(text),
  };
}

function normaliseServerError(text) {
  const cleaned = String(text || "").replace(/\s+/g, " ").trim();
  if (!cleaned) return "The server returned an empty response.";
  if (cleaned.startsWith("<!DOCTYPE") || cleaned.startsWith("<html")) return "The server returned an unexpected response.";
  return cleaned.slice(0, 180);
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2400);
}

function formatPrice(price) {
  return Number(price).toFixed(2);
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

window.DailyDealsUkSite = {
  apiFetch,
  clearStoredSession,
  getStoredToken,
  getStoredUser,
  readResponseData,
  showToast,
  storeSession,
};
