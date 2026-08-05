const HUB = {
  tabs: {
    home: { title: "Desktop Injection Molding Machine | InFlux Origin" },
    versions: { title: "Machine Versions | InFlux Origin" },
    projects: { title: "InFlux Ecosystem | InFlux Origin" },
    team: { title: "Team | InFlux Origin" },
    sponsorship: { title: "Sponsors | InFlux Origin" },
    contact: { title: "Contact Us | InFlux Origin" },
    proof: { title: "Proof | InFlux Origin" },
    downloads: { title: "Download Hub | InFlux Origin" },
    links: { title: "External Links | InFlux Origin" }
  },
  downloads: [
    {
      name: "InFlux Operator APK",
      category: "Prototype operator artifact",
      description: "Latest version of the Influx Origin control app.",
      meta: "Android APK / 19.79 MB / June 2026",
      href: "assets/influx-operator-latest.apk",
      download: true
    },
    {
      name: "InFlux Operator Legacy",
      category: "ONCS operator artifact",
      description: "Auto Connect app build used for the ONCS presentation path.",
      meta: "Android APK / 19.79 MB / May 2026",
      href: "assets/influx-operator-auto-connect.apk",
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
      meta: "Web technical notebook",
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

const ROUTE_TABS = {
  "/sponsorship/": "sponsorship",
  "/sponsorship/index.html": "sponsorship",
  "/contact/": "contact",
  "/contact/index.html": "contact"
};

const header = document.querySelector("[data-header]");
const meter = document.querySelector(".scroll-meter span");
const menu = document.querySelector("[data-menu]");
const nav = document.querySelector("#primary-nav");
const menuLabel = menu?.querySelector("b");
const pageMain = document.querySelector("main");
const pageFooter = document.querySelector("footer");
const panels = [...document.querySelectorAll("[data-panel]")];
const navButtons = [...document.querySelectorAll("[data-nav]")];
const tabs = [...document.querySelectorAll('[role="tab"]')];
let modelViewerPromise;
let scrollFrame;
let activeMediaObserver;

function resolveSitePath(value) {
  if (!value || /^(?:[a-z][a-z0-9+.-]*:|#|\/)/i.test(value)) return value;
  if (window.location.protocol === "file:") return value;
  if (value.startsWith("assets/") || value === "technical.html") return `/${value}`;
  return value;
}

function resolveSrcset(value) {
  return value.split(",").map((candidate) => {
    const parts = candidate.trim().split(/\s+/);
    if (!parts[0]) return "";
    return [resolveSitePath(parts[0]), ...parts.slice(1)].join(" ");
  }).filter(Boolean).join(", ");
}

function currentTabFromUrl() {
  const candidate = new URLSearchParams(window.location.search).get("tab");
  if (HUB.tabs[candidate]) return candidate;
  const pathname = window.location.pathname;
  const directoryPath = pathname.endsWith("/") ? pathname : `${pathname}/`;
  return ROUTE_TABS[pathname] || ROUTE_TABS[directoryPath] || "home";
}

function urlForTab(tab) {
  const url = new URL(window.location.href);
  if (tab === "sponsorship" || tab === "contact") {
    url.pathname = `/${tab === "sponsorship" ? "sponsorship" : "contact"}/`;
    url.search = "";
    url.hash = "";
    return url;
  }
  url.pathname = "/";
  url.hash = "";
  if (tab === "home") url.search = "";
  else url.search = `?tab=${encodeURIComponent(tab)}`;
  return url;
}

function registerMediaState(asset) {
  if (!(asset instanceof HTMLImageElement)) return;
  if (asset.dataset.mediaStateRegistered === "true") return;
  asset.dataset.mediaStateRegistered = "true";
  const usePlaceholder = asset.getAttribute("fetchpriority") !== "high";
  const settle = () => {
    asset.classList.remove("media-loading");
    if (usePlaceholder) asset.classList.add("media-loaded");
  };
  if (usePlaceholder) asset.classList.add("media-loading");
  asset.addEventListener("load", settle, { once: true });
  asset.addEventListener("error", settle, { once: true });
  if (asset.complete && asset.currentSrc) settle();
}

function loadMediaAsset(asset, { eager = false } = {}) {
  if (!(asset instanceof HTMLImageElement)) return;
  registerMediaState(asset);

  if (eager && asset.loading === "lazy") asset.loading = "eager";

  if (asset.dataset.srcset) {
    asset.srcset = resolveSrcset(asset.dataset.srcset);
    asset.removeAttribute("data-srcset");
  }

  if (asset.dataset.src) {
    asset.src = resolveSitePath(asset.dataset.src);
    asset.removeAttribute("data-src");
    return;
  }

  if (eager && asset.getAttribute("src") && !asset.currentSrc) {
    const source = asset.getAttribute("src");
    asset.removeAttribute("src");
    asset.src = source;
  }
}

function getActiveMediaObserver() {
  if (!("IntersectionObserver" in window)) return null;
  if (!activeMediaObserver) {
    activeMediaObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        loadMediaAsset(entry.target, { eager: true });
        activeMediaObserver.unobserve(entry.target);
      });
    }, { rootMargin: "900px 0px" });
  }
  return activeMediaObserver;
}

function shouldLoadMediaNow(asset, index) {
  if (index < 2) return true;
  const rect = asset.getBoundingClientRect();
  return rect.top < window.innerHeight + 360 && rect.bottom > -160;
}

function hydratePanel(panel) {
  const observer = getActiveMediaObserver();
  panel.querySelectorAll("img").forEach((asset, index) => {
    if (!asset.dataset.src && !asset.dataset.srcset && asset.currentSrc) return;
    registerMediaState(asset);
    if (asset.hasAttribute("data-priority-media") || shouldLoadMediaNow(asset, index) || !observer) {
      loadMediaAsset(asset, { eager: true });
      return;
    }
    if (asset.dataset.srcset) {
      observer.observe(asset);
      return;
    }
    if (asset.dataset.src) {
      observer.observe(asset);
      return;
    }
    if (asset.getAttribute("src") && !asset.currentSrc) {
      observer.observe(asset);
    }
  });
}

document.querySelectorAll("img[loading='lazy'], img[data-src]").forEach(registerMediaState);

function setMenuState(open, { focusFirst = false, returnFocus = false } = {}) {
  nav?.classList.toggle("is-open", open);
  menu?.setAttribute("aria-expanded", String(open));
  menu?.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
  if (menuLabel) menuLabel.textContent = open ? "Close" : "Menu";
  document.body.classList.toggle("menu-open", open);
  pageMain?.toggleAttribute("inert", open);
  pageFooter?.toggleAttribute("inert", open);
  tabs.forEach((tab) => {
    tab.tabIndex = open || tab.getAttribute("aria-selected") === "true" ? 0 : -1;
  });

  if (focusFirst && open) {
    requestAnimationFrame(() => nav?.querySelector("button")?.focus());
  }
  if (returnFocus) menu?.focus();
}

function closeMenu(options = {}) {
  setMenuState(false, options);
}

setMenuState(false);

function activateTab(tab, options = {}) {
  const target = HUB.tabs[tab] ? tab : "home";
  const menuWasOpen = nav?.classList.contains("is-open");

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
    window.history.pushState({ tab: target }, "", urlForTab(target));
  }

  if (!options.keepScroll) window.scrollTo({ top: 0, behavior: options.instant ? "auto" : "smooth" });
  requestAnimationFrame(() => {
    revealVisibleContent();
    if (menuWasOpen) panels.find((panel) => panel.dataset.panel === target)?.focus({ preventScroll: true });
  });
}

navButtons.forEach((button) => button.addEventListener("click", () => activateTab(button.dataset.nav)));
document.querySelectorAll("[data-nav-link]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    activateTab(link.dataset.navLink);
  });
});

const projectIndexLinks = [...document.querySelectorAll(".project-index a")];

function scrollToProjectIndexTarget(link, { updateHistory = true, behavior } = {}) {
  const destination = new URL(link.href, window.location.href);
  const targetId = decodeURIComponent(destination.hash.slice(1));
  const target = targetId ? document.getElementById(targetId) : null;
  if (!target) return false;

  if (updateHistory) {
    window.history.pushState(
      { tab: "projects", project: targetId },
      "",
      `${destination.pathname}${destination.search}${destination.hash}`
    );
  }
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({
    block: "start",
    behavior: behavior || (reducedMotion ? "auto" : "smooth")
  });
  return true;
}

projectIndexLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    scrollToProjectIndexTarget(link);
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
    if (!nav?.classList.contains("is-open")) activateTab(tabs[next].dataset.nav);
  });
});

window.addEventListener("popstate", () => {
  activateTab(currentTabFromUrl(), {
    fromHistory: true,
    instant: true,
    keepScroll: Boolean(window.location.hash)
  });
  if (window.location.hash) {
    requestAnimationFrame(() => {
      const link = projectIndexLinks.find((candidate) =>
        new URL(candidate.href, window.location.href).hash === window.location.hash
      );
      if (link) scrollToProjectIndexTarget(link, { updateHistory: false, behavior: "auto" });
    });
  }
});

menu?.addEventListener("click", () => {
  const open = !nav.classList.contains("is-open");
  setMenuState(open, { focusFirst: open });
});

document.addEventListener("keydown", (event) => {
  if (!nav?.classList.contains("is-open")) return;
  if (event.key === "Escape") {
    closeMenu({ returnFocus: true });
    return;
  }
  if (event.key !== "Tab") return;

  const focusable = [menu, ...nav.querySelectorAll("button")].filter((item) => item && !item.disabled);
  const first = focusable[0];
  const last = focusable.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 900 && nav?.classList.contains("is-open")) closeMenu();
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
      script.src = resolveSitePath("assets/model-viewer.min.js");
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
      <model-viewer src="${resolveSitePath("assets/machine-assembly-optimized.glb")}" alt="Interactive 3D assembly of InFlux Origin MK1"
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
    <a class="download-entry" href="${resolveSitePath(file.href)}" ${file.download ? "download" : ""}>
      <span class="file-index">${String(index + 1).padStart(2, "0")}</span>
      <div><h2>${file.name}</h2><small>${file.meta}</small></div>
      <p>${file.description}</p>
      <span>↓</span>
    </a>`).join("");
}

document.querySelectorAll('a[href^="assets/"], a[href="technical.html"]').forEach((link) => {
  link.setAttribute("href", resolveSitePath(link.getAttribute("href")));
});

renderDownloads();
activateTab(currentTabFromUrl(), { fromHistory: true, instant: true, keepScroll: true });
if (window.location.hash) {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const link = projectIndexLinks.find((candidate) =>
      new URL(candidate.href, window.location.href).hash === window.location.hash
    );
    if (link) scrollToProjectIndexTarget(link, { updateHistory: false, behavior: "auto" });
  }));
}

function initFluidProgressMeters() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll(".proof-progress[data-current][data-final]").forEach((card, cardIndex) => {
    if (card.dataset.fluidInitialized === "true") return;
    card.dataset.fluidInitialized = "true";

    const currentTarget = Math.max(0, Number(card.dataset.current) || 0);
    const finalTarget = Math.max(0, Number(card.dataset.final) || 0);
    const startTarget = Math.max(0, Number(card.dataset.start) || 0);
    const isFlipped = card.hasAttribute("data-flipped");
    const target = isFlipped
      ? startTarget > finalTarget
        ? Math.min(100, Math.max(0, ((startTarget - currentTarget) / (startTarget - finalTarget)) * 100))
        : 0
      : finalTarget > 0
        ? Math.min(100, (currentTarget / finalTarget) * 100)
        : 0;
    const unit = card.dataset.unit?.trim() || "";
    const value = card.querySelector(".proof-value");
    const indicatorValue = card.querySelector(".fluid-indicator b");
    const goalValue = card.querySelector(".fluid-goal");
    const meter = card.querySelector("[data-fluid-meter]");
    const accessible = card.querySelector(".fluid-progress-accessible");
    const gradient = card.querySelector("[data-fluid-gradient]");
    const main = card.querySelector("[data-fluid-main]");
    const head = card.querySelector("[data-fluid-head]");
    const lobeA = card.querySelector("[data-fluid-lobe-a]");
    const lobeB = card.querySelector("[data-fluid-lobe-b]");
    const drops = [
      card.querySelector("[data-fluid-drop-a]"),
      card.querySelector("[data-fluid-drop-b]"),
      card.querySelector("[data-fluid-drop-c]")
    ];

    if (!value || !indicatorValue || !goalValue || !meter || !accessible || !gradient || !main || !head || !lobeA || !lobeB || drops.some((drop) => !drop)) return;

    const formatNumber = (number, maximumFractionDigits = 1) =>
      new Intl.NumberFormat("en-US", { maximumFractionDigits }).format(number);
    const formatMeasurement = (number) => {
      const displayedUnit = number === 1 && unit.endsWith("s") ? unit.slice(0, -1) : unit;
      if (unit === "%") return `${formatNumber(number)}%`;
      if (/^[€$£¥]$/.test(unit)) return `${unit}${formatNumber(number)}`;
      return `${formatNumber(number)}${displayedUnit ? ` ${displayedUnit}` : ""}`;
    };
    const formatPercentage = (number) => `${formatNumber(number, 1)}%`;

    value.textContent = formatPercentage(target);
    indicatorValue.textContent = formatNumber(currentTarget);
    goalValue.textContent = formatMeasurement(finalTarget);
    accessible.setAttribute("aria-valuemax", "100");
    accessible.setAttribute("aria-valuenow", String(target));
    accessible.setAttribute("aria-valuetext", isFlipped
      ? `${formatMeasurement(currentTarget)} reduced from ${formatMeasurement(startTarget)} toward ${formatMeasurement(finalTarget)} (${formatPercentage(target)})`
      : `${formatMeasurement(currentTarget)} of ${formatMeasurement(finalTarget)} (${formatPercentage(target)})`);

    const milestones = (card.dataset.milestones || "")
      .split(",")
      .map((milestone) => Number(milestone.trim()))
      .filter((milestone) => Number.isFinite(milestone) && (
        isFlipped
          ? milestone > finalTarget && milestone < startTarget
          : milestone > 0 && milestone < finalTarget
      ))
      .sort((a, b) => isFlipped ? b - a : a - b);
    const milestoneLayer = document.createElement("div");
    milestoneLayer.className = "fluid-milestones";
    milestoneLayer.setAttribute("aria-label", "Milestones");
    milestones.forEach((milestone) => {
      const marker = document.createElement("span");
      marker.className = "fluid-milestone";
      const milestonePosition = isFlipped
        ? ((startTarget - milestone) / (startTarget - finalTarget)) * 100
        : (milestone / finalTarget) * 100;
      const isPassed = isFlipped ? currentTarget <= milestone : currentTarget >= milestone;
      marker.style.setProperty("--milestone-position", `${milestonePosition}%`);
      marker.classList.toggle("is-passed", isPassed);
      marker.title = `${formatMeasurement(milestone)} milestone${isPassed ? " passed" : ""}`;
      marker.innerHTML = `<i aria-hidden="true"></i><b>${formatMeasurement(milestone)}</b>`;
      milestoneLayer.append(marker);
    });
    meter.append(milestoneLayer);

    const markerPercent = Math.min(94, Math.max(6, target));
    card.style.setProperty("--fluid-progress", `${markerPercent}%`);
    card.style.setProperty("--fluid-live-progress", "0%");

    const trackStart = 2;
    const trackWidth = 996;
    const targetX = trackStart + trackWidth * (target / 100);
    const randomBetween = (min, max) => min + Math.random() * (max - min);
    const physics = {
      startDelay: Math.round(randomBetween(90, 780) + cardIndex * 70),
      stiffness: randomBetween(24, 38),
      damping: randomBetween(8.5, 11.5),
      pulse: randomBetween(1.1, 2.8),
      pulseRate: randomBetween(7, 13)
    };

    card.dataset.fluidPhysics = JSON.stringify(physics);
    card.style.setProperty("--fluid-lobe-a-duration", `${randomBetween(2.3, 4.1).toFixed(2)}s`);
    card.style.setProperty("--fluid-lobe-b-duration", `${randomBetween(2.5, 4.4).toFixed(2)}s`);
    card.style.setProperty("--fluid-lobe-a-delay", `${-randomBetween(.1, 2.4).toFixed(2)}s`);
    card.style.setProperty("--fluid-lobe-b-delay", `${-randomBetween(.2, 2.8).toFixed(2)}s`);
    card.style.setProperty("--fluid-drop-duration", `${randomBetween(2.7, 4.8).toFixed(2)}s`);
    card.style.setProperty("--fluid-drop-a-delay", `${randomBetween(.1, 1.4).toFixed(2)}s`);
    card.style.setProperty("--fluid-drop-b-delay", `${randomBetween(.7, 2.1).toFixed(2)}s`);
    card.style.setProperty("--fluid-drop-c-delay", `${randomBetween(1.2, 2.9).toFixed(2)}s`);

    function setFluidPosition(x) {
      const safeX = Math.min(998, Math.max(trackStart, x));

      // One user-space gradient is shared by the bar, head, lobes, and droplets.
      // Its bright endpoint follows the liquid front, so overlapping shapes sample
      // exactly the same red and visually merge into one continuous fluid body.
      gradient.setAttribute("x1", String(trackStart));
      gradient.setAttribute("x2", String(Math.max(trackStart + 1, safeX)));

      main.setAttribute("width", String(Math.max(0, safeX + 26)));
      head.setAttribute("cx", String(safeX));
      lobeA.setAttribute("cx", String(Math.min(996, safeX + 7)));
      lobeB.setAttribute("cx", String(Math.min(996, safeX + 14)));

      const dropPositions = [
        [Math.min(984, safeX + 10), 23],
        [Math.min(990, safeX + 27), 16],
        [Math.min(988, safeX + 38), 27]
      ];

      drops.forEach((drop, index) => {
        drop.setAttribute("cx", String(dropPositions[index][0]));
        drop.setAttribute("cy", String(dropPositions[index][1]));
      });
      card.style.setProperty("--fluid-live-progress", `${Math.min(94, Math.max(0, ((safeX - trackStart) / trackWidth) * 100))}%`);
    }

    function finishFluid() {
      setFluidPosition(targetX);
      value.textContent = formatPercentage(target);
      indicatorValue.textContent = formatNumber(currentTarget);
      card.classList.add("is-fluid-ready");
    }

    function animateFluid() {
      if (card.dataset.fluidAnimated === "true") return;
      card.dataset.fluidAnimated = "true";
      card.classList.add("is-fluid-active");

      if (reduceMotion) {
        finishFluid();
        return;
      }

      value.textContent = "0%";
      indicatorValue.textContent = "0";
      setFluidPosition(trackStart);

      let position = trackStart;
      let velocity = 0;
      let previousTime;
      let elapsed = 0;

      function frame(now) {
        if (!previousTime) previousTime = now;
        const delta = Math.min((now - previousTime) / 1000, .034);
        previousTime = now;
        elapsed += delta;

        const distance = targetX - position;
        const pressurePulse = Math.sin(elapsed * physics.pulseRate) * physics.pulse * Math.min(1, Math.abs(distance) / 140);
        const acceleration = distance * physics.stiffness - velocity * physics.damping + pressurePulse;
        velocity += acceleration * delta;
        position += velocity * delta;

        setFluidPosition(position);
        const currentValue = Math.round(target * Math.min(1, Math.max(0, (position - trackStart) / (targetX - trackStart))) * 10) / 10;
        value.textContent = formatPercentage(currentValue);
        indicatorValue.textContent = formatNumber(currentTarget * Math.min(1, target > 0 ? currentValue / target : 0));

        if (elapsed < 4.8 && (Math.abs(distance) > .45 || Math.abs(velocity) > .45)) {
          requestAnimationFrame(frame);
        } else {
          finishFluid();
        }
      }

      window.setTimeout(() => requestAnimationFrame(frame), physics.startDelay);
    }

    if (!("IntersectionObserver" in window)) {
      animateFluid();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        animateFluid();
        observer.disconnect();
      },
      { threshold: 0.28 }
    );

    observer.observe(card);
  });
}

initFluidProgressMeters();
