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
  const keys = Object.keys(fields);
  const values = Object.values(fields);
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

module.exports = {
  buildInsertFragments,
  buildUpdateFragments,
  scopeQuery,
};

