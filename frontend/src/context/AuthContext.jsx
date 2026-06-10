import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

function decodeEmail(token) {
  try {
    return JSON.parse(atob(token.split('.')[1])).sub || '';
  } catch {
    return '';
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => localStorage.getItem('medguard_token') || sessionStorage.getItem('medguard_token')
  );

  // remember=true → persist across sessions (localStorage)
  // remember=false → clear when browser closes (sessionStorage)
  const login = (newToken, remember = true) => {
    if (remember) {
      localStorage.setItem('medguard_token', newToken);
      sessionStorage.removeItem('medguard_token');
    } else {
      sessionStorage.setItem('medguard_token', newToken);
      localStorage.removeItem('medguard_token');
    }
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('medguard_token');
    sessionStorage.removeItem('medguard_token');
    setToken(null);
  };

  const isAuthenticated = Boolean(token);
  const userEmail = token ? decodeEmail(token) : '';

  return (
    <AuthContext.Provider value={{ token, login, logout, isAuthenticated, userEmail }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
