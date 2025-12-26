/**
 * User Storage Helper
 * Utility functions to manage user information in localStorage
 */

/**
 * Get user information from localStorage
 * @returns {Object|null} User object or null if not found
 */
export const getIDPUser = () => {
  try {
    const userStr = localStorage.getItem("IDPUser");
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error("Error parsing IDPUser from localStorage:", error);
    return null;
  }
};

/**
 * Get specific user property from localStorage
 * @param {string} property - Property name to retrieve
 * @returns {any} Property value or null if not found
 */
export const getUserProperty = (property) => {
  const user = getIDPUser();
  return user ? user[property] : null;
};

/**
 * Get user's full name from localStorage
 * @returns {string} Full name or empty string if not found
 */
export const getUserFullName = () => {
  const user = getIDPUser();
  if (user && user.name && user.surname) {
    return `${user.name} ${user.surname}`.trim();
  }
  return "";
};

/**
 * Get preferred audit display name (Full Name fallback to username, else "system")
 * @returns {string}
 */
export const getAuditName = () => {
  const user = getIDPUser();
  const full = (user && user.name && user.surname) ? `${user.name} ${user.surname}`.trim() : "";
  if (full) return full;
  if (user && user.username) return user.username;
  return "system";
};

/**
 * Get user's center ID from localStorage
 * @deprecated center_id has been removed from the system
 * @returns {null} Always returns null
 */
export const getUserCenterId = () => {
  return null;
};

/**
 * Get user's user type from localStorage
 * @returns {number|null} User type or null if not found
 */
export const getUserType = () => {
  return getUserProperty("user_type");
};

/**
 * Get user's username from localStorage
 * @returns {string|null} Username or null if not found
 */
export const getUsername = () => {
  return getUserProperty("username");
};

/**
 * Check if user is logged in (has IDPUser in localStorage)
 * @returns {boolean} True if user is logged in
 */
export const isUserLoggedIn = () => {
  return getIDPUser() !== null;
};

/**
 * Clear user information from localStorage
 */
export const clearUserStorage = () => {
  localStorage.removeItem("IDPUser");
};
