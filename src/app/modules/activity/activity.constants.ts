// Filterable fields for Activity
export const activityFilterables = ['title', 'description', 'address'];

// Searchable fields for Activity
export const activitySearchableFields = ['title', 'description', 'address'];

// Helper function for set comparison
export const isSetEqual = (setA: Set<string>, setB: Set<string>): boolean => {
  if (setA.size !== setB.size) return false;
  for (const item of setA) {
    if (!setB.has(item)) return false;
  }
  return true;
};