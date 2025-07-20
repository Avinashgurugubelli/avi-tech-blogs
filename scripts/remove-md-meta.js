const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const MarkdownIt = require("markdown-it");
const mermaidPlugin = require("markdown-it-mermaid-plugin");
const tocPlugin = require("markdown-it-toc-done-right");
const PDFMerger = require("pdf-merger-js").default;

const { log, logLevels } = require("./logger");

const BLOGS_ROOT = path.join(__dirname, "..", "out", "blogs");
const PDF_ROOT = path.join(__dirname, "..", "out", "pdfs");
const INDEX_PATH = path.join(__dirname, "..", "out", "all-blogs-index.json");
const MERGED_PDF_PATH = path.join(PDF_ROOT, "All-Blogs-Merged.pdf");

const md = new MarkdownIt({ html: true, breaks: true })
  .use(tocPlugin, { level: 2 })
  .use(mermaidPlugin);

async function convertMarkdownToPDF(mdPath, pdfPath) {
  const markdown = fs.readFileSync(mdPath, "utf-8");
  const htmlContent = md.render(markdown);

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Blog</title>
    <style>
      body { font-family: sans-serif; padding: 2em; }
      pre, code { background: #f0f0f0; padding: 0.5em; border-radius: 5px; }
      img { max-width: 100%; }
      .mermaid { text-align: center; margin: 2em auto; }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
    <script>mermaid.initialize({ startOnLoad: true });</script>
  </head>
  <body>
    ${htmlContent}
  </body>
  </html>
  `;

  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  log(logLevels.debug, `Rendering HTML content in Puppeteer for: ${mdPath}`);
  await page.setContent(html, { waitUntil: ["networkidle0", "domcontentloaded"] });

  // Wait for Mermaid rendering
  await page.waitForFunction(() => {
    const el = document.querySelector(".mermaid > svg");
    return el && el instanceof SVGElement;
  });

  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
  });

  await browser.close();
}

function ensureDirSync(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function processNode(node, merger, relPath = "") {
  if (node.type === "file" && node.path.endsWith(".md")) {
    const mdPath = path.join(BLOGS_ROOT, node.path.replace(/^blogs\//, ""));
    const pdfPath = path.join(PDF_ROOT, node.path.replace(/^blogs\//, "").replace(/\.md$/, ".pdf"));
    ensureDirSync(path.dirname(pdfPath));

    if (fs.existsSync(mdPath)) {
      log(logLevels.info, `⏳ Starting PDF generation: ${mdPath}`);
      await convertMarkdownToPDF(mdPath, pdfPath);
      log(logLevels.success, `✅ Finished: ${pdfPath}`);
      merger.add(pdfPath);
    } else {
      log(logLevels.warn, `Skipping missing file: ${mdPath}`);
    }
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      await processNode(child, merger, path.join(relPath, node.label || ""));
    }
  }
}

async function main() {
  log(logLevels.info, "🚀 Starting Blog PDF Generator...");

  ensureDirSync(PDF_ROOT);
  if (!fs.existsSync(INDEX_PATH)) {
    log(logLevels.error, "Missing file: all-blogs-index.json");
    process.exit(1);
  }

  const index = JSON.parse(fs.readFileSync(INDEX_PATH, "utf-8"));
  const merger = new PDFMerger();

  await processNode(index, merger);

  log(logLevels.info, "📚 Merging all generated PDFs...");
  await merger.save(MERGED_PDF_PATH);

  log(logLevels.success, `🎉 All blogs compiled into: ${MERGED_PDF_PATH}`);
  log(logLevels.info, "✅ PDF generation completed successfully!");
}

main();
