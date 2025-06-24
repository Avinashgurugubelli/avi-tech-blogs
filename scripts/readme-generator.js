const fs = require('fs');
const path = require('path');

// Accept index and output readme paths as parameters or use defaults
const indexPath = process.argv[2] || path.join(__dirname, '..', 'out', 'blogs', 'index.json');
const outReadme = process.argv[3] || path.join(__dirname, '..', 'out', 'README.md');
const linkPrefix = process.argv[4] || '';

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
        // Remove leading 'blogs/' if present
        // const relPath = child.path.startsWith('blogs/') ? child.path : `blogs/${child.path}`;
        const relPath = linkPrefix + (child.path.startsWith('blogs/') ? child.path : `blogs/${child.path}`);
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
  let md = `# Avinash Gurugubelli Technical Blogs\n\n`;
  md = `## Blogs Index\n\n`;
  md += renderDir(root);

  fs.writeFileSync(outReadme, md.trim() + '\n', 'utf-8');
  console.log(`Generated: ${outReadme}`);
}

main();