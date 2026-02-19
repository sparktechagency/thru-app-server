"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSetEqual = exports.activitySearchableFields = exports.activityFilterables = void 0;
// Filterable fields for Activity
exports.activityFilterables = ['title', 'description', 'address'];
// Searchable fields for Activity
exports.activitySearchableFields = ['title', 'description', 'address'];
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
