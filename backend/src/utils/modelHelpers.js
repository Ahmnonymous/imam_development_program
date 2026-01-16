const { applyCenterFilter } = require("./applyCenterFilter");

const wrapIdentifier = (key, quote = true) =>
  quote ? `"${key}"` : key;

const buildInsertFragments = (fields = {}, { quote = true } = {}) => {
  const keys = Object.keys(fields);
  const columns = keys.map((key) => wrapIdentifier(key, quote)).join(", ");
  const values = Object.values(fields);
  const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");
  return { columns, values, placeholders };
};

const buildUpdateFragments = (fields = {}, { quote = true } = {}) => {
  // Filter out undefined values only - keep null, empty strings, buffers, numbers, booleans
  const cleanedFields = {};
  const seenKeys = new Set();
  
  Object.keys(fields).forEach(key => {
    // Skip undefined values and prevent duplicates
    if (fields[key] !== undefined && !seenKeys.has(key)) {
      cleanedFields[key] = fields[key];
      seenKeys.add(key);
    }
  });
  
  const keys = Object.keys(cleanedFields);
  const values = Object.values(cleanedFields);
  
  // Ensure keys and values arrays have the same length
  if (keys.length !== values.length) {
    throw new Error(`Mismatch: ${keys.length} keys but ${values.length} values`);
  }
  
  const setClause = keys
    .map((key, index) => `${wrapIdentifier(key, quote)} = $${index + 1}`)
    .join(", ");
  return { setClause, values };
};

const scopeQuery = (
  query,
  { centerId, isSuperAdmin, column, alias, enforce } = {},
) => {
  // center_id has been removed - return query unchanged
  return applyCenterFilter(query, {}, { skip: true });
};

/**
 * Helper function for controllers to automatically trigger emails after create/update
 * Usage: afterCreate(tableName, data) or afterUpdate(tableName, data, oldData)
 * Note: Lazy require to avoid circular dependency (emailHook -> imamProfilesModel -> modelHelpers)
 */
function afterCreate(tableName, data) {
  if (data && data.id) {
    // Lazy require to avoid circular dependency
    const { triggerEmailHook } = require("./emailHook");
    triggerEmailHook(tableName, 'CREATE', data);
  }
}

function afterUpdate(tableName, data, oldData = null) {
  if (data && data.id) {
    // Lazy require to avoid circular dependency
    const { triggerEmailHook } = require("./emailHook");
    triggerEmailHook(tableName, 'UPDATE', data, oldData);
  }
}

module.exports = {
  buildInsertFragments,
  buildUpdateFragments,
  scopeQuery,
  afterCreate,
  afterUpdate,
};

