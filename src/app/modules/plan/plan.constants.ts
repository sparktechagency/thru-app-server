// Filterable fields for Plan
export const planFilterables = ['title', 'description', 'location', 'address', 'link'];

// Searchable fields for Plan
export const planSearchableFields = ['title', 'description', 'location', 'address', 'link'];

// Helper function for set comparison
export const isSetEqual = (setA: Set<string>, setB: Set<string>): boolean => {
  if (setA.size !== setB.size) return false;
  for (const item of setA) {
    if (!setB.has(item)) return false;
  }
  return true;
};