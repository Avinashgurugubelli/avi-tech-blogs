const fs = require('fs');
const path = require('path');
const appConstants = require('./constants');
const { log, logLevels } = require('./logger');
const { getBlogsOrder, renderDir } = require('./lib/readme-utils');

const indexPath = process.argv[2] || path.join(__dirname, '..', 'out', appConstants.FULL_CONTENT_INDEX_FILE_NAME);
const outReadme = process.argv[3] || path.join(__dirname, '..', 'out', 'README.md');
const linkPrefix = process.argv[4] || '';

function main() {
  const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));

  let root = index;
  if (
    Array.isArray(index.children) &&
    index.children.length === 1 &&
    index.children[0].label === 'blogs'
  ) {
    root = index.children[0];
  }

  const blogsOrder = getBlogsOrder();
  let md = `## ✍️ Latest Blog Posts \n\n`;
  md += renderDir(root, 0, linkPrefix, blogsOrder);

  fs.writeFileSync(outReadme, md.trim() + '\n', 'utf-8');
  log(logLevels.success, `Generated: ${outReadme}`);
}

log(logLevels.info, `>>>>>> Started generating the read me >>>>`);
main();
