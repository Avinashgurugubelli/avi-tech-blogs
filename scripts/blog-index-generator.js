const fs = require('fs');
const path = require('path');
const JSON5 = require('json5');

const appConstants = require('./constants');

// Accept input and output directories as parameters or use defaults
const INPUT_ROOT = process.argv[2] || path.join(__dirname, '..', 'out', 'blogs');
const OUTPUT_ROOT = process.argv[3] || INPUT_ROOT;

// Config: folders to exclude (case-insensitive)
const config = {
  excludeFolders: ['images', '.git', 'node_modules'],
  acceptExtensions: ['.md', '.json', '.txt', '.html'],
  excludeFiles: ['info.json']
};

function formatDate(ts) {
  const date = new Date(ts);
  const months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function formatDateTime(ts) {
  const date = new Date(ts);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

// Parse meta from markdown comment at the top of the file
function parseMarkdownMeta(absEntryPath) {
  try {
    const content = fs.readFileSync(absEntryPath, 'utf-8');
    const metaMatch = content.match(/<!--([\s\S]*?)-->/);
    if (!metaMatch) return {};
    const metaBlock = metaMatch[1];
    const meta = {};
    let buffer = '';
    let inArray = false;
    let arrayKey = '';
    metaBlock.split('\n').forEach(line => {
      if (inArray) {
        buffer += '\n' + line;
        if (line.trim().endsWith(']')) {
          try {
            meta[arrayKey] = JSON5.parse(buffer);
          } catch {
            meta[arrayKey] = [];
          }
          inArray = false;
          buffer = '';
          arrayKey = '';
        }
        return;
      }
      const m = line.match(/^\s*([a-zA-Z]+)\s*:\s*(.+)$/);
      if (m) {
        let key = m[1].trim();
        let value = m[2].trim().replace(/,$/, '');
        // If value starts with [ and doesn't end with ], it's a multi-line array
        if ((key === 'tags' || key === 'references') && value.startsWith('[') && !value.endsWith(']')) {
          inArray = true;
          arrayKey = key;
          buffer = value;
          return;
        }
        // Parse arrays/objects for tags and references
        if ((key === 'tags' || key === 'references') && value.startsWith('[')) {
          try {
            meta[key] = JSON5.parse(value);
          } catch {
            meta[key] = [];
          }
        } else if (value.startsWith('"') && value.endsWith('"')) {
          // Remove quotes for string values
          meta[key] = value.slice(1, -1);
        } else {
          meta[key] = value;
        }
      }
    });
    return meta;
  } catch {
    return {};
  }
}

function buildTree(dir, relPath = '') {
  const absDir = path.join(dir, relPath);
  const entries = fs.readdirSync(absDir, { withFileTypes: true });

  // Read info.json if present and spread its fields
  let info = {};
  const infoPath = path.join(absDir, 'info.json');
  if (fs.existsSync(infoPath)) {
    try {
      info = JSON5.parse(fs.readFileSync(infoPath, 'utf-8'));
      // here id attribute for for finding the folder in the tree
      info.id =  info.title.trim().replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    } catch (e) {
      console.warn(`Warning: Could not parse info.json in ${absDir}: ${e.message}`);
      info = {};
    }
  }

  const children = entries
    .filter(entry => {
      if (entry.isDirectory() && config.excludeFolders.some(f => f.toLowerCase() === entry.name.toLowerCase())) {
        return false;
      }
      if (entry.isFile() && config.excludeFiles.some(f => f.toLowerCase() === entry.name.toLowerCase())) {
        return false;
      }
      if (entry.isFile() && Array.isArray(config.acceptExtensions)) {
        const ext = path.extname(entry.name).toLowerCase();
        return config.acceptExtensions.includes(ext);
      }
      return true;
    })
    .map(entry => {
      const entryRelPath = relPath ? path.join(relPath, entry.name) : entry.name;
      const absEntryPath = path.join(dir, entryRelPath);
      const stats = fs.statSync(absEntryPath);
      if (entry.isDirectory()) {
        // Pass the full relative path down
        return buildTree(dir, entryRelPath);
      } else {
        let meta = {};
        if (entry.name.endsWith('.md')) {
          meta = parseMarkdownMeta(absEntryPath);
        }
        return {
          id: entry.name.trim().replace(/[^a-zA-Z0-9]/g, '-').toLowerCase(),
          label: entry.name,
          type: 'file',
          path: path.join('blogs', entryRelPath).replace(/\\/g, '/'),
          date: formatDate(stats.birthtime),
          createdOn: formatDateTime(stats.birthtime),
          ...meta
        };
      }
    });

  // Spread info.json fields directly onto the directory node
  return {
    label: relPath ? path.basename(absDir) : 'blogs',
    type: 'directory',
    ...info,
    children
  };
}

// Generate index.json for a specific folder
function generateIndexJsonForFolder(folderAbsPath, relPathFromBlogs = '') {
  const outPath = path.join(folderAbsPath, appConstants.BLOGS_INDEX_FILE_NAME);
  if (fs.existsSync(outPath)) {
    fs.unlinkSync(outPath);
  }
  // Always build from INPUT_ROOT, passing the full relPathFromBlogs
  const tree = buildTree(INPUT_ROOT, relPathFromBlogs);
  fs.writeFileSync(outPath, JSON.stringify(tree, null, 2), 'utf-8');
  console.log(`Generated: ${outPath}`);
  validateIndexJson(outPath);
}

// Validation function for index.json
function validateIndexJson(indexPath) {
  try {
    const data = fs.readFileSync(indexPath, 'utf-8');
    const json = JSON.parse(data);

    function validateNode(node, pathArr = []) {
      if (!node.label || !node.type) {
        throw new Error(`Missing label/type at ${pathArr.join('/')}`);
      }
      if (node.type === 'file') {
        if (!node.path) throw new Error(`Missing path for file ${node.label}`);
        if (!node.date) throw new Error(`Missing date for file ${node.label}`);
        if (!node.createdOn) throw new Error(`Missing createdOn for file ${node.label}`);
      }
      if (Array.isArray(node.children)) {
        node.children.forEach(child => validateNode(child, [...pathArr, node.label]));
      }
    }

    validateNode(json);
    console.log(`✅ Validation passed for ${indexPath}`);
  } catch (e) {
    console.error(`❌ Validation failed for ${indexPath}: ${e.message}`);
    process.exit(1);
  }
}

function main() {
  if (!fs.existsSync(INPUT_ROOT)) {
    console.error('No input directory found:', INPUT_ROOT);
    process.exit(1);
  }

  // Generate index.json for the root blogs folder
  // generateIndexJsonForFolder(INPUT_ROOT, '');

  // Generate index.json for every immediate subfolder in blogs (except excluded)
  fs.readdirSync(INPUT_ROOT, { withFileTypes: true }).forEach(dirent => {
    if (
      dirent.isDirectory() &&
      !config.excludeFolders.some(f => f.toLowerCase() === dirent.name.toLowerCase())
    ) {
      const subfolderAbsPath = path.join(INPUT_ROOT, dirent.name);
      generateIndexJsonForFolder(subfolderAbsPath, dirent.name);
    }
  });
}

main();