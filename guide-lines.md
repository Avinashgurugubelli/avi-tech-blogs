# Contribution Guidelines

## Folder Structure
- `src/`: Contains the source code for the project.
- `src/blogs/`: Contains blog posts and articles.
- `src/blogs/01-General/`: General topics and notes.

## Naming Conventions
- All the blog files (.md extensions) should be kept in the `src/blogs/` directory.
- Directory names should be in camelCase.
- Directory names should not contain spaces or special characters.
- Directory names should start with numbers if they are part of a series (e.g., `01.general`, `02.advanced`).
- File names Should start with a number indicating the order of the blog post.
  - e.g., `01.0.graph-db-vs-triple-store-notes.md`, `01.1.data-serialization.md`
  -  Should be descriptive of the content.
  -  Use hyphens to separate words
  -  This helps in maintaining a clear and organized structure.

### Building a Project
- Clone the repository:
```bash
git clone https://github.com/Avinashgurugubelli/system-design.git
```
- Navigate to the project directory:
```bash
cd system-design 
```
- Install the required dependencies:
```bash
npm install
```
- build the project:
```bash
npm run generate:bundle
```