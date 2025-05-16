// Auth service for token management

/**
 * Get the auth token from localStorage
 * @returns {string|null} The authentication token or null if not found
 */
export const getAuthToken = () => {
  return localStorage.getItem("token");
};

/**
 * Store the auth token in localStorage
 * @param {string} token - The authentication token to store
 */
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem("token", token);
  }
};

/**
 * Clear the auth token from localStorage
 */
export const clearAuthToken = () => {
  localStorage.removeItem("token");
};

/**
 * Check if the user is authenticated
 * @returns {boolean} True if user has a valid token
 */
export const isAuthenticated = () => {
  const token = getAuthToken();
  return !!token;
};
