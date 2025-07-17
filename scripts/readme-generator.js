const fs = require('fs');
const path = require('path');

const appConstants = require('./constants');
const { log, logLevels } = require('./logger');

// Accept index and output readme paths as parameters or use defaults
const indexPath = process.argv[2] || path.join(__dirname, '..', 'out', appConstants.FULL_CONTENT_INDEX_FILE_NAME);
const outReadme = process.argv[3] || path.join(__dirname, '..', 'out', 'README.md');
const linkPrefix = process.argv[4] || '';

// Read blog order from src/blogs/info.json if available
const blogsInfoPath = path.join(__dirname, '..', 'src', 'blogs', 'info.json');
let blogsOrder = [];
if (fs.existsSync(blogsInfoPath)) {
  try {
    const blogsInfo = JSON.parse(fs.readFileSync(blogsInfoPath, 'utf-8'));
    if (Array.isArray(blogsInfo.blogsOrder)) {
      blogsOrder = blogsInfo.blogsOrder.map(name => name.toLowerCase());
      log(logLevels.info, `Using blogsOrder from info.json: ${blogsOrder.join(', ')}`);
    }
  } catch (e) {
    log(logLevels.warn, `Could not parse blogsOrder from info.json: ${e.message}`);
  }
}

// Fallback order if blogsOrder is not present
const fallbackOrder = [
  'oops',
  'solid-principles',
  'design-patterns',
  'system-design'
];

function sortChildrenByOrder(children) {
  const order = blogsOrder.length ? blogsOrder : fallbackOrder;
  log(logLevels.info, `Sorting children by order: ${order.join(', ')}`);
  return children.slice().sort((a, b) => {
    const aName = (a.id || a.label || '').toLowerCase();
    const bName = (b.id || b.label || '').toLowerCase();
    const aIdx = order.indexOf(aName);
    const bIdx = order.indexOf(bName);
    if (aIdx === -1 && bIdx === -1) return 0;
    if (aIdx === -1) return 1;
    if (bIdx === -1) return -1;
    return aIdx - bIdx;
  });
}

function renderDir(dir, depth = 0) {
  let md = '';
  if (!Array.isArray(dir.children) || dir.children.length === 0) {
    log(logLevels.warn, `Skipping empty directory: ${dir.label}`);
    return ''; // Ignore section if it does not have children
  }
  let children = dir.children;
  // Only sort top-level blogs folders
  if (depth === 0) {
    children = sortChildrenByOrder(children);
  }
  if (depth === 1) {
    md += `\n## ${dir.title || dir.label}\n\n`;
  } else if (depth === 2) {
    md += `\n### ${dir.title || dir.label}\n\n`;
  } else if (depth > 2) {
    md += `\n#### ${dir.title || dir.label}\n\n`;
  }

  for (const child of children) {
    if (child.type === 'directory') {
      md += renderDir(child, depth + 1);
    } else if (child.type === 'file') {
      const title = child.title || child.label;
      const relPath = linkPrefix + (child.path.startsWith('blogs/') ? child.path : `blogs/${child.path}`);
      md += `- [${title}](${relPath})\n`;
    }
  }
  md += '\n';
  return md;
}

function main() {
  const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
  // If the root has a single "blogs" directory, descend into it
  let root = index;
  if (
    Array.isArray(index.children) &&
    index.children.length === 1 &&
    index.children[0].label === 'blogs'
  ) {
    root = index.children[0];
  }
  let md = ``
  // md = `# Avinash Gurugubelli Technical Blogs\n\n`;
  md += `## ✍️ Latest Blog Posts \n\n`;
  md += renderDir(root);

  fs.writeFileSync(outReadme, md.trim() + '\n', 'utf-8');
  log(logLevels.success, `Generated: ${outReadme}`);
}

log(logLevels.info, `>>>>>> Started generating the read me >>>>`);
main();