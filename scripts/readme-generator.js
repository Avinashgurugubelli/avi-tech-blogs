const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'out', 'blogs', 'index.json');
const outReadme = path.join(__dirname, '..', 'out', 'README.md');

function renderDir(dir, depth = 0) {
  let md = '';
  if (depth === 1) {
    md += `\n## ${dir.Title || dir.label}\n\n`;
  } else if (depth === 2) {
    md += `\n### ${dir.Title || dir.label}\n\n`;
  } else if (depth > 2) {
    md += `\n#### ${dir.Title || dir.label}\n\n`;
  }

  if (Array.isArray(dir.children)) {
    for (const child of dir.children) {
      if (child.type === 'directory') {
        md += renderDir(child, depth + 1);
      } else if (child.type === 'file') {
        const title = child.title || child.label;
        const relPath = child.path.startsWith('blogs/') ? child.path : `blogs/${child.path}`;
        md += `- [${title}](${relPath})\n`;
      }
    }
    md += '\n';
  }
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

  let md = `# Blogs Index\n\n`;
  md += renderDir(root);

  fs.writeFileSync(outReadme, md.trim() + '\n', 'utf-8');
  console.log(`Generated: ${outReadme}`);
}

main();