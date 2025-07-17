const fs = require("fs");
const path = require("path");
const { getBlogsOrder, renderDir, extractBlogRoot } = require("./lib/readme-utils");
const { log, logLevels } = require("./logger");

const START_MARKER = "<!-- START BLOGS -->";
const END_MARKER = "<!-- END BLOGS -->";

// ✅ Accept paths from CLI args
const args = process.argv.slice(2);
const README_PATH = args[0] || path.join(__dirname, "..", "README.md");
const INDEX_PATH = args[1] || path.join(__dirname, "..", "out", "all-blogs-index.json");
const LINK_PREFIX = args[2] || "src/";

function injectSection(content, section) {
  const start = content.indexOf(START_MARKER);
  const end = content.indexOf(END_MARKER);

  if (start === -1 || end === -1 || start > end) {
    throw new Error("Markers not found or malformed in README.md");
  }

  const before = content.slice(0, start + START_MARKER.length);
  const after = content.slice(end);

  return `${before}\n\n${section.trim()}\n\n${after}`;
}

function generateBlogMarkdown(blogTree) {
  const order = getBlogsOrder();

  log(logLevels.info, `Using blogs order: ${order.join(", ")}`);

  let markdown = `## ✍️ Latest Blog Posts\n\n`;
  markdown += renderDir(blogTree, 0, LINK_PREFIX, order).trim();

  log(logLevels.debug, "Generated blog section:\n", markdown);

  return markdown;
}

function main() {
  log(logLevels.info, "🚀 Starting README blog section update...");

  log(logLevels.debug, `Using README: ${README_PATH}`);
  log(logLevels.debug, `Using Index JSON: ${INDEX_PATH}`);

  if (!fs.existsSync(INDEX_PATH)) {
    log(logLevels.error, `Missing: ${INDEX_PATH}`);
    process.exit(1);
  }

  const index = JSON.parse(fs.readFileSync(INDEX_PATH, "utf-8"));
  const root = extractBlogRoot(index); // ✅ Trust this utility to extract "blogs"

  const readmeContent = fs.readFileSync(README_PATH, "utf-8");
  const newSection = generateBlogMarkdown(root);
  const updatedContent = injectSection(readmeContent, newSection);

  fs.writeFileSync(README_PATH, updatedContent, "utf-8");
  log(logLevels.success, "✅ README blog section updated!");
}

main();
