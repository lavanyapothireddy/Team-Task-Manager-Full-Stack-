import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('taskflow_token');
    if (token) {
      api.getMe()
        .then(({ user }) => setUser(user))
        .catch(() => localStorage.removeItem('taskflow_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const { user, token } = await api.login({ email, password });
    localStorage.setItem('taskflow_token', token);
    setUser(user);
    return user;
  };

  const signup = async (name, email, password) => {
    const { user, token } = await api.signup({ name, email, password });
    localStorage.setItem('taskflow_token', token);
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('taskflow_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
