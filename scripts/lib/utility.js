const crypto = require('crypto');
const CHECKSUM_FILE = path.join(process.cwd(), '.blog-checksum.json');

function calculateChecksum(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return crypto.createHash('sha256').update(content).digest('hex');
}

function loadChecksums() {
  if (fs.existsSync(CHECKSUM_FILE)) {
    return JSON.parse(fs.readFileSync(CHECKSUM_FILE, 'utf-8'));
  }
  return {};
}

function saveChecksums(checksumMap) {
  fs.writeFileSync(CHECKSUM_FILE, JSON.stringify(checksumMap, null, 2), 'utf-8');
}


module.exports = {
  calculateChecksum,
  loadChecksums,
  saveChecksums
};