import { unlinkSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const filePath = join(__dirname, '../public/venue-generated.json');

try {
  unlinkSync(filePath);
  console.log('✅ Deleted venue-generated.json');
} catch (error) {
  if (error.code === 'ENOENT') {
    console.log('ℹ️  venue-generated.json does not exist');
  } else {
    console.error('❌ Error deleting file:', error.message);
    process.exit(1);
  }
}

