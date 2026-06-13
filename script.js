const HUB = {
  tabs: {
    home: { title: "InFlux Origin | Project Hub" },
    versions: { title: "Machine Versions | InFlux Origin" },
    projects: { title: "Other Projects | InFlux Origin" },
    team: { title: "Team | InFlux Origin" },
    proof: { title: "Proof | InFlux Origin" },
    downloads: { title: "Download Hub | InFlux Origin" },
    links: { title: "External Links | InFlux Origin" }
  },
  downloads: [
    {
      name: "InFlux Operator APK",
      category: "Prototype operator artifact",
      description: "Latest bundled Android operator build for supervised InFlux demonstrations.",
      href: "assets/influx-operator-latest.apk",
      download: true
    },
    {
      name: "Technical Notebook",
      category: "Public documentation / PDF",
      description: "Ten-page public technical notebook covering the project, system, testing, and direction.",
      href: "assets/influx-origin-technical-notebook.pdf",
      download: true
    },
    {
      name: "Extended Technical Dossier",
      category: "Public documentation / web",
      description: "Long-form project documentation with mechanics, control, testing, costs, and next steps.",
      href: "technical.html",
      download: false
    },
    {
      name: "InFlux Origin Logo",
      category: "Public brand asset / SVG",
      description: "Scalable monochrome logo for project references and approved public coverage.",
      href: "assets/influx-origin-logo.svg",
      download: true
    }
  ]
};

const header = document.querySelector("[data-header]");
const meter = document.querySelector(".scroll-meter span");
const menu = document.querySelector("[data-menu]");
const nav = document.querySelector("#primary-nav");
const themeToggle = document.querySelector("[data-theme-toggle]");
const themeLabel = document.querySelector("[data-theme-label]");
const panels = [...document.querySelectorAll("[data-panel]")];
const navButtons = [...document.querySelectorAll("[data-nav]")];

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  if (themeLabel) themeLabel.textContent = theme === "light" ? "Dark" : "Light";
  themeToggle?.setAttribute("aria-label", `Switch to ${theme === "light" ? "dark" : "light"} mode`);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "light" ? "#f2f0eb" : "#080808");
}

applyTheme(document.documentElement.dataset.theme || "dark");

themeToggle?.addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
  localStorage.setItem("influx-theme", next);
  applyTheme(next);
});

function currentTabFromUrl() {
  const candidate = new URLSearchParams(window.location.search).get("tab");
  return HUB.tabs[candidate] ? candidate : "home";
}

function activateTab(tab, options = {}) {
  const target = HUB.tabs[tab] ? tab : "home";

  panels.forEach((panel) => {
    const active = panel.dataset.panel === target;
    panel.classList.toggle("is-active", active);
    panel.setAttribute("aria-hidden", String(!active));
  });

  navButtons.forEach((button) => {
    const active = button.dataset.nav === target;
    button.classList.toggle("is-active", active);
    if (button.getAttribute("role") === "tab") button.setAttribute("aria-selected", String(active));
  });

  document.title = HUB.tabs[target].title;
  nav?.classList.remove("is-open");
  menu?.setAttribute("aria-expanded", "false");

  if (!options.fromHistory) {
    const url = new URL(window.location.href);
    if (target === "home") url.searchParams.delete("tab");
    else url.searchParams.set("tab", target);
    window.history.pushState({ tab: target }, "", url);
  }

  if (!options.keepScroll) window.scrollTo({ top: 0, behavior: options.instant ? "auto" : "smooth" });
  requestAnimationFrame(revealVisibleContent);
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => activateTab(button.dataset.nav));
});

window.addEventListener("popstate", () => activateTab(currentTabFromUrl(), { fromHistory: true, instant: true }));

menu?.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  menu.setAttribute("aria-expanded", String(open));
});

document.querySelector("[data-top]")?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

function updateScrollState() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  meter.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
  header.classList.toggle("is-scrolled", window.scrollY > 16);
}

window.addEventListener("scroll", updateScrollState, { passive: true });
updateScrollState();

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("is-visible");
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach((node) => revealObserver.observe(node));

function revealVisibleContent() {
  document.querySelectorAll(".tab-panel.is-active .reveal").forEach((node) => revealObserver.observe(node));
}

const tilt = document.querySelector("[data-tilt]");
if (tilt && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  tilt.addEventListener("pointermove", (event) => {
    const rect = tilt.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    tilt.style.transform = `perspective(1000px) rotateY(${x * 3.5}deg) rotateX(${-y * 2.5}deg)`;
  });
  tilt.addEventListener("pointerleave", () => { tilt.style.transform = ""; });
}

function renderDownloads() {
  const list = document.querySelector("#download-list");
  if (!list) return;

  list.innerHTML = HUB.downloads.map((file, index) => {
    const download = file.download ? "download" : "";
    return `
      <a class="download-entry" href="${file.href}" ${download}>
        <span class="file-index">${String(index + 1).padStart(2, "0")}</span>
        <div><p class="section-index">${file.category}</p><h2>${file.name}</h2></div>
        <p>${file.description}</p>
        <span>↓</span>
      </a>`;
  }).join("");
}

renderDownloads();
activateTab(currentTabFromUrl(), { fromHistory: true, instant: true, keepScroll: true });
