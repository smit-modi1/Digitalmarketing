const storageKeys = {
  token: "affiliate-uk-token-v1",
  sessionUser: "affiliate-uk-session-user-v1",
};

const fallbackImage =
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80";

const articles = [
  {
    id: "wireless-earbuds-2026",
    title: "Best Wireless Earbuds for Everyday Use in 2026",
    summary: "A practical guide for commuters, gym users, and everyday listeners who want comfortable earbuds without overpaying for features they will not use.",
    intro: [
      "Wireless earbuds are easy to buy badly. On paper, most pairs promise the same things: long battery life, punchy sound, and reliable Bluetooth. In practice, the differences show up after a week of commuting, a few work calls, and a couple of long listening sessions.",
      "For everyday use, comfort, connection stability, and case size matter just as much as sound quality. The best pair is usually the one that fits your routine without becoming annoying after an hour.",
    ],
    whatToLookFor: [
      "A shape you can wear comfortably for at least an hour at a time.",
      "Reliable connection and easy device switching if you use both a phone and laptop.",
      "Battery life that covers a normal day, not just a short commute.",
      "Call quality that still sounds decent when you are outside or moving around.",
      "Noise cancelling that helps in real environments, not just on a spec sheet.",
    ],
    picks: [
      {
        name: "Apple AirPods Pro (2nd generation)",
        text: "A strong everyday option for iPhone users because setup is simple, noise cancelling is consistently good, and the fit works for long listening sessions.",
      },
      {
        name: "Soundcore Liberty 4 NC",
        text: "A good value choice if you want better-than-expected noise cancelling and battery life without spending premium-brand money.",
      },
      {
        name: "Jabra Elite series",
        text: "Worth considering if call quality and a secure fit matter more to you than flashy features.",
      },
    ],
    pros: [
      "Easy to match a pair to your daily routine once you know what matters.",
      "Several good options now exist below the top premium price tier.",
      "Comfort and connection quality are usually more important than chasing the loudest bass.",
    ],
    cons: [
      "The wrong fit can make even a great-sounding pair frustrating.",
      "Battery claims are often optimistic compared with everyday use.",
      "Cheaper models can still struggle with call clarity in noisy places.",
    ],
    finalRecommendation:
      "If you want a simple shortlist, start with AirPods Pro if you are in the Apple ecosystem and compare them with Soundcore Liberty 4 NC if you care more about value. That gives you a solid premium-versus-budget benchmark before looking further.",
    links: [
      {
        label: "If you want a reliable premium option to compare prices and availability, see Apple AirPods Pro on Amazon.",
        url: "https://www.amazon.co.uk/s?k=Apple+AirPods+Pro+2nd+generation",
      },
      {
        label: "If value matters more, compare the current Soundcore Liberty 4 NC listings on Amazon.",
        url: "https://www.amazon.co.uk/s?k=Soundcore+Liberty+4+NC",
      },
    ],
  },
  {
    id: "budget-coffee-maker-guide",
    title: "How to Choose a Budget Coffee Maker That Actually Lasts",
    summary: "A beginner-friendly coffee maker guide for people who want better coffee at home without buying a machine that feels flimsy after a few months.",
    intro: [
      "A budget coffee maker does not need to feel cheap. Many people only need something dependable for one or two mugs a day, a machine that is simple to clean, and a result that tastes consistent without a long learning curve.",
      "The problem is that lower-price appliances often cut corners in places you notice later: awkward carafes, poor heat retention, hard-to-clean parts, or plastic pieces that wear too quickly. A good budget buy is usually the model that keeps things simple and does the basics well.",
    ],
    whatToLookFor: [
      "A water tank and filter area that are easy to reach and clean.",
      "A thermal or well-fitting glass carafe that pours cleanly.",
      "Straightforward controls rather than complicated timers you will never use.",
      "Replacement filters or parts that are easy to find.",
      "A brand with decent customer support and clear instructions.",
    ],
    picks: [
      {
        name: "De'Longhi Active Line Drip Coffee Maker",
        text: "A sensible pick if you want something simple, recognisable, and easy to understand straight out of the box.",
      },
      {
        name: "Russell Hobbs compact filter machines",
        text: "Often a practical option for smaller kitchens or occasional coffee drinkers.",
      },
      {
        name: "Melitta basic filter coffee makers",
        text: "Worth a look if you care more about repeatable results than extra features.",
      },
    ],
    pros: [
      "A good budget coffee maker can still make mornings noticeably easier.",
      "Simple models are often easier to maintain than flashy mid-range ones.",
      "This category gives you several solid options without moving into premium pricing.",
    ],
    cons: [
      "Cheaper machines can feel light or plasticky even when they brew well.",
      "Heat retention is often weaker than on more expensive models.",
      "You may need to trade extras for simplicity and reliability.",
    ],
    finalRecommendation:
      "If you just want straightforward filter coffee at home, start by comparing simple De'Longhi, Russell Hobbs, and Melitta models rather than chasing lots of features. Ease of cleaning and day-to-day reliability usually matter more than gimmicks here.",
    links: [
      {
        label: "If you want a simple starting point, compare De'Longhi drip coffee maker prices on Amazon.",
        url: "https://www.amazon.co.uk/s?k=De%27Longhi+Active+Line+Drip+Coffee+Maker",
      },
      {
        label: "For more compact budget options, browse Russell Hobbs filter coffee makers on Amazon.",
        url: "https://www.amazon.co.uk/s?k=Russell+Hobbs+filter+coffee+maker",
      },
    ],
  },
  {
    id: "home-office-essentials",
    title: "Top Home Office Essentials for Comfortable Work From Home Setups",
    summary: "A reader-first guide to the home office items that actually improve comfort and focus, especially if you spend long stretches at a desk.",
    intro: [
      "A better home office setup is rarely about buying everything at once. Most people improve comfort by fixing the one or two things that cause daily irritation: a cramped keyboard, poor posture, weak lighting, or nowhere comfortable to rest their wrists or feet.",
      "The best home office essentials are the products that remove friction. If something helps you sit more naturally, type more comfortably, or reduce end-of-day fatigue, it usually earns its place quickly.",
    ],
    whatToLookFor: [
      "Products that solve a clear comfort problem rather than just making the desk look tidier.",
      "Build quality strong enough for everyday use over months, not just a few weeks.",
      "Sizing that fits your actual desk and working habits.",
      "Simple setup, especially for keyboards, lights, and laptop accessories.",
      "A realistic upgrade path so you can improve one part of the setup at a time.",
    ],
    picks: [
      {
        name: "Logitech MX Keys S Wireless Keyboard",
        text: "A strong upgrade if you type for long periods and want a more comfortable, better-built keyboard than a basic bundled one.",
      },
      {
        name: "A supportive footrest",
        text: "Often underrated, but useful if your chair height and desk height do not line up well.",
      },
      {
        name: "A simple monitor light bar or adjustable desk lamp",
        text: "Helpful if eye strain becomes a problem late in the day.",
      },
    ],
    pros: [
      "Small, targeted upgrades can improve comfort more than a big expensive overhaul.",
      "Home office gear is usually worth it when it supports something you use every day.",
      "Several essentials can be bought gradually instead of all at once.",
    ],
    cons: [
      "It is easy to overspend on aesthetic accessories that do not solve a real problem.",
      "One person's ideal desk setup can be awkward for someone else.",
      "Comfort upgrades take a little trial and error to get right.",
    ],
    finalRecommendation:
      "If you are only changing one thing first, start with the item you touch or notice every day. For many people that is a keyboard, desk chair support, or lighting. A practical keyboard upgrade is often one of the easiest wins.",
    links: [
      {
        label: "If you want to compare a popular work-from-home keyboard, see the Logitech MX Keys S on Amazon.",
        url: "https://www.amazon.co.uk/s?k=Logitech+MX+Keys+S+Wireless+Keyboard",
      },
      {
        label: "If lower-body comfort is the issue, compare simple office footrests on Amazon.",
        url: "https://www.amazon.co.uk/s?k=office+footrest",
      },
    ],
  },
  {
    id: "best-baby-monitors",
    title: "Best Baby Monitors for Parents Who Want Simple, Reliable Features",
    summary: "A practical guide for parents who want clear video, dependable audio, and less hassle from baby monitors that try to do too much.",
    intro: [
      "Many parents do not need a baby monitor packed with advanced smart features. What they usually need is a steady connection, a clear picture, understandable setup, and a screen or app that does not become frustrating at 2am.",
      "A good baby monitor is the one you trust quickly. If the picture is easy to read, the audio is clear, and the controls make sense when you are tired, that matters far more than a long list of extras you never use.",
    ],
    whatToLookFor: [
      "Reliable signal and stable audio before anything else.",
      "A night mode that remains clear enough to be useful.",
      "Battery life that holds up during naps and evenings.",
      "Controls that are simple enough to use half-awake.",
      "A feature set that matches your comfort level, whether you want a dedicated screen or app-based viewing.",
    ],
    picks: [
      {
        name: "HelloBaby Video Baby Monitor",
        text: "A sensible starting point for parents who want a dedicated monitor and uncomplicated controls.",
      },
      {
        name: "VTech video monitors",
        text: "Often worth comparing for clear core features and familiar setup.",
      },
      {
        name: "LeapFrog or similar app-connected options",
        text: "Better suited to parents who specifically want smartphone access and are happy with a slightly more technical setup.",
      },
    ],
    pros: [
      "Simple monitors often feel less stressful than overcomplicated smart options.",
      "Dedicated screens can be easier to trust than app-only solutions.",
      "This is a category where reliability matters more than novelty.",
    ],
    cons: [
      "Wi-Fi and app-based models can introduce extra setup and troubleshooting.",
      "Very cheap models may compromise on night vision or sound quality.",
      "A longer feature list does not always mean a better experience.",
    ],
    finalRecommendation:
      "For most parents, the best starting point is a simple video monitor with a dedicated screen and dependable night vision. Compare complexity carefully before paying extra for smart features you may not actually need.",
    links: [
      {
        label: "If you want a simple screen-based option to compare, see current HelloBaby baby monitor listings on Amazon.",
        url: "https://www.amazon.co.uk/s?k=HelloBaby+Video+Baby+Monitor",
      },
      {
        label: "If you want to compare another familiar brand, browse VTech baby monitors on Amazon.",
        url: "https://www.amazon.co.uk/s?k=VTech+baby+monitor",
      },
    ],
  },
  {
    id: "air-fryer-buying-guide",
    title: "Air Fryer Buying Guide: What to Look For Before You Buy",
    summary: "A straightforward air fryer guide for households deciding between compact basket models and larger dual-zone machines.",
    intro: [
      "Air fryers are one of the easiest appliances to buy on impulse and then regret if the size is wrong. A model can look perfect online but feel too small for family meals, too big for the counter, or awkward to clean after a week of use.",
      "Before buying, think less about internet hype and more about your routine. How many people are you cooking for? Do you need to cook two things at once? How much worktop space do you actually have? Those questions usually point you to the right size and style much faster than marketing claims do.",
    ],
    whatToLookFor: [
      "Basket size that matches the number of people you usually cook for.",
      "Easy cleaning, especially around trays, drawers, and greasy corners.",
      "Reliable controls and presets that do not overcomplicate simple cooking.",
      "A shape that fits your kitchen without becoming permanent clutter.",
      "Dual-zone cooking only if you will genuinely use it.",
    ],
    picks: [
      {
        name: "Ninja Foodi Dual Zone Air Fryer",
        text: "A strong choice for families or couples who regularly cook multiple items at the same time.",
      },
      {
        name: "Tower compact basket air fryers",
        text: "Often more suitable for smaller kitchens and lighter use.",
      },
      {
        name: "Instant Vortex models",
        text: "Worth comparing if you want a balance of size, ease of use, and recognisable controls.",
      },
    ],
    pros: [
      "Air fryers can save time and reduce oven use during the week.",
      "The right size model often becomes a genuinely useful everyday appliance.",
      "There are good options for both small households and busier family kitchens.",
    ],
    cons: [
      "Oversized models take up more counter space than many people expect.",
      "A dual-zone machine is unnecessary if you mainly cook for one person.",
      "Marketing around capacity can be confusing if you do not picture real meal sizes.",
    ],
    finalRecommendation:
      "Choose size before brand. If you cook for several people or like running two foods at once, a dual-zone model makes sense. If not, a simpler basket air fryer may be easier to live with and better value.",
    links: [
      {
        label: "If you want to compare a popular family-size option, see the Ninja Foodi Dual Zone Air Fryer on Amazon.",
        url: "https://www.amazon.co.uk/s?k=Ninja+Foodi+Dual+Zone+Air+Fryer",
      },
      {
        label: "If you are looking for smaller alternatives, compare compact Tower air fryers on Amazon.",
        url: "https://www.amazon.co.uk/s?k=Tower+air+fryer",
      },
    ],
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
    const data = await readResponseData(response);
    if (!response.ok) throw new Error(data.error || "Could not load products.");
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
    authHint.textContent = "You can manage featured recommendations and review contact enquiries.";
    logoutButton.classList.remove("hidden");
  } else {
    activeUserName.textContent = "Guest Visitor";
    activeUserRole.textContent = "signed_out";
    sessionSummary.textContent = "Guest";
    authStatus.textContent = "Not signed in";
    authHint.textContent = "Private admin login only. Sign in as masteradmin to manage featured recommendations.";
    logoutButton.classList.add("hidden");
  }
}

function renderFeatureProduct() {
  const product = state.products.find((item) => item.id === state.selectedProductId) || state.products[0];
  const summary = document.getElementById("hero-summary");

  if (!product) {
    summary.textContent = "Point Marketing UK publishes practical buying guides, comparisons, and product recommendations to help readers choose with confidence.";
    document.getElementById("feature-image").src = fallbackImage;
    document.getElementById("feature-name").textContent = "No featured product yet";
    document.getElementById("feature-category").textContent = "General";
    document.getElementById("feature-brand").textContent = "-";
    document.getElementById("feature-seller").textContent = "-";
    document.getElementById("feature-price").textContent = "GBP 0.00";
    document.getElementById("feature-description").textContent = "Add a featured recommendation to populate this area.";
    document.getElementById("feature-link").href = "https://www.amazon.co.uk/";
    return;
  }

  state.selectedProductId = product.id;
  summary.textContent = `Featured today: ${product.name}. We use the recommendation area to surface useful, current products that fit naturally with our buying guides.`;
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
  const collection = document.getElementById("article-collection");

  wrap.innerHTML = articles
    .map(
      (article) => `
        <article class="article-card">
          <p class="section-label">Guide</p>
          <h3>${escapeHtml(article.title)}</h3>
          <p>${escapeHtml(article.summary)}</p>
          <a class="text-link" href="#article-${escapeAttribute(article.id)}">Read guide</a>
        </article>
      `,
    )
    .join("");

  collection.innerHTML = articles
    .map(
      (article) => `
        <article class="article-detail-card" id="article-${escapeAttribute(article.id)}">
          <div class="article-meta">
            <p class="section-label">Buying Guide</p>
            <h3>${escapeHtml(article.title)}</h3>
            <p>${escapeHtml(article.summary)}</p>
          </div>
          <div class="article-intro">
            ${article.intro.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
          </div>
          <div class="article-section-block">
            <h4>What to look for</h4>
            <ul class="article-list">
              ${article.whatToLookFor.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
            </ul>
          </div>
          <div class="article-section-block">
            <h4>Recommended picks</h4>
            <div class="article-picks">
              ${article.picks
                .map(
                  (pick) => `
                    <article class="article-pick">
                      <strong>${escapeHtml(pick.name)}</strong>
                      <p>${escapeHtml(pick.text)}</p>
                    </article>
                  `,
                )
                .join("")}
            </div>
          </div>
          <div class="pros-cons">
            <section class="copy-card article-subcard">
              <h4>Pros</h4>
              <ul class="article-list">
                ${article.pros.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
              </ul>
            </section>
            <section class="copy-card article-subcard">
              <h4>Cons</h4>
              <ul class="article-list">
                ${article.cons.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
              </ul>
            </section>
          </div>
          <div class="article-section-block">
            <h4>Final recommendation</h4>
            <p>${escapeHtml(article.finalRecommendation)}</p>
          </div>
          <div class="article-links">
            ${article.links
              .map(
                (link) => `
                  <a class="inline-affiliate-link" href="${escapeAttribute(link.url)}" target="_blank" rel="nofollow sponsored noopener noreferrer">
                    ${escapeHtml(link.label)}
                  </a>
                `,
              )
              .join("")}
          </div>
          <p class="article-note">Editorial note: if a guide includes Amazon links, they are added only where they help readers compare a relevant product or current availability.</p>
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
                <p>${escapeHtml(product.description || "Practical product recommendation for UK readers.")}</p>
              </div>
              <dl class="product-meta">
                <div><dt>Brand</dt><dd>${escapeHtml(product.brand)}</dd></div>
                <div><dt>Sold by</dt><dd>${escapeHtml(product.soldBy)}</dd></div>
                <div><dt>Price</dt><dd>GBP ${formatPrice(product.price)}</dd></div>
              </dl>
            </div>
          </button>
          <div class="product-actions">
            <button class="secondary-cta compact" type="button" data-select-id="${product.id}">View details</button>
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
        <p>Sign in to edit the featured product database.</p>
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
        <p>Reader enquiries and corrections will appear here.</p>
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
    form.reset();
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
    clientProducts: state.products,
  };

  try {
    const method = state.editingId ? "PUT" : "POST";
    const endpoint = state.editingId ? `/api/products?id=${encodeURIComponent(state.editingId)}` : "/api/products";
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
    const result = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        subject: formData.get("subject"),
        message: formData.get("message"),
      }),
    }).then(async (response) => {
      const data = await readResponseData(response);
      if (!response.ok) throw new Error(data.error || "Could not send message.");
      return data;
    });

    form.reset();
    if (state.user && result.message) {
      state.messages = [result.message, ...state.messages.filter((item) => item.id !== result.message.id)];
      renderMessages();
    }
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
    await apiFetch(`/api/products?id=${encodeURIComponent(productId)}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientProducts: state.products }),
    });
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
  if (cleaned.startsWith("<!DOCTYPE") || cleaned.startsWith("<html")) {
    return "The server returned an unexpected response.";
  }
  return cleaned.slice(0, 180);
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
