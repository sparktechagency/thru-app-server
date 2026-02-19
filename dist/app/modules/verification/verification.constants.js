"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSetEqual = exports.verificationSearchableFields = exports.verificationFilterables = void 0;
// Filterable fields for Verification
exports.verificationFilterables = ['type', 'otpHash'];
// Searchable fields for Verification
exports.verificationSearchableFields = ['otpHash'];
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
