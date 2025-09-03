import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  rol: 'customer' | 'agent' | 'admin';
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
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

// Hardcoded users for demo
const DEMO_USERS: (User & { password: string })[] = [
  {
    id: '1',
    empresa: 'ELMEC',
    nombre: 'Juan',
    apellidoPaterno: 'Pérez',
    apellidoMaterno: 'González',
    correoElectronico: 'test@elmec.com',
    celular: '+52 123 456 7890',
    ciudad: 'México',
    estado: 'CDMX',
    rol: 'customer',
    password: 'password'
  },
  {
    id: '2',
    empresa: 'ELMEC',
    nombre: 'María',
    apellidoPaterno: 'García',
    apellidoMaterno: 'López',
    correoElectronico: 'maria@elmec.com',
    celular: '+52 123 456 7891',
    ciudad: 'Guadalajara',
    estado: 'Jalisco',
    rol: 'agent',
    password: 'agent123'
  },
  {
    id: '3',
    empresa: 'ELMEC',
    nombre: 'Carlos',
    apellidoPaterno: 'Mendoza',
    apellidoMaterno: 'Silva',
    correoElectronico: 'admin@elmec.com',
    celular: '+52 123 456 7892',
    ciudad: 'Monterrey',
    estado: 'Nuevo León',
    rol: 'admin',
    password: 'admin123'
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user with matching credentials
      const foundUser = DEMO_USERS.find(
        u => u.correoElectronico === email && u.password === password
      );

      if (foundUser) {
        const { password: _, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        setIsAuthenticated(true);
        
        // Store user in AsyncStorage
        await AsyncStorage.setItem('user', JSON.stringify(userWithoutPassword));
        
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: Omit<User, 'id'> & { password: string }): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user already exists
      const existingUser = DEMO_USERS.find(u => u.correoElectronico === userData.correoElectronico);
      if (existingUser) {
        return false; // User already exists
      }

      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        ...userData
      };

      setUser(newUser);
      setIsAuthenticated(true);
      
      // Store user in AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};