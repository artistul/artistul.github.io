const { test, expect } = require("@playwright/test");

test("search metadata and structured context are published", async ({ page, request }) => {
  await page.goto("/index.html");

  await expect(page).toHaveTitle("Desktop Injection Molding Machine | InFlux Origin");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://influxorigin.ro/");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /index,follow/);
  await expect(page.locator('link[rel="alternate"][type="text/plain"]')).toHaveAttribute("href", "https://influxorigin.ro/llms.txt");
  await expect(page.locator('link[rel="alternate"][type="application/json"]')).toHaveAttribute("href", "https://influxorigin.ro/ai-context.json");

  const graph = await page.locator('script[type="application/ld+json"]').evaluate((node) => JSON.parse(node.textContent));
  expect(graph["@graph"].map((entity) => entity["@type"])).toEqual(
    expect.arrayContaining(["Organization", "WebSite", "WebPage", "Product"])
  );

  const llmsResponse = await request.get("/llms.txt");
  expect(llmsResponse.ok()).toBe(true);
  expect(await llmsResponse.text()).toContain("Citation guidance");

  const aiResponse = await request.get("/ai-context.json");
  expect(aiResponse.ok()).toBe(true);
  const aiContext = await aiResponse.json();
  expect(aiContext.status).toBe("integrated prototype in active calibration");
  expect(aiContext.unproven_or_incomplete).toContain("certification");

  const sitemapResponse = await request.get("/sitemap.xml");
  const sitemap = await sitemapResponse.text();
  expect(sitemap).toContain("https://influxorigin.ro/technical.html");
  expect(sitemap).not.toContain("https://influxorigin.ro/machine/");
});

test("redirect helper routes do not compete for indexing", async ({ request }) => {
  for (const route of ["machine", "components", "team", "sponsorship", "contact", "evidence", "downloads", "resources"]) {
    const response = await request.get(`/${route}/`);
    const html = await response.text();
    expect(html).toContain('name="robots" content="noindex,follow"');
    expect(html).toContain('<link rel="canonical" href="https://influxorigin.ro/"');
    expect(html).not.toContain("artistul.github.io");
  }
});
