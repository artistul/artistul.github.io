const header = document.querySelector("[data-header]");
const meter = document.querySelector(".scroll-meter");

function updateScrollState() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  meter.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
  header.classList.toggle("is-scrolled", window.scrollY > 24);
}

window.addEventListener("scroll", updateScrollState, { passive: true });
updateScrollState();

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach((node) => revealObserver.observe(node));
