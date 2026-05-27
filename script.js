const header = document.querySelector("[data-header]");
const meter = document.querySelector(".scroll-meter");

const onScroll = () => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
  meter.style.width = `${progress}%`;
  header.classList.toggle("is-scrolled", window.scrollY > 24);
};

window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

const revealObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    }
  },
  { threshold: 0.18 }
);

document.querySelectorAll(".reveal").forEach((node) => revealObserver.observe(node));

const tilt = document.querySelector("[data-tilt] .machine-glass");
const tiltShell = document.querySelector("[data-tilt]");

if (tilt && tiltShell && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  tiltShell.addEventListener("pointermove", (event) => {
    const rect = tiltShell.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    tilt.style.transform = `rotateY(${x * 7}deg) rotateX(${-y * 5}deg)`;
  });

  tiltShell.addEventListener("pointerleave", () => {
    tilt.style.transform = "rotateY(0deg) rotateX(0deg)";
  });
}

const explodedData = {
  frame: {
    title: "Frame and guide rails",
    text: "Alignment carries the process. The nozzle, plates, and mold must meet in the same place every cycle."
  },
  mold: {
    title: "Water-cooled resin mold",
    text: "The tool is fast to print, but the cooling channels make it useful for repeatable thermal behavior."
  },
  barrel: {
    title: "Heating and injection barrel",
    text: "A compact melt zone and piston shot keep volume, temperature, and hold time tied to the part geometry."
  },
  motion: {
    title: "Stepper-driven motion",
    text: "Movement is built around repeatable positions, service controls, and simple operator feedback."
  }
};

document.querySelectorAll("[data-exploded]").forEach((exploded) => {
  const buttons = exploded.querySelectorAll("[data-view]");
  const layers = exploded.querySelectorAll("[data-layer]");
  const caption = exploded.querySelector("[data-caption]");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const view = button.dataset.view;
      buttons.forEach((candidate) => {
        const active = candidate === button;
        candidate.classList.toggle("is-active", active);
        candidate.setAttribute("aria-selected", String(active));
      });

      layers.forEach((layer) => {
        layer.hidden = layer.dataset.layer !== view;
      });

      const data = explodedData[view];
      caption.innerHTML = `<strong>${data.title}</strong><span>${data.text}</span>`;
    });
  });
});

const cycleItems = [
  {
    kicker: "Mount mold",
    title: "Position the mold with repeatable alignment.",
    text: "The resin tool is fixed between support plates so the cavity, nozzle, and guide system stay coordinated."
  },
  {
    kicker: "Connect water",
    title: "Stabilize the tool before the shot.",
    text: "Inlet and outlet lines pull heat away from the active wall instead of letting the resin body accumulate it."
  },
  {
    kicker: "Heat polymer",
    title: "Bring the material into its flow window.",
    text: "The melt zone targets stable temperature, because viscosity swings show up directly in fill behavior."
  },
  {
    kicker: "Close and clamp",
    title: "Carry force through structure, not fragile resin.",
    text: "Guide rails and plates keep the mold closed while reducing flash and local stress in the printed tool."
  },
  {
    kicker: "Inject and hold",
    title: "Fill the cavity, then offset shrinkage.",
    text: "A piston-driven shot controls volume, while a short hold stage reduces voids and local contraction."
  },
  {
    kicker: "Cool and open",
    title: "Reach the ejection window and learn from the part.",
    text: "Water cooling and measured timing make each cycle comparable, so the next mold iteration is smarter."
  }
];

const cycle = document.querySelector("[data-cycle]");
if (cycle) {
  const title = document.querySelector("[data-cycle-title]");
  const kicker = document.querySelector("[data-cycle-kicker]");
  const text = document.querySelector("[data-cycle-text]");
  const meterBar = document.querySelector("[data-cycle-meter]");
  const buttons = cycle.querySelectorAll("[data-step]");
  let current = 0;
  let timer;

  const setCycle = (index) => {
    current = index;
    const item = cycleItems[index];
    kicker.textContent = item.kicker;
    title.textContent = item.title;
    text.textContent = item.text;
    meterBar.style.height = `${((index + 1) / cycleItems.length) * 100}%`;
    buttons.forEach((button, i) => button.classList.toggle("is-active", i === index));
  };

  const startTimer = () => {
    clearInterval(timer);
    timer = setInterval(() => setCycle((current + 1) % cycleItems.length), 3600);
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      setCycle(Number(button.dataset.step));
      startTimer();
    });
  });

  startTimer();
}
