import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

const TOKEN_KEY = "accessToken";
const USER_KEY = "currentUser";

const getStoredUser = () => {
  try {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));

  const loginUser = ({ token, user }) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    setToken(token);
    setUser(user);
  };

  const logoutUser = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      loginUser,
      logoutUser,
    }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};

export { AuthContext };

