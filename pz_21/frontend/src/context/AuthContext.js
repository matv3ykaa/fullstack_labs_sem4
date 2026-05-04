import { createContext, useContext, useState, useEffect } from 'react';
import { auth, setAuthenticated } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      auth.me()
        .then((res) => {
          setUser(res.data);
          setAuthenticated(true); // восстановили сессию при старте — теперь следим
        })
        .catch(() => {
          localStorage.removeItem('accessToken');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await auth.login({ email, password });
    localStorage.setItem('accessToken', res.data.accessToken);
    const me = await auth.me();
    setUser(me.data);
    setAuthenticated(true);
  };

  const register = async (email, first_name, last_name, password) => {
    await auth.register({ email, first_name, last_name, password });
    await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}