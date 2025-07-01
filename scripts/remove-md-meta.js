const fs = require('fs');
const path = require('path');
const { log,logLevels } = require('./logger');

// Usage: node scripts/remove-metadata.js [directory]
// Default: out/blogs
const BLOGS_ROOT = process.argv[2] || path.join(__dirname, '..', 'out', 'blogs');

function processDir(dir) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
    const absPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processDir(absPath);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      removeTopMeta(absPath);
    }
  });
}

function removeTopMeta(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const newContent = content.replace(/^<!--[\s\S]*?-->\s*/m, '');
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent, 'utf-8');
    log(logLevels.info, `Removed metadata from: ${filePath}`);
  }
}

processDir(BLOGS_ROOT);