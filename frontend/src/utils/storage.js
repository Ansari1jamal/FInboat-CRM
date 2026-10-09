const TOKEN_KEY = "accessToken";
const USER_KEY = "currentUser";

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);

export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

export const getUser = () => {
  const value = localStorage.getItem(USER_KEY);

  try {
    return value ? JSON.parse(value) : null;
  } catch {
    removeUser();
    return null;
  }
};

export const setUser = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const removeUser = () => localStorage.removeItem(USER_KEY);

export const clearAuth = () => {
  removeToken();
  removeUser();
};
