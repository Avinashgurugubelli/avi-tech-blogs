const fs = require('fs');
const path = require('path');
const appConstants = require('../constants');
const { log, logLevels } = require('../logger');

function getBlogsOrder() {
    const infoJsonPath = path.join(process.cwd(), 'src', 'blogs', 'info.json');

    try {
        const info = JSON.parse(fs.readFileSync(infoJsonPath, 'utf-8'));

        if (Array.isArray(info.blogsOrder)) {
            log(logLevels.info, `Using blogsOrder from info.json: ${info.blogsOrder.join(', ')}`);
            return info.blogsOrder;
        } else {
            log(logLevels.warn, `blogsOrder is missing or not an array in info.json`);
        }
    } catch (err) {
        log(logLevels.warn, `Failed to read blogsOrder from info.json: ${err.message}`);
    }

    // fallback default order
    return ['oops', 'solid-principles', 'design-patterns', 'system-design'];
}


function sortChildrenByOrder(children, order) {
  return children.sort((a, b) => {
    const aLabel = normalizeLabel(a.label);
    const bLabel = normalizeLabel(b.label);

    const aIdx = order.indexOf(aLabel);
    const bIdx = order.indexOf(bLabel);

    // If not in the order list, put it at the end alphabetically
    if (aIdx === -1 && bIdx === -1) return aLabel.localeCompare(bLabel);
    if (aIdx === -1) return 1;
    if (bIdx === -1) return -1;

    return aIdx - bIdx;
  });
}

function normalizeLabel(label) {
  return label
    .toLowerCase()
    .replace(/\s+/g, "-")       // spaces to dashes
    .replace(/[^\w-]/g, "")     // remove special chars
    .trim();
}


function renderDir(dir, depth = 0, linkPrefix = '', blogsOrder = []) {
    log(logLevels.debug, `Rendering directory: ${dir.label} at depth ${depth}`);
    log(logLevels.debug, `Using link prefix: ${linkPrefix}`);
    log(logLevels.debug, `Blogs order: ${blogsOrder.join(', ')}`);

    let md = '';
    if (!Array.isArray(dir.children) || dir.children.length === 0) {
        log(logLevels.warn, `Skipping empty directory: ${dir.label}`);
        return '';
    }

    let children = dir.children;
    if (depth === 0) {
        children = sortChildrenByOrder(children, blogsOrder);
    }

    if (depth === 1) md += `\n## ${dir.title || dir.label}\n\n`;
    else if (depth === 2) md += `\n### ${dir.title || dir.label}\n\n`;
    else if (depth > 2) md += `\n#### ${dir.title || dir.label}\n\n`;

    for (const child of children) {
        if (child.type === 'directory') {
            md += renderDir(child, depth + 1, linkPrefix, blogsOrder);
        } else if (child.type === 'file') {
            const title = child.title || child.label;
            const relPath = linkPrefix + (child.path.startsWith('blogs/') ? child.path : `blogs/${child.path}`);
            md += `- [${title}](${relPath})\n`;
        }
    }

    md += '\n';
    return md;
}

function extractBlogRoot(index) {
  if (
    Array.isArray(index.children) &&
    index.children.length === 1 &&
    index.children[0].label === 'blogs'
  ) {
    return index.children[0];
  }
  return index;
}

module.exports = { extractBlogRoot };


module.exports = {
    getBlogsOrder,
    renderDir,
    extractBlogRoot
};
