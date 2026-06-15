const { test, expect } = require("@playwright/test");

const viewports = [
  { name: "small-mobile", width: 320, height: 568 },
  { name: "mobile", width: 390, height: 844 },
  { name: "xiaomi-13t-pro", width: 407, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 }
];

for (const viewport of viewports) {
  test(`home responsive regression / ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/index.html");
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
    const boxes = essentials.map((element) => element.getBoundingClientRect());

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

test("display typography and hero machine alignment adapt by device", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/index.html");

  const desktopState = await page.evaluate(() => {
    const artifact = document.querySelector(".hero-artifact").getBoundingClientRect();
    const machine = document.querySelector(".hero-artifact img").getBoundingClientRect();
    return {
      fontFamily: getComputedStyle(document.querySelector(".home-hero h1")).fontFamily,
      centerDelta: Math.round(Math.abs((artifact.left + artifact.width / 2) - (machine.left + machine.width / 2)))
    };
  });

  expect(desktopState.fontFamily).toContain("Impact");
  expect(desktopState.centerDelta).toBeLessThanOrEqual(2);

  await page.setViewportSize({ width: 407, height: 812 });
  const mobileFont = await page.locator(".home-hero h1").evaluate((element) => getComputedStyle(element).fontFamily);
  expect(mobileFont).toContain("InFlux Display");
});

test("hidden media and 3D load only when requested", async ({ page }) => {
  await page.goto("/index.html");
  await expect(page.locator("model-viewer")).toHaveCount(0);
  await expect(page.locator('script[src*="model-viewer"]')).toHaveCount(0);
  await page.getByRole("tab", { name: "Machine Versions" }).click();
  await expect(page.locator(".version-timeline img[src]")).toHaveCount(3);
  await expect(page.locator("model-viewer")).toHaveCount(0);
  await page.getByRole("button", { name: "Load interactive 3D" }).click();
  await expect(page.locator("model-viewer")).toHaveAttribute("src", "assets/machine-assembly-optimized.glb");
});

test("team portraits and evidence landscape render", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/index.html?tab=team");
  await expect(page.locator(".member-portrait")).toHaveCount(3);
  await expect(page).toHaveScreenshot("team-desktop.png", { fullPage: false });
  await page.getByRole("tab", { name: "Proof" }).click();
  await expect(page.locator(".evidence-landscape")).toBeVisible();
  await expect(page).toHaveScreenshot("proof-desktop.png", { fullPage: false });
});

test("reference-led versions and project stages render", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/index.html?tab=versions");
  await expect(page.locator("#versions-title span")).toHaveText("Three levels");
  await expect(page.locator("#versions-title span")).toHaveCSS("color", "rgb(236, 23, 44)");
  await expect(page.getByText("No need to take our word for it, convince yourself. Take a look at the InFlux Origin Mk. 1.")).toBeVisible();
  await expect(page.locator(".model-tag")).toHaveCount(0);
  await expect(page.locator(".version-timeline .showcase-stage")).toHaveCount(3);
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
  await expect(page.getByRole("heading", { name: "Every action has a supervisor." })).toBeVisible();
  await expect(page.locator(".fluid-meter")).toHaveCount(4);
  await expect(page.getByRole("progressbar")).toHaveCount(4);
  await expect.poll(() => page.locator(".proof-progress[data-progress]").evaluateAll((cards) =>
    cards.every((card) => card.dataset.fluidPhysics)
  )).toBe(true);
  const fluidMotion = await page.locator(".proof-progress[data-progress]").evaluateAll((cards) => ({
    profiles: cards.map((card) => card.dataset.fluidPhysics),
    sheenCount: cards.reduce((count, card) => count + card.querySelectorAll(".fluid-sheen, [data-fluid-sheen]").length, 0)
  }));
  expect(new Set(fluidMotion.profiles).size).toBe(4);
  expect(fluidMotion.sheenCount).toBe(0);
  await page.locator(".honesty-block").scrollIntoViewIfNeeded();
  await expect.poll(() => page.locator(".proof-progress[data-progress]").evaluateAll((cards) =>
    cards.every((card) => card.classList.contains("is-fluid-ready"))
  ), { timeout: 8000 }).toBe(true);
  const indicatorGaps = await page.locator(".fluid-meter").evaluateAll((meters) => meters.map((meter) => {
    const arrow = meter.querySelector(".fluid-indicator i").getBoundingClientRect();
    const canvas = meter.querySelector(".fluid-canvas").getBoundingClientRect();
    const outlineTop = canvas.top + canvas.height * (30 / 86);
    return outlineTop - arrow.bottom;
  }));
  expect(indicatorGaps.every((gap) => Math.abs(gap - 4) < 0.75)).toBe(true);
  await expect(page.locator(".honesty-block")).toHaveScreenshot("proof-progress-stage.png");

  await page.setViewportSize({ width: 390, height: 844 });
  const mobileIndicatorGaps = await page.locator(".fluid-meter").evaluateAll((meters) => meters.map((meter) => {
    const arrow = meter.querySelector(".fluid-indicator i").getBoundingClientRect();
    const canvas = meter.querySelector(".fluid-canvas").getBoundingClientRect();
    return canvas.top + canvas.height * (30 / 86) - arrow.bottom;
  }));
  expect(mobileIndicatorGaps.every((gap) => Math.abs(gap - 4) < 0.75)).toBe(true);
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
