"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSetEqual = exports.friendSearchableFields = exports.friendFilterables = void 0;
// Filterable fields for Friend
exports.friendFilterables = [];
// Searchable fields for Friend
exports.friendSearchableFields = [];
// Helper function for set comparison
const isSetEqual = (setA, setB) => {
    if (setA.size !== setB.size)
        return false;
    for (const item of setA) {
        if (!setB.has(item))
            return false;
    }
    return true;
};
exports.isSetEqual = isSetEqual;
