"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDuration = formatDuration;
function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000) % 60;
    const minutes = Math.floor(ms / 1000 / 60) % 60;
    const hours = Math.floor(ms / 1000 / 60 / 60);
    return `${hours}h ${minutes}m ${seconds}s`;
}
