"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSetEqual = exports.requestSearchableFields = exports.requestFilterables = void 0;
// Filterable fields for Request
exports.requestFilterables = ['status'];
// Searchable fields for Request
exports.requestSearchableFields = [];
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
