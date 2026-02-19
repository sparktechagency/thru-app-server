"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitEvent = exports.getSocketIO = exports.setSocketIO = exports.socketIO = void 0;
// Type-safe socket instance export
exports.socketIO = null;
const setSocketIO = (io) => {
    exports.socketIO = io;
};
exports.setSocketIO = setSocketIO;
const getSocketIO = () => {
    return exports.socketIO;
};
exports.getSocketIO = getSocketIO;
// Generic emit function
const emitEvent = (event, data, room) => {
    if (!exports.socketIO) {
        console.warn(`Socket.IO not initialized - Skipping event: ${event}`);
        return false;
    }
    try {
        if (room) {
            exports.socketIO.to(room).emit(event, data);
        }
        else {
            exports.socketIO.emit(event, data);
        }
        return true;
    }
    catch (error) {
        console.error(`Socket emit failed for event ${event}:`, error);
        return false;
    }
};
exports.emitEvent = emitEvent;
