const header = document.querySelector("[data-header]");
const meter = document.querySelector(".scroll-meter");
const themeToggle = document.querySelector("[data-theme-toggle]");
const themeLabel = document.querySelector("[data-theme-label]");

function applyTheme(theme) {
  const resolved = theme === "light" ? "light" : "dark";
  document.documentElement.dataset.theme = resolved;
  document.documentElement.style.colorScheme = resolved;
  themeLabel.textContent = resolved === "dark" ? "Light" : "Dark";
  themeToggle.setAttribute("aria-label", `Switch to ${resolved === "dark" ? "light" : "dark"} mode`);
  document.querySelector('meta[name="theme-color"]').setAttribute("content", resolved === "dark" ? "#090909" : "#f2f0eb");
}

applyTheme(document.documentElement.dataset.theme);
themeToggle.addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
  localStorage.setItem("influx-theme", next);
  applyTheme(next);
});

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
