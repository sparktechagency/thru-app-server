const fs = require('fs').promises;
import path from 'path';

async function removeFile(filename: string) {
    if (!filename) return;

    // Remove leading '/images/' if included
    const cleanedName = filename.replace(/^\/?images\//, '');

    const filePath = path.join(process.cwd(), 'uploads', 'images', cleanedName);

    try {
        await fs.unlink(filePath);
        console.log(`Deleted image: ${cleanedName}`);
    } catch (err) {
        if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
            console.warn(`File not found: ${cleanedName}`);
        } else {
            console.error(`Error deleting file ${cleanedName}:`, err);
        }
    }
}

export default removeFile;
