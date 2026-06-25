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
      href: "assets/influx-operator-latest.apk",
      hasDownload: true
    }),
    expect.objectContaining({
      label: "InFlux Operator Legacy",
      href: "assets/influx-operator-auto-connect.apk",
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
  await expect(page.locator("model-viewer")).toHaveAttribute("src", "assets/machine-assembly-optimized.glb");
});

test("team portraits and evidence landscape render", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/index.html?tab=team");
  await expect(page.locator(".member-portrait")).toHaveCount(4);
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
  await expect(page.getByRole("heading", { name: "Contact US" })).toBeVisible();
  await expect(page.getByText("We're here to connect.")).toBeVisible();
  await expect(page.locator(".contact-option")).toHaveCount(2);
  await expect(page.getByRole("heading", { name: "Sponsorship" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "General Inquiry" })).toBeVisible();
  await expect(page.locator(".contact-option .action")).toHaveCount(0);
  await expect(page.getByRole("link", { name: /tonegari\.stefan@gmail\.com/ })).toHaveAttribute("href", /mailto:tonegari\.stefan@gmail\.com/);
  await expect(page.getByRole("link", { name: /david\.pintilei9@gmail\.com/ })).toHaveAttribute("href", /mailto:david\.pintilei9@gmail\.com/);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/index.html?tab=contact");
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
  await expect(page.locator(".sponsor-logo-wall img").first()).toHaveAttribute("src", "assets/sponsor-01-taggo.png");
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
  await expect(page.locator(".uniform-render img")).toHaveAttribute("src", "assets/sponsorship-uniform-render.jpeg");
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
