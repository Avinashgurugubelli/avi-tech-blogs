const fs = require('fs');
const path = require('path');
const JSON5 = require('json5');
const { log,logLevels } = require('./logger');

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
  } catch (e) {
    log('warn', `Failed to parse markdown meta for ${absEntryPath}: ${e.message}`);
    return {};
  }
}

function buildTree(dir, relPath = '') {
  const absDir = path.join(dir, relPath);
  log(logLevels.info, `Reading directory: ${absDir}`);
  const entries = fs.readdirSync(absDir, { withFileTypes: true });

  // Read info.json if present and spread its fields
  let info = {};
  const infoPath = path.join(absDir, 'info.json');
  if (fs.existsSync(infoPath)) {
    try {
      log(logLevels.info, `Reading info.json: ${infoPath}`);
      info = JSON5.parse(fs.readFileSync(infoPath, 'utf-8'));
      info.id = info.title && typeof info.title === 'string'
        ? info.title.trim().replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()
        : undefined;
    } catch (e) {
      log(logLevels.error, `Could not parse info.json in ${absDir}: ${e.message}`);
      info = {};
    }
  }
  else{
    log(logLevels.warn, `Info file not found in the path: ${infoPath}`);
  }

  const children = entries
    .filter(entry => {
      if (entry.isDirectory() && config.excludeFolders.some(f => f.toLowerCase() === entry.name.toLowerCase())) {
        log(logLevels.info, `Skipping excluded folder: ${entry.name}`);
        return false;
      }
      if (entry.isFile() && config.excludeFiles.some(f => f.toLowerCase() === entry.name.toLowerCase())) {
        log(logLevels.info, `Skipping excluded file: ${entry.name}`);
        return false;
      }
      if (entry.isFile() && Array.isArray(config.acceptExtensions)) {
        const ext = path.extname(entry.name).toLowerCase();
        const accepted = config.acceptExtensions.includes(ext);
        if (!accepted) {
          log(logLevels.info, `Skipping file (extension not accepted): ${entry.name}`);
        }
        return accepted;
      }
      return true;
    })
    .map(entry => {
      const entryRelPath = relPath ? path.join(relPath, entry.name) : entry.name;
      const absEntryPath = path.join(dir, entryRelPath);
      const stats = fs.statSync(absEntryPath);
      if (entry.isDirectory()) {
        log(logLevels.info, `Entering subdirectory: ${entryRelPath}`);
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

  return {
    label: relPath ? path.basename(absDir) : 'blogs',
    type: 'directory',
    ...info,
    children
  };
}

function generateIndexJsonForFolder(folderAbsPath, relPathFromBlogs = '') {
  const outPath = path.join(folderAbsPath, appConstants.BLOGS_INDEX_FILE_NAME);
  if (fs.existsSync(outPath)) {
    fs.unlinkSync(outPath);
    log(logLevels.info, `Removed existing index: ${outPath}`);
  }
  log(logLevels.info, `Generating index for: ${folderAbsPath} (rel: ${relPathFromBlogs})`);
  const tree = buildTree(INPUT_ROOT, relPathFromBlogs);
  fs.writeFileSync(outPath, JSON.stringify(tree, null, 2), 'utf-8');
  log('success', `Generated: ${outPath}`);
  validateIndexJson(outPath);
}

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
    log('success', `Validation passed for ${indexPath}`);
  } catch (e) {
    log(logLevels.error, `Validation failed for ${indexPath}: ${e.message}`);
    process.exit(1);
  }
}

function main() {
  log(logLevels.info, `Starting blog index generation`);
  if (!fs.existsSync(INPUT_ROOT)) {
    log(logLevels.error, 'No input directory found:', INPUT_ROOT);
    process.exit(1);
  }

  fs.readdirSync(INPUT_ROOT, { withFileTypes: true }).forEach(dirent => {
    if (
      dirent.isDirectory() &&
      !config.excludeFolders.some(f => f.toLowerCase() === dirent.name.toLowerCase())
    ) {
      const subfolderAbsPath = path.join(INPUT_ROOT, dirent.name);
      generateIndexJsonForFolder(subfolderAbsPath, dirent.name);
    }
  });
  log(logLevels.success, ` ******************* Blog index generation completed ******************`);
}

log(logLevels.info,`>>>>>> Started generating blogs index file >>>> `);
main();