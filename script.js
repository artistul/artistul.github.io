const HUB = {
  tabs: {
    home: { title: "InFlux Origin | Project Hub" },
    versions: { title: "Machine Versions | InFlux Origin" },
    projects: { title: "InFlux Ecosystem | InFlux Origin" },
    team: { title: "Team | InFlux Origin" },
    proof: { title: "Proof | InFlux Origin" },
    downloads: { title: "Download Hub | InFlux Origin" },
    links: { title: "External Links | InFlux Origin" }
  },
  downloads: [
    {
      name: "InFlux Operator APK",
      category: "Prototype operator artifact",
      description: "Supervised prototype operator build. Not a general-purpose machine controller.",
      meta: "Android APK / 19.79 MB / bundled June 2026",
      href: "assets/influx-operator-latest.apk",
      download: true
    },
    {
      name: "Technical Notebook",
      category: "Public documentation / PDF",
      description: "Ten-page public notebook covering the project, system, testing, and direction.",
      meta: "PDF / 645 KB / June 2026",
      href: "assets/influx-origin-technical-notebook.pdf",
      download: true
    },
    {
      name: "Extended Technical Dossier",
      category: "Public documentation / web",
      description: "Long-form documentation covering mechanics, control, validation, limits, and next steps.",
      meta: "Web dossier / current public edition",
      href: "technical.html",
      download: false
    },
    {
      name: "InFlux Origin Logo",
      category: "Public brand asset / SVG",
      description: "Scalable monochrome logo for project references and approved public coverage.",
      meta: "SVG / 8 KB",
      href: "assets/influx-origin-logo.svg",
      download: true
    }
  ]
};

const header = document.querySelector("[data-header]");
const meter = document.querySelector(".scroll-meter span");
const menu = document.querySelector("[data-menu]");
const nav = document.querySelector("#primary-nav");
const panels = [...document.querySelectorAll("[data-panel]")];
const navButtons = [...document.querySelectorAll("[data-nav]")];
const tabs = [...document.querySelectorAll('[role="tab"]')];
let modelViewerPromise;
let scrollFrame;

function currentTabFromUrl() {
  const candidate = new URLSearchParams(window.location.search).get("tab");
  return HUB.tabs[candidate] ? candidate : "home";
}

function registerMediaState(asset) {
  if (!(asset instanceof HTMLImageElement)) return;
  const settle = () => {
    asset.classList.remove("media-loading");
    asset.classList.add("media-loaded");
  };
  asset.classList.add("media-loading");
  asset.addEventListener("load", settle, { once: true });
  asset.addEventListener("error", settle, { once: true });
  if (asset.complete && asset.currentSrc) settle();
}

function hydratePanel(panel) {
  panel.querySelectorAll("[data-src]").forEach((asset) => {
    registerMediaState(asset);
    asset.src = asset.dataset.src;
    asset.removeAttribute("data-src");
  });
  panel.querySelectorAll("[data-srcset]").forEach((asset) => {
    asset.srcset = asset.dataset.srcset;
    asset.removeAttribute("data-srcset");
  });
}

document.querySelectorAll("img[loading='lazy'], img[data-src]").forEach(registerMediaState);

function closeMenu({ returnFocus = false } = {}) {
  nav?.classList.remove("is-open");
  menu?.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");
  if (returnFocus) menu?.focus();
}

function activateTab(tab, options = {}) {
  const target = HUB.tabs[tab] ? tab : "home";

  panels.forEach((panel) => {
    const active = panel.dataset.panel === target;
    panel.classList.toggle("is-active", active);
    panel.setAttribute("aria-hidden", String(!active));
    if (active) hydratePanel(panel);
  });

  navButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.nav === target));
  tabs.forEach((button) => {
    const active = button.dataset.nav === target;
    button.setAttribute("aria-selected", String(active));
    button.tabIndex = active ? 0 : -1;
  });

  document.title = HUB.tabs[target].title;
  closeMenu();

  if (!options.fromHistory) {
    const url = new URL(window.location.href);
    if (target === "home") url.searchParams.delete("tab");
    else url.searchParams.set("tab", target);
    window.history.pushState({ tab: target }, "", url);
  }

  if (!options.keepScroll) window.scrollTo({ top: 0, behavior: options.instant ? "auto" : "smooth" });
  requestAnimationFrame(revealVisibleContent);
}

navButtons.forEach((button) => button.addEventListener("click", () => activateTab(button.dataset.nav)));
document.querySelectorAll("[data-nav-link]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    activateTab(link.dataset.navLink);
  });
});

tabs.forEach((tab) => {
  tab.addEventListener("keydown", (event) => {
    const current = tabs.indexOf(tab);
    let next;
    if (event.key === "ArrowRight") next = (current + 1) % tabs.length;
    if (event.key === "ArrowLeft") next = (current - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = tabs.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    tabs[next].focus();
    activateTab(tabs[next].dataset.nav);
  });
});

window.addEventListener("popstate", () => activateTab(currentTabFromUrl(), { fromHistory: true, instant: true }));

menu?.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  menu.setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("menu-open", open);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && nav?.classList.contains("is-open")) closeMenu({ returnFocus: true });
});

document.querySelector("[data-top]")?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

function updateScrollState() {
  scrollFrame = undefined;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  meter.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
  header.classList.toggle("is-scrolled", window.scrollY > 16);
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

function loadModelViewerRuntime() {
  if (customElements.get("model-viewer")) return Promise.resolve();
  if (!modelViewerPromise) {
    modelViewerPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.type = "module";
      script.src = "assets/model-viewer.min.js";
      script.onload = resolve;
      script.onerror = reject;
      document.head.append(script);
    });
  }
  return modelViewerPromise;
}

document.querySelector("[data-load-model]")?.addEventListener("click", async (event) => {
  const shell = document.querySelector("[data-model-shell]");
  event.currentTarget.disabled = true;
  event.currentTarget.textContent = "Loading viewer";
  try {
    await loadModelViewerRuntime();
    shell.innerHTML = `
      <model-viewer src="assets/machine-assembly-optimized.glb" alt="Interactive 3D assembly of InFlux Origin MK1"
        camera-controls auto-rotate rotation-per-second="10deg" camera-orbit="38deg 64deg 3.3m"
        field-of-view="24deg" shadow-intensity="0.85" exposure="1.15"
        environment-image="neutral" interaction-prompt="none">
        <div class="model-loading" slot="poster">Loading optimized assembly</div>
      </model-viewer>`;
  } catch {
    event.currentTarget.disabled = false;
    event.currentTarget.textContent = "Retry interactive 3D";
  }
});

function renderDownloads() {
  const list = document.querySelector("#download-list");
  if (!list) return;
  list.innerHTML = HUB.downloads.map((file, index) => `
    <a class="download-entry" href="${file.href}" ${file.download ? "download" : ""}>
      <span class="file-index">${String(index + 1).padStart(2, "0")}</span>
      <div><p class="section-index">${file.category}</p><h2>${file.name}</h2><small>${file.meta}</small></div>
      <p>${file.description}</p>
      <span>↓</span>
    </a>`).join("");
}

renderDownloads();
activateTab(currentTabFromUrl(), { fromHistory: true, instant: true, keepScroll: true });
