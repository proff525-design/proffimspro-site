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
  const target = +el.dataset.count;
  const duration = 1400;
  const start = performance.now();
  const format = (n) => n.toLocaleString("ru-RU");

  const tick = (now) => {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = format(Math.round(target * eased));
    if (p < 1) requestAnimationFrame(tick);
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
