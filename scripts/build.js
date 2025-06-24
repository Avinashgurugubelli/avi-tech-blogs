// scripts/build.js

import fs from 'fs-extra';
import path from 'path';

const srcDir = path.resolve('blogs');           // Your Markdown files source
const outDir = path.resolve('out');       // Output directory

// 1. Clean output folder
fs.removeSync(outDir);

// 2. Copy all .md files & subfolders to out/blogs
fs.copySync(srcDir, outDir);
console.log(`✔ Copied Markdown files from ${srcDir} to ${outDir}`);

// 3. Generate index.json (list of all .md files with paths)
function getAllMarkdownFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);
  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllMarkdownFiles(fullPath, arrayOfFiles);
    } else if (file.endsWith('.md')) {
      arrayOfFiles.push(path.relative(srcDir, fullPath));
    }
  });
  return arrayOfFiles;
}

const mdFiles = getAllMarkdownFiles(srcDir);
const index = mdFiles.map(file => ({
  name: path.basename(file),
  path: `blogs/${file}`
}));

fs.writeJsonSync(path.resolve('out/blogs/index.json'), index, { spaces: 2 });
console.log('✔ Generated index.json');
