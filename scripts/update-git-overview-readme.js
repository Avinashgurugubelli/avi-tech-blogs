const fs = require("fs");
const path = require("path");

const START_MARKER = "<!-- START BLOGS -->";
const END_MARKER = "<!-- END BLOGS -->";

const [,, readmePath, jsonPath] = process.argv;

function generateBlogMarkdown(blogs) {
  return blogs.map(blog => `- [${blog.title}](${blog.link})`).join("\n");
}

function updateReadme(readme, newSection) {
  const start = readme.indexOf(START_MARKER);
  const end = readme.indexOf(END_MARKER);
  if (start === -1 || end === -1 || end < start) {
    throw new Error("Markers not found or misordered in README.md");
  }

  return (
    readme.slice(0, start + START_MARKER.length) +
    "\n\n" +
    newSection +
    "\n\n" +
    readme.slice(end)
  );
}

function main() {
  console.log("[INFO] 🚀 Starting README blog section update...");

  const infoJson = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

  const blogs = infoJson.blogs || [];
  if (blogs.length === 0) {
    console.warn("[WARN] No blogs found in info.json");
  }

  const newSection = generateBlogMarkdown(blogs);
  const readme = fs.readFileSync(readmePath, "utf-8");
  const updated = updateReadme(readme, newSection);

  fs.writeFileSync(readmePath, updated, "utf-8");
  console.log("[SUCCESS] ✅ README blog section updated!");
}

main();
