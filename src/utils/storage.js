// Token storage key
const TOKEN_KEY = 'club_token';
const USER_ID_KEY = 'club_user_id';

// Save JWT token to localStorage
export const saveToken = (token) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

// Get JWT token from localStorage
export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

// Delete JWT token from localStorage
export const deleteToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
};

// Save user ID to localStorage
export const saveUserId = (userId) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_ID_KEY, userId);
  }
};

// Get user ID from localStorage
export const getUserId = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(USER_ID_KEY);
  }
  return null;
};

// Delete user ID from localStorage
export const deleteUserId = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_ID_KEY);
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getToken();
};

// Clear all auth data
export const clearAuthData = () => {
  deleteToken();
  deleteUserId();
}; 