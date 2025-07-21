const fs = require('fs');
const path = require('path');
const { calculateChecksum, saveChecksums } = require('./lib/utility');

const BLOGS_ROOT = path.join(process.cwd(), 'out', 'blogs');

function collectMarkdownFiles(dir) {
  const files = [];

  function walk(currentPath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        const relativePath = path.relative(BLOGS_ROOT, fullPath);
        files.push({ relativePath, fullPath });
      }
    }
  }

  walk(BLOGS_ROOT);
  return files;
}

function main() {
  const files = collectMarkdownFiles(BLOGS_ROOT);
  const checksums = {};

  for (const file of files) {
    try {
      const checksum = calculateChecksum(file.fullPath);
      checksums[file.relativePath] = checksum;
    } catch (err) {
      console.warn(`⚠️ Failed to process ${file.fullPath}: ${err.message}`);
    }
  }

  saveChecksums(checksums);
  console.log(`✅ Updated checksums for ${files.length} files.`);
}

main();
