const fs = require('fs');
const path = require('path');
const appConstants = require('../constants');
const { log, logLevels } = require('../logger');

function getBlogsOrder() {
    const blogsInfoPath = path.join(process.cwd(), 'src', 'blogs', 'info.json');

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

    else {
        log(logLevels.warn, `src/blogs/info.json not found or invalid. Using default blogsOrder.`);
    }

    return blogsOrder.length
        ? blogsOrder
        : ['oops', 'solid-principles', 'design-patterns', 'system-design'];
}

function sortChildrenByOrder(children, order) {
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
