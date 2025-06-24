const fs = require('fs');
const path = require('path');

const OUT_ROOT = path.join(__dirname, '..', 'out');
const BLOGS_ROOT = path.join(OUT_ROOT, 'blogs');
const OUTPUT_INDEX = path.join(OUT_ROOT, 'index.json');

function readSubfolderIndexes(root) {
  const children = [];
  fs.readdirSync(root, { withFileTypes: true }).forEach(dirent => {
    if (dirent.isDirectory()) {
      const subfolder = dirent.name;
      const indexPath = path.join(root, subfolder, 'index.json');
      if (fs.existsSync(indexPath)) {
        try {
          const data = fs.readFileSync(indexPath, 'utf-8');
          const json = JSON.parse(data);
          children.push(json);
        } catch (e) {
          console.warn(`Warning: Could not parse ${indexPath}: ${e.message}`);
        }
      }
    }
  });
  return children;
}

function generateRootIndex() {
  if (!fs.existsSync(BLOGS_ROOT)) {
    console.error('No out/blogs directory found.');
    process.exit(1);
  }
  const rootIndex = {
    label: 'blogs',
    type: 'directory',
    children: readSubfolderIndexes(BLOGS_ROOT)
  };
  fs.writeFileSync(OUTPUT_INDEX, JSON.stringify(rootIndex, null, 2), 'utf-8');
  console.log(`Generated: ${OUTPUT_INDEX}`);
}

generateRootIndex();