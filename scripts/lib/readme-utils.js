const fs = require('fs');
const path = require('path');
const appConstants = require('../constants');
const { log, logLevels } = require('../logger');

function getBlogsOrder() {
    const blogsIndexPath = path.join(process.cwd(), 'out', 'all-blogs-index.json');

    let blogsOrder = [];

    if (fs.existsSync(blogsIndexPath)) {
        try {
            const blogsIndex = JSON.parse(fs.readFileSync(blogsIndexPath, 'utf-8'));
            if (Array.isArray(blogsIndex.children)) {
                blogsOrder = blogsIndex.children
                    .map(child => child.id || child.label)
                    .filter(Boolean)
                    .map(name => name.toLowerCase());

                log(logLevels.info, `Using blogsOrder from all-blogs-index.json: ${blogsOrder.join(', ')}`);
            }
        } catch (e) {
            log(logLevels.warn, `Could not parse blogsOrder from all-blogs-index.json: ${e.message}`);
        }
    } else {
        log(logLevels.warn, `out/all-blogs-index.json not found. Using default blogsOrder.`);
    }

    return blogsOrder.length
        ? blogsOrder
        : ['oops', 'solid-principles', 'design-patterns', 'system-design'];
}


function sortChildrenByOrder(children, order) {
    const orderMap = new Map(order.map((name, index) => [name.toLowerCase(), index]));

    return children.slice().sort((a, b) => {
        const aName = (a.id || a.label || '').toLowerCase();
        const bName = (b.id || b.label || '').toLowerCase();

        const aIdx = orderMap.has(aName) ? orderMap.get(aName) : Infinity;
        const bIdx = orderMap.has(bName) ? orderMap.get(bName) : Infinity;

        return aIdx - bIdx;
    });
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

module.exports = {
    getBlogsOrder,
    renderDir
};
