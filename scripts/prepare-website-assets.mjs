import { chromium } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,>~])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim();
}

async function writeMinifiedCss(inputName, outputName) {
  const inputPath = path.join(repo, inputName);
  const outputPath = path.join(repo, outputName);
  const css = await readFile(inputPath, "utf8");
  await writeFile(outputPath, `${minifyCss(css)}\n`);
  console.log(`Wrote ${outputName}`);
}

function mimeFor(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".png") return "image/png";
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".webp") return "image/webp";
  throw new Error(`Unsupported image type: ${filePath}`);
}

async function resizeImage(page, inputName, outputName, width, type, quality = 0.82) {
  const inputPath = path.join(repo, inputName);
  const outputPath = path.join(repo, outputName);
  const source = await readFile(inputPath);
  const dataUrl = `data:${mimeFor(inputPath)};base64,${source.toString("base64")}`;

  const encoded = await page.evaluate(
    async ({ dataUrl, width, type, quality }) => {
      const img = await new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error(`Could not load ${dataUrl.slice(0, 60)}...`));
        image.src = dataUrl;
      });

      const height = Math.max(1, Math.round((img.naturalHeight / img.naturalWidth) * width));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      return canvas.toDataURL(type, quality).split(",")[1];
    },
    { dataUrl, width, type, quality }
  );

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, Buffer.from(encoded, "base64"));
  console.log(`Wrote ${outputName}`);
}

await writeMinifiedCss("styles.css", "styles.min.css");
await writeMinifiedCss("technical.css", "technical.min.css");

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await resizeImage(page, "assets/machine-full.webp", "assets/machine-full-640.webp", 640, "image/webp", 0.78);
  await resizeImage(page, "assets/machine-full.webp", "assets/machine-full-960.webp", 960, "image/webp", 0.8);
  await resizeImage(page, "assets/influx-logo-white.png", "assets/influx-logo-white-96.webp", 96, "image/webp", 0.86);
} finally {
  await browser.close();
}
