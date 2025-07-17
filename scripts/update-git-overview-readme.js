const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { log, logLevels } = require('./logger');
const { getBlogsOrder, renderDir } = require('./lib/readme-utils');
const appConstants = require('./constants');

// Paths
const indexPath = path.join(__dirname, '..', 'out', appConstants.FULL_CONTENT_INDEX_FILE_NAME);
const targetRepoPath = path.join(__dirname, '..', 'profile-repo');
const targetReadme = path.join(targetRepoPath, 'README.md');

// Blog link prefix (used to generate correct GitHub links)
const linkPrefix = 'https://github.com/Avinashgurugubelli/avi-tech-blogs/blob/main/src/';

/**
 * Injects the blog section into README.md between <!-- START BLOGS --> and <!-- END BLOGS -->
 */
function injectBlogSection(readmePath, newContent) {
  const original = fs.readFileSync(readmePath, 'utf-8');
  const replaced = original.replace(
    /<!-- START BLOGS -->[\s\S]*<!-- END BLOGS -->/,
    `<!-- START BLOGS -->\n${newContent.trim()}\n<!-- END BLOGS -->`
  );
  fs.writeFileSync(readmePath, replaced, 'utf-8');
  log(logLevels.success, `✅ Updated blog section in ${readmePath}`);
}

/**
 * Commits and pushes the updated README.md to the avinashgurugubelli repo
 */
function commitAndPushUpdate() {
  try {
    execSync('git config --global user.name "github-actions[bot]"');
    execSync('git config --global user.email "41898282+github-actions[bot]@users.noreply.github.com"');

    execSync(`git add README.md`, { cwd: targetRepoPath });
    execSync(`git commit -m "chore: auto-update blog list in README.md"`, { cwd: targetRepoPath });
    execSync(`git push origin main`, { cwd: targetRepoPath });

    log(logLevels.success, `✅ Committed and pushed updated README.md to avinashgurugubelli repo`);
  } catch (error) {
    log(logLevels.error, `❌ Failed to commit or push changes: ${error.message}`);
  }
}

/**
 * Main logic:
 * - Parses the full content index
 * - Renders it using your blog tree
 * - Replaces the blog section in the README
 * - Pushes the change to the overview repo
 */
function main() {
  const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
  const blogsOrder = getBlogsOrder();

  let root = index;
  if (
    Array.isArray(index.children) &&
    index.children.length === 1 &&
    index.children[0].label === 'blogs'
  ) {
    root = index.children[0];
  }

  const blogContent = renderDir(root, 0, linkPrefix, blogsOrder);
  injectBlogSection(targetReadme, blogContent);
  commitAndPushUpdate();
}

log(logLevels.info, `🚀 Starting README blog section update...`);
main();
