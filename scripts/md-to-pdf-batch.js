const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const MarkdownIt = require("markdown-it");
const mermaidPlugin = require("markdown-it-mermaid-plugin");
const tocPlugin = require("markdown-it-toc-done-right");
const PDFMerger = require("pdf-merger-js").default;

const {calculateChecksum, loadChecksums, saveChecksums} = require("./lib/utility");


const { log, logLevels } = require("./logger"); // Replace or stub as needed


// Path configs
const BLOGS_ROOT = path.join(process.cwd(), 'out', 'blogs');
const PDF_ROOT = path.join(process.cwd(), 'out', 'blogs-pdfs');
const INDEX_PATH = path.join(process.cwd(), 'out', 'all-blogs-index.json');
const MERGED_PDF_PATH = path.join(PDF_ROOT, 'All-Blogs-Merged.pdf');


const md = new MarkdownIt({ html: true, breaks: true })
  .use(tocPlugin, { level: 2 })
  .use(mermaidPlugin);


// Force all markdown image tokens to HTML <img> tags (never fallback to markdown)
md.renderer.rules.image = function (tokens, idx) {
  const token = tokens[idx];
  const src = token.attrGet('src');
  const alt = token.content || '';
  return `<img src="${src}" alt="${alt}" />`;
};


function ensureDirSync(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}


function cleanDirSync(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
    log(logLevels.info, `Cleaned existing directory: ${dir}`);
  }
}


// Embeds local images as base64, lets data URIs pass through
function fixImagePaths(md, mdFilePath) {
  const dir = path.dirname(mdFilePath);

  return md.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, relPath) => {
    // Pass data URIs unmodified
    if (/^data:image\//.test(relPath)) return match;

    // Convert local files
    if (/^(?:\.\/|images\/|..\/)/.test(relPath)) {
      try {
        const absPath = path.resolve(dir, relPath);
        const ext = path.extname(absPath).toLowerCase();
        if (fs.existsSync(absPath) && ['.png', '.jpg', '.jpeg', '.gif', '.svg'].includes(ext)) {
          if (ext === '.svg') {
            // Inline SVG as raw HTML
            const svgContent = fs.readFileSync(absPath, 'utf8');
            return `\n<div role="img" aria-label="${alt}">${svgContent}</div>\n`;
          } else {
            // Embed as base64 data URI for other image types
            const imageData = fs.readFileSync(absPath);
            const base64 = imageData.toString('base64').replace(/\s+/g, '');
            const mimeType = {
              '.png': 'image/png',
              '.jpg': 'image/jpeg',
              '.jpeg': 'image/jpeg',
              '.gif': 'image/gif'
            }[ext] || 'application/octet-stream';
            return `![${alt}](data:${mimeType};base64,${base64})`;
          }
        }
      } catch (err) {
        log(logLevels.warn, `Failed to embed image: ${relPath} - ${err.message}`);
      }
    }

    return match;
  });
}



async function convertMarkdownToPDF(mdPath, pdfPath) {
  const markdownRaw = fs.readFileSync(mdPath, 'utf-8');
  const markdown = fixImagePaths(markdownRaw, mdPath);
  const htmlContent = md.render(markdown);


  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Blog</title>
      <style>
        body { font-family: sans-serif; padding: 2em; }
        pre, code {
          background: #f0f0f0;
          padding: 0.5em;
          border-radius: 5px;
          font-family: 'Fira Mono', 'Consolas', 'Menlo', monospace;
          font-size: 0.95em;
          overflow-x: auto;
          white-space: pre;
          word-break: break-word;
          line-height: 1.5;
        }
        img { max-width: 100%; height: auto; }
        .mermaid { text-align: center; margin: 2em auto; }
        table { width: 100%; border-collapse: collapse; margin: 1em 0; }
        table, th, td { border: 1px solid #ccc; }
        th, td { padding: 8px 12px; text-align: left; }
        thead { background: #f9f9f9; }
      </style>
      <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
      <script>mermaid.initialize({ startOnLoad: true });</script>
    </head>
    <body>
      ${htmlContent}
    </body>
    </html>
  `;


  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();


  log(logLevels.debug, `Rendering HTML for: ${mdPath}`);
  await page.setContent(html, { waitUntil: ['networkidle0', 'domcontentloaded'] });


  try {
    await page.waitForFunction(() => {
      const el = document.querySelector('.mermaid > svg');
      return el && el instanceof SVGElement;
    }, { timeout: 10000 });
  } catch (e) {
    log(logLevels.warn, `Mermaid diagram may not have rendered in: ${mdPath}`);
  }


  await page.pdf({ path: pdfPath, format: 'A4', printBackground: true });
  await browser.close();
}


async function collectMarkdownFiles(node) {
  let files = [];
  if (node.type === 'file' && node.path.endsWith('.md')) {
    files.push(node);
  } else if (Array.isArray(node.children)) {
    for (const child of node.children) {
      files = files.concat(await collectMarkdownFiles(child));
    }
  }
  return files;
}


async function processFilesInParallel(files, merger, concurrency = 4) {
  const chunkArray = (arr, size) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };


  const chunks = chunkArray(files, concurrency);


  log(logLevels.info, `Processing ${files.length} files in ${chunks.length} parallel chunks.`);
  for (const [chunkIndex, chunk] of chunks.entries()) {
    log(logLevels.info, `Processing chunk ${chunkIndex+1} with ${chunk.length} files.`);
    await Promise.all(chunk.map(async (fileNode) => {
      const mdPath = path.join(BLOGS_ROOT, fileNode.path.replace(/^blogs\//, ''));
      const pdfPath = path.join(PDF_ROOT, fileNode.path.replace(/^blogs\//, '').replace(/\.md$/, '.pdf'));
      ensureDirSync(path.dirname(pdfPath));
      if (fs.existsSync(mdPath)) {
        log(logLevels.info, `⏳ Generating PDF: ${mdPath}`);
        try {
          await convertMarkdownToPDF(mdPath, pdfPath);
          log(logLevels.success, `✅ PDF created: ${pdfPath}`);
          merger.add(pdfPath);
        } catch (err) {
          log(logLevels.error, `❌ Failed: ${mdPath} -> ${pdfPath}: ${err.message}`);
        }
      } else {
        log(logLevels.warn, `⚠️ Missing file: ${mdPath}`);
      }
    }));
  }
}


async function main() {
  log(logLevels.info, '🚀 Starting Blog PDF Generator (Parallel)');
  cleanDirSync(PDF_ROOT);
  ensureDirSync(PDF_ROOT);


  if (!fs.existsSync(INDEX_PATH)) {
    log(logLevels.error, `Missing index file: ${INDEX_PATH}`);
    process.exit(1);
  }


  const index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf-8'));
  const merger = new PDFMerger();
  const files = await collectMarkdownFiles(index);


  if (files.length === 0) {
    log(logLevels.warn, 'No markdown files found to process.');
    process.exit(0);
  }


  await processFilesInParallel(files, merger, 4);


  log(logLevels.info, '📚 Merging all generated PDFs...');
  await merger.save(MERGED_PDF_PATH);


  log(logLevels.success, `🎉 All blogs merged into: ${MERGED_PDF_PATH}`);
}


main().catch((err) => {
  log(logLevels.error, `Fatal error: ${err.message}`);
  process.exit(1);
});
