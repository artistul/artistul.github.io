const header = document.querySelector("[data-header]");
const meter = document.querySelector(".scroll-meter");
const sections = [...document.querySelectorAll(".doc-section")];
const tocLinks = [...document.querySelectorAll(".doc-toc a")];
const toc = document.querySelector(".doc-toc");
const tocToggle = document.querySelector("[data-toc-toggle]");
const tocCurrent = document.querySelector("[data-toc-current]");
let scrollFrame;

function updateScrollState() {
  scrollFrame = undefined;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  meter.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
  header.classList.toggle("is-scrolled", window.scrollY > 24);
}

window.addEventListener("scroll", () => {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScrollState);
}, { passive: true });
updateScrollState();

const revealObserver = new IntersectionObserver(
  (entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  }),
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((node) => revealObserver.observe(node));

const sectionObserver = new IntersectionObserver(
  (entries) => entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    tocLinks.forEach((link) => {
      const active = link.getAttribute("href") === `#${entry.target.id}`;
      link.classList.toggle("is-active", active);
      if (active) {
        link.setAttribute("aria-current", "location");
        if (tocCurrent) tocCurrent.textContent = link.textContent;
      }
      else link.removeAttribute("aria-current");
    });
  }),
  { rootMargin: "-25% 0px -65% 0px" }
);
sections.forEach((section) => sectionObserver.observe(section));

tocToggle?.addEventListener("click", () => {
  const open = toc.classList.toggle("is-open");
  tocToggle.setAttribute("aria-expanded", String(open));
});
tocLinks.forEach((link) => link.addEventListener("click", () => {
  toc?.classList.remove("is-open");
  tocToggle?.setAttribute("aria-expanded", "false");
}));
