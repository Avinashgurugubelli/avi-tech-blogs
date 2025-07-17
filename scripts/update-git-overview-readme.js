// scripts/update-git-overview-readme.js
const fs = require("fs");
const path = require("path");

const readmePath = process.argv[2]; // ../profile-repo/README.md
const infoJsonPath = process.argv[3]; // src/blogs/info.json

function formatBlogList(blogs) {
  return blogs.map(blog => `- [${blog.title}](${blog.url})`).join("\n");
}

function updateReadme(readmeContent, blogListMarkdown) {
  const startMarker = "<!-- START BLOGS -->";
  const endMarker = "<!-- END BLOGS -->";

  const startIndex = readmeContent.indexOf(startMarker);
  const endIndex = readmeContent.indexOf(endMarker);

  if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) {
    throw new Error("Markers not found or in wrong order in README.md");
  }

  return (
    readmeContent.slice(0, startIndex + startMarker.length) +
    "\n" +
    blogListMarkdown +
    "\n" +
    readmeContent.slice(endIndex)
  );
}

function main() {
  console.log("🚀 Starting README blog section update...");

  const infoJson = JSON.parse(fs.readFileSync(infoJsonPath, "utf-8"));
  const blogMarkdown = formatBlogList(infoJson.blogs);

  let readme = fs.readFileSync(readmePath, "utf-8");
  readme = updateReadme(readme, blogMarkdown);

  fs.writeFileSync(readmePath, readme, "utf-8");

  console.log("✅ README.md updated successfully.");
}

main();
