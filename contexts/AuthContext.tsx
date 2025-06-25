import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  empresa: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  correoElectronico: string;
  celular: string;
  ciudad: string;
  estado: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id'> & { password: string }) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        if (email === 'test@elmec.com' && password === 'password') {
          setIsAuthenticated(true);
          setUser({
            id: '1',
            empresa: 'ELMEC',
            nombre: 'Juan',
            apellidoPaterno: 'Pérez',
            apellidoMaterno: 'González',
            correoElectronico: email,
            celular: '+52 123 456 7890',
            ciudad: 'México',
            estado: 'CDMX'
          });
          resolve(true);
        } else {
          resolve(false);
        }
      }, 1000);
    });
  };

  const register = async (userData: Omit<User, 'id'> & { password: string }): Promise<boolean> => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const newUser: User = {
          id: Date.now().toString(),
          ...userData
        };
        setIsAuthenticated(true);
        setUser(newUser);
        resolve(true);
      }, 1000);
    });
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};