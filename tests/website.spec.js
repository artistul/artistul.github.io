const { test, expect } = require("@playwright/test");

const viewports = [
  { name: "small-mobile", width: 320, height: 568 },
  { name: "mobile", width: 390, height: 844 },
  { name: "xiaomi-13t-pro", width: 407, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 }
];

test("English and Romanian toggle sitewide with persistent accessible state", async ({ page }) => {
  await page.goto("/index.html");
  await page.evaluate(() => localStorage.removeItem("influx-language"));
  await page.reload();

  const languageControl = page.getByRole("group", { name: "Language / Limbă" });
  await expect(languageControl).toBeVisible();
  await expect(page.locator('[data-language="en"]')).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator('[data-language="ro"]')).toHaveAttribute("aria-pressed", "false");

  await page.locator('[data-language="ro"]').click();
  await expect(page.locator("html")).toHaveClass(/is-language-melting/);
  await expect(page.locator(
    ".language-melt-canvas:not(.language-melt-canvas--header):not(.language-melt-canvas--project-index)"
  )).toHaveClass(/is-active/);
  await expect(page.locator("#home-title .language-melt-text")).toHaveCount(3);
  await expect(page.locator("html")).toHaveAttribute("lang", "ro");
  await expect(page.locator('[data-language="ro"]')).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("tab", { name: "Echipă" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Contactează-ne" })).toBeVisible();
  const romanianDisplaySpacing = await page.locator(".home-statement h2").evaluate((heading) => {
    const style = getComputedStyle(heading);
    return Number.parseFloat(style.lineHeight) / Number.parseFloat(style.fontSize);
  });
  expect(romanianDisplaySpacing).toBeGreaterThanOrEqual(1.15);

  await page.getByRole("tab", { name: "Echipă" }).click();
  await expect(page).toHaveTitle("Echipă | InFlux Origin");
  await expect(page.getByText("Patru discipline.")).toBeVisible();

  await page.goto("/contact/");
  await expect(page.locator("html")).toHaveAttribute("lang", "ro");
  await expect(page).toHaveTitle("Contactează-ne | InFlux Origin");
  await expect(page.getByRole("heading", { name: "Contactează-ne" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ajută-ne să construim ce urmează." })).toBeVisible();
  await expect(page.getByRole("link", { name: /Aplică pentru a te alătura echipei InFlux/ })).toBeVisible();
  const romanianHeadingType = await page.locator(".contact-option h2").first().evaluate((heading) => {
    const style = getComputedStyle(heading);
    return {
      family: style.fontFamily,
      lineHeightRatio: Number.parseFloat(style.lineHeight) / Number.parseFloat(style.fontSize)
    };
  });
  expect(romanianHeadingType.family).toContain("Impact");
  expect(romanianHeadingType.lineHeightRatio).toBeGreaterThanOrEqual(1.15);

  await page.goto("/technical.html");
  await expect(page.locator("html")).toHaveAttribute("lang", "ro");
  await expect(page).toHaveTitle("Dosar tehnic | InFlux Origin MK1");
  await expect(page.getByText("Dosar tehnic public", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "InFlux Origin MK1" })).toBeVisible();

  await page.locator('[data-language="en"]').click();
  await expect(page.locator(".header-action")).toHaveClass(/language-melt-contact/);
  await expect(page.locator(".header-action")).toHaveCSS(
    "background-color",
    "rgba(0, 0, 0, 0)"
  );
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.goto("/index.html");
  await expect(page.getByRole("tab", { name: "Team" })).toBeVisible();
  await expect(page.locator('[data-language="en"]')).toHaveAttribute("aria-pressed", "true");
});

test("language control remains touch-friendly and clear of mobile navigation", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/index.html");
  await page.locator('[data-language="ro"]').click();

  const layout = await page.evaluate(() => {
    const english = document.querySelector('[data-language="en"]').getBoundingClientRect();
    const romanian = document.querySelector('[data-language="ro"]').getBoundingClientRect();
    const menu = document.querySelector("[data-menu]").getBoundingClientRect();
    const overlaps = (a, b) =>
      a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
    return {
      englishTarget: { width: english.width, height: english.height },
      romanianTarget: { width: romanian.width, height: romanian.height },
      clearOfMenu: !overlaps(english, menu) && !overlaps(romanian, menu),
      documentFitsWidth: document.documentElement.scrollWidth === document.documentElement.clientWidth
    };
  });

  expect(layout.englishTarget.height).toBeGreaterThanOrEqual(44);
  expect(layout.romanianTarget.height).toBeGreaterThanOrEqual(44);
  expect(layout.englishTarget.width).toBeGreaterThanOrEqual(38);
  expect(layout.romanianTarget.width).toBeGreaterThanOrEqual(38);
  expect(layout.clearOfMenu).toBe(true);
  expect(layout.documentFitsWidth).toBe(true);
});

test("melt transition affects text without hiding structural elements", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/index.html");
  await page.evaluate(() => localStorage.removeItem("influx-language"));
  await page.reload();

  const inspectStructure = () => page.evaluate(() => {
    const inspect = (selector) => {
      const element = document.querySelector(selector);
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return {
        width: Math.round(rect.width * 10) / 10,
        height: Math.round(rect.height * 10) / 10,
        display: style.display,
        visibility: style.visibility,
        opacity: style.opacity,
        backgroundColor: style.backgroundColor,
        borderColor: style.borderColor,
        clipPath: style.clipPath
      };
    };
    return {
      logo: inspect(".brand img"),
      artifact: inspect(".hero-artifact"),
      machine: inspect('.hero-artifact img[alt*="CAD render"]'),
      contact: inspect("#tab-contact"),
      action: inspect(".action-primary"),
      activeUnderlineOpacity: getComputedStyle(
        document.querySelector(".primary-nav button.is-active:not(#tab-contact)"),
        "::after"
      ).opacity
    };
  });

  const before = await inspectStructure();
  await page.locator('[data-language="ro"]').click();
  await expect(page.locator("html")).toHaveClass(/is-language-melting/);
  await page.waitForTimeout(360);
  const during = await inspectStructure();
  const meltLayerOrder = await page.evaluate(() => ({
    content: Number.parseInt(getComputedStyle(
      document.querySelector(".language-melt-canvas:not(.language-melt-canvas--header):not(.language-melt-canvas--project-index)")
    ).zIndex, 10),
    header: Number.parseInt(getComputedStyle(document.querySelector(".site-header")).zIndex, 10),
    headerMelt: Number.parseInt(getComputedStyle(
      document.querySelector(".language-melt-canvas--header")
    ).zIndex, 10)
  }));

  expect(meltLayerOrder.content).toBeLessThan(meltLayerOrder.header);
  expect(meltLayerOrder.headerMelt).toBeGreaterThan(meltLayerOrder.header);
  expect(during.logo).toEqual(before.logo);
  expect(during.artifact).toEqual(before.artifact);
  expect(during.machine).toEqual(before.machine);
  expect(during.action).toEqual(before.action);
  expect(during.contact.width).toBe(before.contact.width);
  expect(during.contact.height).toBe(before.contact.height);
  expect(during.contact.display).toBe(before.contact.display);
  expect(during.contact.visibility).toBe(before.contact.visibility);
  expect(during.contact.backgroundColor).toBe("rgba(0, 0, 0, 0)");
  expect(during.activeUnderlineOpacity).toBe("0");
  await expect(page.locator("#tab-contact.language-melt-contact")).toHaveCount(1);
  await expect(page.locator(".primary-nav button.language-melt-underline")).toHaveCount(1);
  await expect(page.locator(".language-melt-text:not(.language-melt-run)")).toHaveCount(0);
  await expect(page.locator(".language-melt-source:not(.language-melt-run)")).toHaveCount(0);
  await expect(page.locator("html")).toHaveAttribute("lang", "ro");
  await expect(page.locator(".language-melt-run.language-melt-text")).toHaveCount(0);
  await expect(page.locator(".language-melt-run[style*='clip-path']")).toHaveCount(0);
  await expect(page.locator(".language-melt-run[style*='visibility']")).toHaveCount(0);
  await expect(page.locator(".language-melt-contact, .language-melt-underline")).toHaveCount(0);
  await expect(page.locator("html")).toHaveClass(/is-language-popping/);
  await expect(page.locator(".language-pop-host").first()).not.toHaveCSS("transform", "none");
  const runCount = await page.locator(".language-melt-run").count();
  await expect(page.locator(".language-melt-run .language-melt-run")).toHaveCount(0);

  await page.locator('[data-language="en"]').click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("html")).not.toHaveClass(/is-language-popping/);
  await expect(page.locator(".language-melt-run")).toHaveCount(runCount);
  await expect(page.locator(".language-melt-run .language-melt-run")).toHaveCount(0);
  expect(await inspectStructure()).toEqual(before);
});

test("ecosystem index stays protected, translated, and linked during the melt", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/index.html?tab=projects");

  const index = page.locator(".project-index");
  const links = index.locator("a");
  expect(await links.evaluateAll((anchors) =>
    anchors.map((anchor) => anchor.getAttribute("href"))
  )).toEqual([
    "/?tab=projects#project-operator",
    "/?tab=projects#project-motherboard",
    "/?tab=projects#project-thermal"
  ]);

  await page.locator('[data-language="ro"]').click();
  await expect(page.locator("html")).toHaveClass(/is-language-melting/);
  await page.waitForTimeout(360);
  await expect(index.locator(".language-melt-text")).toHaveCount(9);
  await expect(index.locator(".language-pop-host")).toHaveCount(0);
  await expect(links.locator("strong")).toHaveText([
    "Operator",
    "Motherboard",
    "Thermal Lab"
  ]);

  const layerOrder = await page.evaluate(() => ({
    melt: Number.parseInt(getComputedStyle(
      document.querySelector(".language-melt-canvas:not(.language-melt-canvas--header):not(.language-melt-canvas--project-index)")
    ).zIndex, 10),
    index: Number.parseInt(getComputedStyle(document.querySelector(".project-index")).zIndex, 10),
    indexMelt: Number.parseInt(getComputedStyle(
      document.querySelector(".language-melt-canvas--project-index")
    ).zIndex, 10)
  }));
  expect(layerOrder.melt).toBeLessThan(layerOrder.index);
  expect(layerOrder.indexMelt).toBeGreaterThan(layerOrder.index);
  await expect(page.locator(".language-melt-canvas--project-index")).toHaveClass(/is-active/);
  await expect(page.locator(".language-melt-canvas--project-index")).toHaveCSS("clip-path", "none");
  await expect(page.locator(".language-melt-canvas--header")).toHaveCSS("clip-path", "none");
  const meltTypographyDifferences = await index.locator(".language-melt-run").evaluateAll((runs) =>
    runs.flatMap((run) => {
      const runStyle = getComputedStyle(run);
      const parentStyle = getComputedStyle(run.parentElement);
      const matches = runStyle.fontFamily === parentStyle.fontFamily &&
        runStyle.fontSize === parentStyle.fontSize &&
        runStyle.fontWeight === parentStyle.fontWeight;
      return matches ? [] : [{
        text: run.textContent,
        run: {
          fontFamily: runStyle.fontFamily,
          fontSize: runStyle.fontSize,
          fontWeight: runStyle.fontWeight
        },
        parent: {
          fontFamily: parentStyle.fontFamily,
          fontSize: parentStyle.fontSize,
          fontWeight: parentStyle.fontWeight
        }
      }];
    })
  );
  expect(meltTypographyDifferences).toEqual([]);

  await expect(page.locator("html")).toHaveAttribute("lang", "ro");
  await expect(index.locator(".language-melt-run")).toHaveCount(0);
  await expect(index.locator(".language-pop-text, .language-pop-host")).toHaveCount(0);
  await expect(links.locator("strong")).toHaveText([
    "Operator",
    "Placă de bază",
    "Laborator termic"
  ]);
  await expect(links.locator("small")).toHaveText([
    "Interfață de control",
    "Electronică de control",
    "Rezultate de validare"
  ]);
  await expect(links.locator("strong").first()).toHaveCSS("text-transform", "uppercase");
  await expect(links.locator("small").first()).toHaveCSS("text-transform", "uppercase");
  await expect(links.locator("strong").first()).toHaveCSS("transform", "none");
  await expect(links.locator("strong").first()).toHaveCSS("opacity", "1");
  await expect(links.locator("strong").first()).toHaveCSS("filter", "none");

  await links.nth(1).click();
  await expect(page).toHaveURL(/\\?tab=projects#project-motherboard$/);
  await expect.poll(() => page.evaluate(() => {
    const target = document.querySelector("#project-motherboard").getBoundingClientRect();
    const header = document.querySelector(".site-header").getBoundingClientRect();
    return target.top >= header.bottom && target.top < header.bottom + 180;
  })).toBe(true);
});

test("wrapped Romanian headline and changing header accents remain in the melt canvas", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/index.html");
  await page.evaluate(() => window.InFluxI18n.setLanguage("ro"));
  await page.evaluate(() => new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(resolve))
  ));

  const targets = await page.evaluate(() => {
    const headlineRun = [...document.querySelectorAll("#home-title span")]
      .find((element) => /format/i.test(element.textContent));
    const node = [...headlineRun.childNodes]
      .find((candidate) => candidate.nodeType === Node.TEXT_NODE);
    const start = node.nodeValue.toLocaleLowerCase().indexOf("format");
    const range = document.createRange();
    range.setStart(node, start);
    range.setEnd(node, start + "format".length);
    const format = range.getBoundingClientRect();
    const contact = document.querySelector("#tab-contact").getBoundingClientRect();
    const active = document.querySelector(
      ".primary-nav button.is-active:not(#tab-contact)"
    );
    const activeRect = active.getBoundingClientRect();
    const underlineStyle = getComputedStyle(active, "::after");
    const underlineLeft = Number.parseFloat(underlineStyle.left) || 0;
    const underlineRight = Number.parseFloat(underlineStyle.right) || 0;
    const underlineBottom = Number.parseFloat(underlineStyle.bottom) || 0;
    const underlineHeight = Number.parseFloat(underlineStyle.height) || 0;
    return {
      format: {
        left: format.left,
        top: format.top,
        width: format.width,
        height: format.height
      },
      contact: {
        x: contact.left + 4,
        y: contact.top + 4
      },
      underline: {
        x: activeRect.left + underlineLeft +
          (activeRect.width - underlineLeft - underlineRight) / 2,
        y: activeRect.bottom - underlineBottom - underlineHeight / 2
      }
    };
  });

  await page.locator('[data-language="en"]').click();
  await page.waitForTimeout(60);

  const canvasState = await page.evaluate((rects) => {
    const canvas = document.querySelector(".language-melt-canvas");
    const context = canvas.getContext("2d");
    const headerCanvas = document.querySelector(".language-melt-canvas--header");
    const headerContext = headerCanvas.getContext("2d");
    const scaleX = canvas.width / innerWidth;
    const scaleY = canvas.height / innerHeight;
    const pixel = (sourceContext, x, y) => {
      const data = sourceContext.getImageData(
        Math.max(0, Math.floor(x * scaleX)),
        Math.max(0, Math.floor(y * scaleY)),
        1,
        1
      ).data;
      return [...data];
    };
    const padding = 8;
    const x = Math.max(0, Math.floor((rects.format.left - padding) * scaleX));
    const y = Math.max(0, Math.floor((rects.format.top - padding) * scaleY));
    const width = Math.min(
      canvas.width - x,
      Math.ceil((rects.format.width + padding * 2) * scaleX)
    );
    const height = Math.min(
      canvas.height - y,
      Math.ceil((rects.format.height + padding * 3) * scaleY)
    );
    const formatData = context.getImageData(x, y, width, height).data;
    let formatAlphaPixels = 0;
    for (let index = 3; index < formatData.length; index += 4) {
      if (formatData[index] > 20) formatAlphaPixels += 1;
    }
    return {
      formatAlphaPixels,
      contactPixel: pixel(headerContext, rects.contact.x, rects.contact.y),
      underlinePixel: pixel(headerContext, rects.underline.x, rects.underline.y)
    };
  }, targets);

  expect(canvasState.formatAlphaPixels).toBeGreaterThan(100);
  expect(canvasState.contactPixel[0]).toBeGreaterThan(180);
  expect(canvasState.contactPixel[3]).toBeGreaterThan(200);
  expect(canvasState.underlinePixel[0]).toBeGreaterThan(180);
  expect(canvasState.underlinePixel[3]).toBeGreaterThan(200);
});

test("hidden beta preview selects either saved transition from the URL", async ({ page, request }) => {
  await page.goto("/index.html");
  await expect(page.locator('a[href*="beta-language-transition"]')).toHaveCount(0);
  const sitemap = await request.get("/sitemap.xml");
  expect(await sitemap.text()).not.toContain("beta-language-transition");

  await page.goto("/beta-language-transition/?animation=particle-wipe");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  const particleFrame = page.frameLocator("iframe");
  await expect(particleFrame.locator("html")).toHaveAttribute("lang", /en|ro/);
  await particleFrame.locator('[data-language="en"]').click();
  await particleFrame.locator('[data-language="ro"]').click();
  await expect(particleFrame.locator(
    ".language-melt-canvas:not(.language-melt-canvas--header):not(.language-melt-canvas--project-index)"
  )).toHaveClass(/is-active/);
  await expect(particleFrame.locator(".language-melt-source").first()).toBeVisible();
  await expect(particleFrame.locator("#home-title .language-melt-source")).toHaveCount(3);

  await page.goto("/beta-language-transition/?animation=continuous-melt");
  const continuousFrame = page.frameLocator("iframe");
  await expect(continuousFrame.locator("html")).toHaveAttribute("lang", /en|ro/);
  await continuousFrame.locator('[data-language="en"]').click();
  await continuousFrame.locator('[data-language="ro"]').click();
  await expect(continuousFrame.locator("html")).toHaveClass(/is-language-melting/);
  await expect(continuousFrame.locator(".language-melt-text").first()).toBeVisible();
  await expect(continuousFrame.locator("#home-title .language-melt-text")).toHaveCount(3);
  await expect(continuousFrame.locator(
    ".language-melt-canvas:not(.language-melt-canvas--header):not(.language-melt-canvas--project-index)"
  )).toHaveClass(/is-active/);
  await expect(continuousFrame.locator(
    ".language-melt-canvas--header"
  )).toHaveClass(/is-active/);
  await page.waitForTimeout(120);
  const waveState = await continuousFrame.locator("body").evaluate(() => {
    const eligible = [...document.body.querySelectorAll("*")].filter((element) => {
      if (element.closest("[data-no-i18n], script, style, svg, canvas, code, pre")) return false;
      if (element.classList.contains("visually-hidden")) return false;
      if (![...element.childNodes].some((node) =>
        node.nodeType === Node.TEXT_NODE && String(node.nodeValue || "").trim()
      )) return false;
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return rect.width > 2 && rect.height > 2 &&
        rect.bottom > 0 && rect.top < window.innerHeight &&
        rect.right > 0 && rect.left < window.innerWidth &&
        style.visibility !== "hidden" && style.display !== "none" &&
        Number.parseFloat(style.opacity || "1") > 0;
    });
    return {
      eligibleCount: eligible.length,
      coveredCount: eligible.filter((element) =>
        element.classList.contains("language-melt-text")
      ).length,
      clippedElements: [...document.body.querySelectorAll("*")].filter((element) =>
        element.style.clipPath
      ).length,
      nonTextTargets: [...document.querySelectorAll(".language-melt-text")].filter((element) =>
        !element.classList.contains("language-melt-run")
      ).length
    };
  });
  expect(waveState.coveredCount).toBe(waveState.eligibleCount);
  expect(waveState.clippedElements).toBe(0);
  expect(waveState.nonTextTargets).toBe(0);
});

test("English and Romanian use identical font families, weights, styles, and tracking", async ({ page }) => {
  const routes = [
    "/index.html",
    "/index.html?tab=versions",
    "/index.html?tab=projects",
    "/index.html?tab=team",
    "/index.html?tab=contact",
    "/index.html?tab=sponsorship",
    "/index.html?tab=proof",
    "/index.html?tab=downloads",
    "/index.html?tab=links",
    "/technical.html"
  ];
  const sizes = [
    { width: 1440, height: 900 },
    { width: 390, height: 844 }
  ];

  for (const size of sizes) {
    await page.setViewportSize(size);
    for (const route of routes) {
      await page.goto(route);
      const differences = await page.evaluate(async () => {
        const settle = () => new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve))
        );
        const signature = (element) => {
          const style = getComputedStyle(element);
          return {
            family: style.fontFamily,
            weight: style.fontWeight,
            style: style.fontStyle,
            tracking: style.letterSpacing
          };
        };

        window.InFluxI18n.setLanguage("en");
        await document.fonts.ready;
        await settle();
        const elements = [...document.body.querySelectorAll("*")].filter((element) =>
          [...element.childNodes].some((node) =>
            node.nodeType === Node.TEXT_NODE && node.nodeValue.trim()
          )
        );
        const english = new Map(elements.map((element) => [element, signature(element)]));

        window.InFluxI18n.setLanguage("ro");
        await document.fonts.ready;
        await settle();

        return elements.flatMap((element) => {
          const before = english.get(element);
          const after = signature(element);
          return JSON.stringify(before) === JSON.stringify(after)
            ? []
            : [{
                element: element.id || element.className || element.tagName,
                before,
                after
              }];
        });
      });

      expect(differences, `${route} at ${size.width}px`).toEqual([]);
    }
  }
});

for (const viewport of viewports) {
  test(`home responsive regression / ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/index.html");
    await expect.poll(() => page.locator(".hero-artifact img").evaluate((image) =>
      Boolean(image.currentSrc && image.naturalWidth > 0)
    )).toBe(true);
    await expect(page.locator("html")).toHaveJSProperty("scrollWidth", viewport.width);
    await expect(page).toHaveScreenshot(`home-${viewport.name}.png`, { fullPage: false });
  });
}

test("mobile hero essentials fit a Xiaomi-sized opening viewport", async ({ page }) => {
  await page.setViewportSize({ width: 407, height: 812 });
  await page.goto("/index.html");
  await page.evaluate(() => document.fonts.ready);

  const heroFit = await page.evaluate(() => {
    const viewportWidth = document.documentElement.clientWidth;
    const essentials = [
      document.querySelector(".signal-label"),
      document.querySelector(".home-hero h1"),
      document.querySelector(".hero-lede"),
      document.querySelector(".action-row")
    ];
    const boxes = essentials.filter(Boolean).map((element) => element.getBoundingClientRect());

    return {
      allInsideWidth: boxes.every((box) => box.left >= 0 && box.right <= viewportWidth),
      actionsInsideOpeningViewport: boxes.at(-1).bottom <= window.innerHeight,
      displayFontLoaded: document.fonts.check('48px "InFlux Display"'),
      documentFitsWidth: document.documentElement.scrollWidth === viewportWidth
    };
  });

  expect(heroFit).toEqual({
    allInsideWidth: true,
    actionsInsideOpeningViewport: true,
    displayFontLoaded: true,
    documentFitsWidth: true
  });
});

test("mobile navigation is touch-friendly, contained, and clear", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/index.html?tab=versions");
  await expect(page.locator(".utility-tabs button")).toHaveText(["Contact Us", "Sponsors"]);
  const contactCta = await page.locator("#tab-contact").evaluate((button) => {
    const style = getComputedStyle(button);
    const envelope = getComputedStyle(button, "::before");
    const arrow = getComputedStyle(button, "::after");
    return {
      background: style.backgroundColor,
      color: style.color,
      hasEnvelopeIcon: envelope.backgroundImage.includes("svg") && envelope.width !== "auto",
      hasArrow: arrow.backgroundImage.includes("svg") && arrow.width !== "auto"
    };
  });
  expect(contactCta).toEqual({
    background: "rgb(236, 23, 44)",
    color: "rgb(244, 241, 237)",
    hasEnvelopeIcon: true,
    hasArrow: true
  });
  const storyTabs = await page.locator(".story-tabs button").evaluateAll((buttons) =>
    buttons.map((button) => button.textContent.trim())
  );
  expect(storyTabs).not.toContain("Downloads");
  expect(storyTabs).not.toContain("Links");

  const menu = page.locator("[data-menu]");
  await expect(menu).toHaveAccessibleName("Open navigation menu");
  const menuBox = await menu.boundingBox();
  expect(menuBox.width).toBeGreaterThanOrEqual(44);
  expect(menuBox.height).toBeGreaterThanOrEqual(44);

  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await expect(menu).toHaveAccessibleName("Close navigation menu");
  await expect(page.locator(".menu-toggle b")).toHaveText("Close");
  await expect(page.locator("main")).toHaveAttribute("inert", "");

  const openMenuState = await page.evaluate(() => {
    const nav = document.querySelector("#primary-nav").getBoundingClientRect();
    const buttons = [...document.querySelectorAll("#primary-nav button")];
    return {
      navInsideViewport: nav.top >= 0 && nav.bottom <= window.innerHeight,
      buttonsTouchFriendly: buttons.every((button) => button.getBoundingClientRect().height >= 44),
      buttonsTabbable: buttons.every((button) => button.tabIndex === 0)
    };
  });
  expect(openMenuState).toEqual({
    navInsideViewport: true,
    buttonsTouchFriendly: true,
    buttonsTabbable: true
  });
  await expect(page).toHaveScreenshot("mobile-menu-open.png", { fullPage: false });

  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("main")).not.toHaveAttribute("inert", "");

  await menu.click();
  await page.getByRole("tab", { name: "Team" }).click();
  await expect(page.locator("#team")).toBeFocused();
  await expect(page.locator("html")).toHaveJSProperty("scrollWidth", 390);
});

test("solid red clickable controls are reserved for contact", async ({ page }) => {
  for (const path of ["/index.html", "/technical.html"]) {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(path);
    const redTargets = await page.evaluate(() => {
      const redFills = new Set(["rgb(236, 23, 44)", "rgb(225, 25, 44)"]);
      return [...document.querySelectorAll("a, button")].flatMap((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        if (!redFills.has(style.backgroundColor) || rect.width === 0 || rect.height === 0) return [];
        return [{
          text: element.textContent.trim(),
          href: element instanceof HTMLAnchorElement ? element.getAttribute("href") : "",
          nav: element.getAttribute("data-nav") || ""
        }];
      });
    });

    expect(redTargets.length).toBeGreaterThan(0);
    expect(redTargets.every((target) =>
      /contact us/i.test(target.text) || target.href?.startsWith("contact") || target.nav === "contact"
    )).toBe(true);
  }
});

test("display typography and hero machine alignment adapt by device", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/index.html");

  const desktopState = await page.evaluate(() => {
    const artifact = document.querySelector(".hero-artifact").getBoundingClientRect();
    const machine = document.querySelector(".hero-artifact img").getBoundingClientRect();
    return {
      fontFamily: getComputedStyle(document.querySelector(".home-hero h1")).fontFamily,
      centerDelta: Math.round(Math.abs((artifact.left + artifact.width / 2) - (machine.left + machine.width / 2))),
      viewportOverflow: Math.round(Math.max(0, -machine.left) + Math.max(0, machine.right - innerWidth))
    };
  });

  expect(desktopState.fontFamily).toContain("Impact");
  expect(desktopState.centerDelta).toBeLessThanOrEqual(2);
  expect(desktopState.viewportOverflow).toBe(0);

  await page.setViewportSize({ width: 407, height: 812 });
  const mobileMachineOverflow = await page.locator(".hero-artifact img").evaluate((image) => {
    const rect = image.getBoundingClientRect();
    return Math.round(Math.max(0, -rect.left) + Math.max(0, rect.right - innerWidth));
  });
  const mobileFont = await page.locator(".home-hero h1").evaluate((element) => getComputedStyle(element).fontFamily);
  expect(mobileMachineOverflow).toBe(0);
  expect(mobileFont).toContain("InFlux Display");
});

test("red micro-label typography is enlarged", async ({ page }) => {
  await page.goto("/index.html?tab=proof");
  const fontSizes = await page.locator(".signal-label, .section-index, .version-state").evaluateAll((labels) =>
    labels.map((label) => Number.parseFloat(getComputedStyle(label).fontSize))
  );
  expect(fontSizes.every((fontSize) => fontSize >= 16)).toBe(true);
});

test("downloads include current and ONCS auto-connect operator APKs", async ({ page }) => {
  await page.goto("/index.html?tab=downloads");
  const downloadLinks = await page.locator(".download-entry").evaluateAll((entries) =>
    entries.map((entry) => ({
      label: entry.querySelector("h2")?.textContent.trim(),
      href: entry.getAttribute("href"),
      hasDownload: entry.hasAttribute("download")
    }))
  );

  expect(downloadLinks).toEqual(expect.arrayContaining([
    expect.objectContaining({
      label: "InFlux Operator APK",
      href: "/assets/influx-operator-latest.apk",
      hasDownload: true
    }),
    expect.objectContaining({
      label: "InFlux Operator Legacy",
      href: "/assets/influx-operator-auto-connect.apk",
      hasDownload: true
    })
  ]));
});

test("hidden media and 3D load only when requested", async ({ page }) => {
  await page.goto("/index.html");
  await expect(page.locator("model-viewer")).toHaveCount(0);
  await expect(page.locator('script[src*="model-viewer"]')).toHaveCount(0);
  await page.goto("/index.html?tab=versions");
  await expect.poll(() => page.locator(".version-timeline img").evaluateAll((images) =>
    images.filter((image) => image.currentSrc && image.naturalWidth > 0).length
  )).toBeGreaterThanOrEqual(2);
  const versionImageCount = await page.locator(".version-timeline img").count();
  for (let index = 0; index < versionImageCount; index += 1) {
    const image = page.locator(".version-timeline img").nth(index);
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((node) => Boolean(node.currentSrc && node.naturalWidth > 0))).toBe(true);
  }
  await expect(page.locator("model-viewer")).toHaveCount(0);
  await page.getByRole("button", { name: "Load interactive 3D" }).click();
  await expect(page.locator("model-viewer")).toHaveAttribute("src", "/assets/machine-assembly-optimized.glb");
});

test("team portraits and evidence landscape render", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/index.html?tab=team");
  await expect(page.locator(".member-portrait")).toHaveCount(4);
  await expect(page.locator(".member-portrait").first()).toHaveCSS("filter", "none");
  await expect(page.getByRole("heading", { name: "Ciprian Ursu" })).toBeVisible();
  await expect(page).toHaveScreenshot("team-desktop.png", { fullPage: false });
  await page.getByRole("tab", { name: "Proof" }).click();
  await expect(page.locator(".evidence-landscape")).toBeVisible();
  await expect(page).toHaveScreenshot("proof-desktop.png", { fullPage: false });
});

test("contact tab exposes the direct email paths", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/index.html?tab=contact");

  await expect(page).toHaveTitle("Contact Us | InFlux Origin");
  await expect(page.getByRole("tab", { name: "Contact Us" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("heading", { name: "Contact Us" })).toBeVisible();
  await expect(page.getByText("We're here to connect.")).toBeVisible();
  await expect(page.locator(".contact-option")).toHaveCount(2);
  await expect(page.getByRole("heading", { name: "Sponsorship" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "General Inquiry" })).toBeVisible();
  await expect(page.locator(".contact-identity")).toHaveCount(0);
  await expect(page.locator(".contact-option .action")).toHaveCount(0);
  await expect(page.getByRole("link", { name: /tonegari\.stefan@gmail\.com/ })).toHaveAttribute("href", /mailto:tonegari\.stefan@gmail\.com/);
  await expect(page.locator(".contact-option").nth(1).getByRole("link", { name: /david\.pintilei9@gmail\.com/ })).toHaveAttribute("href", /mailto:david\.pintilei9@gmail\.com/);
  await expect(page.getByRole("heading", { name: "Help build what comes next." })).toBeVisible();
  await expect(page.locator(".recruitment-band")).toBeVisible();
  await expect(page.getByRole("link", { name: /Questions\? Email David/ })).toHaveAttribute("href", /mailto:david\.pintilei9@gmail\.com/);
  await expect(page.getByRole("link", { name: /Apply to join InFlux using Google Forms/ })).toHaveAttribute(
    "href",
    "https://docs.google.com/forms/d/e/REPLACE_WITH_RECRUITMENT_FORM_ID/viewform"
  );
  await expect(page.getByRole("link", { name: /Apply to join InFlux using Google Forms/ })).toHaveAttribute("target", "_blank");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/index.html?tab=contact");
  await expect(page.locator(".recruitment-band")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("sponsors tab shows current sponsor tiers and visibility render", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/index.html?tab=sponsorship");

  await expect(page).toHaveTitle("Sponsors | InFlux Origin");
  await expect(page.getByRole("tab", { name: "Sponsors" })).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#sponsorship .contact-option")).toHaveCount(0);
  await expect(page.locator("#sponsorship .panel-hero")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Thank you to our sponsors!" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Interested in becoming a sponsor? Contact us! ↗" })).toHaveAttribute("href", "contact/");
  await expect(page.locator(".sponsor-logo-wall img")).toHaveCount(6);
  await expect(page.locator(".sponsor-logo-wall img").first()).toHaveAttribute("src", "/assets/sponsor-01-taggo.png");
  await expect.poll(() => page.locator("#sponsorship img").evaluateAll((images) =>
    images.every((image) => image.currentSrc && image.naturalWidth > 0)
  )).toBe(true);
  const sponsorHeights = await page.locator(".sponsor-logo-wall img").evaluateAll((logos) =>
    logos.map((logo) => Math.round(logo.getBoundingClientRect().height))
  );
  expect(sponsorHeights[0]).toBeGreaterThan(sponsorHeights[1]);
  expect(sponsorHeights[1]).toBeGreaterThan(sponsorHeights[3]);
  expect(sponsorHeights[1]).toBe(sponsorHeights[2]);
  await expect(page.getByRole("heading", { name: "Your brand can travel with the team." })).toBeVisible();
  await expect(page.locator(".uniform-render img")).toHaveAttribute("src", "/assets/sponsorship-uniform-render.jpeg");
  await expect.poll(() => page.locator(".uniform-render img").evaluate((image) =>
    Boolean(image.currentSrc && image.naturalWidth > 0)
  )).toBe(true);
  await page.getByRole("link", { name: "Interested in becoming a sponsor? Contact us! ↗" }).click();
  await expect(page.getByRole("tab", { name: "Contact Us" })).toHaveAttribute("aria-selected", "true");
  await expect(page).toHaveTitle("Contact Us | InFlux Origin");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/index.html?tab=sponsorship");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("reference-led versions and project stages render", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/index.html?tab=versions");
  await expect(page.locator("#versions-title span")).toHaveText("working machine.");
  await expect(page.locator("#versions-title span")).toHaveCSS("color", "rgb(236, 23, 44)");
  await expect(page.getByText("No need to take our word for it, convince yourself. Take a look at the InFlux Origin Mk. 1.")).toBeVisible();
  await expect(page.locator(".model-tag")).toHaveCount(0);
  await expect(page.locator(".version-timeline .showcase-stage")).toHaveCount(5);
  await expect(page.locator(".version-timeline h2")).toHaveText([
    "Sketches",
    "The beginning of InFlux",
    "Plan for MK1",
    "MK1",
    "Next up"
  ]);
  await expect(page.locator(".current-version")).toHaveScreenshot("version-current-stage.png");

  await page.goto("/index.html?tab=projects");
  await expect(page.locator("#projects .panel-hero .section-index")).toHaveText("InFlux Ecosystem");
  await expect(page.locator(".project-entry")).toHaveCount(3);
  await expect(page.getByText("Rapid Mold Program")).toHaveCount(0);
  await expect(page.locator(".operator-gallery img")).toHaveCount(3);
  await expect(page.locator(".board-scene .board-detail")).toHaveCount(0);
  await expect(page.locator(".project-index a")).toHaveCount(3);
  await expect(page.locator(".project-media-frame")).toHaveCount(3);
  await expect(page.locator(".board-scene")).toBeVisible();
  await expect(page.locator(".thermal-scene")).toBeVisible();
  await expect(page.locator(".project-operator")).toHaveScreenshot("project-operator-stage.png");
  await expect(page.locator(".project-motherboard")).toHaveScreenshot("project-motherboard-stage.png");
  await expect(page.locator(".project-thermal")).toHaveScreenshot("project-thermal-stage.png");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/index.html?tab=versions");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.goto("/index.html?tab=projects");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await expect.poll(() => page.locator(".operator-gallery img").evaluateAll(
    (images) => images.length === 3 && images.every((image) => image.naturalWidth > 0)
  )).toBe(true);
  const mobileOperatorGallery = await page.evaluate(() => {
    const gallery = document.querySelector(".operator-gallery");
    const images = [...gallery.querySelectorAll("img")];
    const boxes = images.map((image) => image.getBoundingClientRect());
    const overlaps = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
    return {
      imageCount: gallery.querySelectorAll("img").length,
      allVisible: images.every((image) => {
        const box = image.getBoundingClientRect();
        return image.naturalWidth > 0 && box.width > 0 && box.height > 0 && getComputedStyle(image).display !== "none";
      }),
      sideScreensOverlapLead: overlaps(boxes[0], boxes[1]) && overlaps(boxes[1], boxes[2]),
      leadScreenIsFront: Number(getComputedStyle(images[1]).zIndex) > Number(getComputedStyle(images[0]).zIndex)
    };
  });
  expect(mobileOperatorGallery).toEqual({
    imageCount: 3,
    allVisible: true,
    sideScreensOverlapLead: true,
    leadScreenIsFront: true
  });
  const mobileHeadingLineHeights = await page.locator(".panel-hero h1, .project-copy h2").evaluateAll((headings) =>
    headings.map((heading) => {
      const style = getComputedStyle(heading);
      return Number.parseFloat(style.lineHeight) / Number.parseFloat(style.fontSize);
    })
  );
  expect(mobileHeadingLineHeights.every((ratio) => ratio >= 0.91)).toBe(true);
});

test("proof fluid meters and updated control copy render", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/index.html?tab=proof");
  await expect(page.getByRole("heading", { name: "Not perfect. But it proves the concept." })).toBeVisible();
  await expect(page.locator(".proof-hero figure img").last()).toHaveCSS("filter", "none");
  await expect(page.locator(".fluid-meter")).toHaveCount(4);
  await expect(page.getByRole("progressbar")).toHaveCount(4);
  await expect.poll(() => page.locator(".proof-progress[data-current][data-final]").evaluateAll((cards) =>
    cards.every((card) => card.dataset.fluidPhysics)
  )).toBe(true);
  const fluidMotion = await page.locator(".proof-progress[data-current][data-final]").evaluateAll((cards) => ({
    profiles: cards.map((card) => card.dataset.fluidPhysics),
    sheenCount: cards.reduce((count, card) => count + card.querySelectorAll(".fluid-sheen, [data-fluid-sheen]").length, 0)
  }));
  expect(new Set(fluidMotion.profiles).size).toBe(4);
  expect(fluidMotion.sheenCount).toBe(0);
  await page.locator(".honesty-block").scrollIntoViewIfNeeded();
  await expect.poll(() => page.locator(".proof-progress[data-current][data-final]").evaluateAll((cards) =>
    cards.every((card) => card.classList.contains("is-fluid-ready"))
  ), { timeout: 8000 }).toBe(true);
  const indicatorGaps = await page.locator(".fluid-meter").evaluateAll((meters) => meters.map((meter) => {
    const arrow = meter.querySelector(".fluid-indicator i").getBoundingClientRect();
    const canvas = meter.querySelector(".fluid-canvas").getBoundingClientRect();
    const outlineTop = canvas.top + canvas.height * (30 / 86);
    return outlineTop - arrow.bottom;
  }));
  expect(indicatorGaps.every((gap) => Math.abs(gap - 4) < 0.75)).toBe(true);
  const goalLabels = await page.locator(".fluid-meter").evaluateAll((meters) => meters.map((meter) => {
    const goal = meter.querySelector(".fluid-goal");
    const canvas = meter.querySelector(".fluid-canvas").getBoundingClientRect();
    const outlineTop = canvas.top + canvas.height * (30 / 86);
    return {
      gap: outlineTop - goal.getBoundingClientRect().bottom,
      color: getComputedStyle(goal).color,
      text: goal.textContent.trim(),
      current: meter.querySelector(".fluid-indicator b").textContent.trim(),
      target: meter.closest(".proof-progress").dataset.current
    };
  }));
  expect(goalLabels.every(({ text }) => text.length > 0)).toBe(true);
  expect(goalLabels.every(({ gap }) => Math.abs(gap - 8) < 0.75)).toBe(true);
  expect(goalLabels.every(({ color }) => color === "rgb(244, 241, 237)")).toBe(true);
  expect(goalLabels.every(({ current, target }) => current.replace(/,/g, "") === target)).toBe(true);
  const meterValues = await page.locator(".proof-progress").evaluateAll((cards) => cards.map((card) => {
    const current = Number(card.dataset.current);
    const final = Number(card.dataset.final);
    const start = Number(card.dataset.start);
    const flipped = card.hasAttribute("data-flipped");
    const rawProgress = flipped ? (start - current) / (start - final) : current / final;
    const percentage = Math.round(Math.max(0, Math.min(1, rawProgress)) * 1000) / 10;
    const milestones = (card.dataset.milestones || "")
      .split(",")
      .map((milestone) => milestone.trim())
      .filter(Boolean)
      .map(Number)
      .filter((milestone) => Number.isFinite(milestone) && (
        flipped ? milestone > final && milestone < start : milestone > 0 && milestone < final
      ));
    return {
      displayedPercentage: card.querySelector(".proof-value").textContent.trim(),
      expectedPercentage: `${percentage}%`,
      ariaValue: card.querySelector("[role='progressbar']").getAttribute("aria-valuetext"),
      milestoneCount: card.querySelectorAll(".fluid-milestone").length,
      expectedMilestoneCount: milestones.length,
      passedCount: card.querySelectorAll(".fluid-milestone.is-passed").length,
      expectedPassedCount: milestones.filter((milestone) => flipped ? current <= milestone : current >= milestone).length
    };
  }));
  expect(meterValues.every(({ displayedPercentage, expectedPercentage }) => displayedPercentage === expectedPercentage)).toBe(true);
  expect(meterValues.every(({ ariaValue, expectedPercentage }) => ariaValue.includes(`(${expectedPercentage})`))).toBe(true);
  expect(meterValues.every(({ milestoneCount, expectedMilestoneCount }) => milestoneCount === expectedMilestoneCount)).toBe(true);
  expect(meterValues.every(({ passedCount, expectedPassedCount }) => passedCount === expectedPassedCount)).toBe(true);
  const milestoneColors = await page.locator(".fluid-milestone").evaluateAll((markers) =>
    markers.map((marker) => ({ passed: marker.classList.contains("is-passed"), color: getComputedStyle(marker).color }))
  );
  expect(milestoneColors.every(({ passed, color }) =>
    color === (passed ? "rgb(67, 224, 123)" : "rgb(255, 23, 52)")
  )).toBe(true);
  await expect(page.locator(".honesty-block")).toHaveScreenshot("proof-progress-stage.png");

  await page.setViewportSize({ width: 390, height: 844 });
  const mobileIndicatorGaps = await page.locator(".fluid-meter").evaluateAll((meters) => meters.map((meter) => {
    const arrow = meter.querySelector(".fluid-indicator i").getBoundingClientRect();
    const canvas = meter.querySelector(".fluid-canvas").getBoundingClientRect();
    return canvas.top + canvas.height * (30 / 86) - arrow.bottom;
  }));
  expect(mobileIndicatorGaps.every((gap) => Math.abs(gap - 4) < 0.75)).toBe(true);
  const mobileGoalGaps = await page.locator(".fluid-meter").evaluateAll((meters) => meters.map((meter) => {
    const goal = meter.querySelector(".fluid-goal").getBoundingClientRect();
    const canvas = meter.querySelector(".fluid-canvas").getBoundingClientRect();
    return canvas.top + canvas.height * (30 / 86) - goal.bottom;
  }));
  expect(mobileGoalGaps.every((gap) => Math.abs(gap - 8) < 0.75)).toBe(true);
});

test("proof media loads after navigating from an indexable route", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/sponsorship/");
  await page.getByRole("tab", { name: "Proof" }).click();
  await expect(page).toHaveURL(/\/\?tab=proof$/);
  await expect(page.locator("#proof")).toHaveClass(/is-active/);
  await expect.poll(() => page.locator(".proof-hero img").evaluateAll((images) =>
    images.every((image) => image.currentSrc && image.naturalWidth > 0)
  )).toBe(true);

  const featureCount = await page.locator("#proof .proof-feature").count();
  for (let index = 0; index < featureCount; index += 1) {
    const feature = page.locator("#proof .proof-feature").nth(index);
    await feature.scrollIntoViewIfNeeded();
    await expect.poll(() => feature.locator("img").evaluate((image) =>
      Boolean(image.currentSrc && image.naturalWidth > 0)
    )).toBe(true);
  }
});

test("visible sponsor media loads from the clean route", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/sponsorship/");
  await expect(page.locator("#sponsorship")).toHaveClass(/is-active/);
  await expect.poll(() => page.locator("#sponsorship img").evaluateAll((images) =>
    images.every((image) => image.currentSrc && image.naturalWidth > 0)
  )).toBe(true);
});

test("mobile dossier contents collapse and anchors clear the header", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/technical.html");
  const toggle = page.getByRole("button", { name: /Contents/ });
  await toggle.click();
  await expect(page.locator(".doc-toc")).toHaveClass(/is-open/);
  await page.getByRole("link", { name: "2. System architecture" }).click();
  const positions = await page.evaluate(() => ({
    sectionTop: Math.round(document.querySelector("#architecture").getBoundingClientRect().top),
    headerBottom: Math.round(document.querySelector(".site-header").getBoundingClientRect().bottom)
  }));
  expect(positions.sectionTop).toBeGreaterThanOrEqual(positions.headerBottom);
  await expect(page).toHaveScreenshot("technical-mobile.png", { fullPage: false });
});
