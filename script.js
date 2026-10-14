const header = document.getElementById("header");
const burger = document.getElementById("burger");
const nav = document.getElementById("nav");

window.addEventListener("scroll", () => {
  header.classList.toggle("is-scrolled", window.scrollY > 10);
}, { passive: true });

burger.addEventListener("click", () => {
  burger.classList.toggle("is-open");
  nav.classList.toggle("is-open");
});

nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    burger.classList.remove("is-open");
    nav.classList.remove("is-open");
  });
});

const filters = document.querySelectorAll(".filter");
const cards = document.querySelectorAll("#projectGrid .card");

filters.forEach((btn) => {
  btn.addEventListener("click", () => {
    filters.forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    const cat = btn.dataset.filter;
    cards.forEach((card) => {
      const show = cat === "all" || card.dataset.category === cat;
      card.classList.toggle("is-hidden", !show);
    });
  });
});

const animateCounter = (el) => {
  const duration = 1400;
  const start = performance.now();
  const format = (n) => n.toLocaleString("ru-RU");

  const tick = (now) => {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = format(Math.round(+el.dataset.count * eased));
    if (p < 1) requestAnimationFrame(tick);
    else el.dataset.animated = "1";
  };
  requestAnimationFrame(tick);
};

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.querySelectorAll("[data-count]").forEach(animateCounter);
    statsObserver.unobserve(entry.target);
  });
}, { threshold: 0.4 });

const statsBlock = document.querySelector(".hero__stats");
if (statsBlock) statsObserver.observe(statsBlock);

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("is-visible");
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((el, i) => {
  el.style.transitionDelay = `${Math.min(i % 3, 2) * 80}ms`;
  revealObserver.observe(el);
});

const formatSubs = (n) => n.toLocaleString("ru-RU");

const applySubscribers = (n) => {
  document.querySelectorAll("[data-subs-text]").forEach((el) => {
    el.textContent = formatSubs(n);
  });
  document.querySelectorAll("[data-subs-count]").forEach((el) => {
    el.dataset.count = String(n);
    if (el.dataset.animated === "1") el.textContent = formatSubs(n);
  });
};

fetch("/api/subscribers", { headers: { accept: "application/json" } })
  .then((res) => (res.ok ? res.json() : null))
  .then((data) => {
    const n = data && +data.subscribers;
    if (n > 0) applySubscribers(n);
  })
  .catch(() => {});
