"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
async function removeFile(filenames) {
    if (!filenames || (Array.isArray(filenames) && filenames.length === 0))
        return;
    // Normalize to array for consistent handling
    const files = Array.isArray(filenames) ? filenames : [filenames];
    for (const filename of files) {
        if (!filename)
            continue;
        // Remove leading '/images/' if included
        const cleanedName = filename.replace(/^\/?images\//, '');
        const filePath = path_1.default.join(process.cwd(), 'uploads', 'images', cleanedName);
        try {
            await promises_1.default.unlink(filePath);
            console.log(`Deleted image: ${cleanedName}`);
        }
        catch (err) {
            if (err.code === 'ENOENT') {
                console.warn(`File not found: ${cleanedName}`);
            }
            else {
                console.error(`Error deleting file ${cleanedName}:`, err);
            }
        }
    }
}
exports.default = removeFile;
