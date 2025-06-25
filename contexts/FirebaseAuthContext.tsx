import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../config/firebase';
import FirebaseService from '../services/firebaseService';
import { User } from '../types/firebase';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useFirebaseAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useFirebaseAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const FirebaseAuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!mounted.current) return;
      
      setCurrentUser(user);
      
      if (user) {
        // Get user profile from Firestore
        const profile = await FirebaseService.getUserInfo(user.uid);
        if (mounted.current) {
          setUserProfile(profile);
        }
        
        // Track login event
        await FirebaseService.trackEvent('user_login', {
          userId: user.uid,
          method: 'email'
        });
      } else {
        if (mounted.current) {
          setUserProfile(null);
        }
      }
      
      if (mounted.current) {
        setLoading(false);
      }
    });

    return () => {
      mounted.current = false;
      unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    if (!mounted.current) return Promise.reject(new Error('Component unmounted'));
    setLoading(true);
    try {
      const user = await FirebaseService.loginUser(email, password);
      if (mounted.current) {
        setUserProfile(user);
      }
      return user;
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  };

  const register = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
    if (!mounted.current) return Promise.reject(new Error('Component unmounted'));
    setLoading(true);
    try {
      const user = await FirebaseService.registerUser(userData);
      if (mounted.current) {
        setUserProfile(user);
      }
      
      // Track registration event
      await FirebaseService.trackEvent('user_register', {
        userId: user.id,
        role: user.rol,
        company: user.empresa
      });
      
      return user;
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  };

  const logout = async (): Promise<void> => {
    if (!mounted.current) return;
    setLoading(true);
    try {
      if (currentUser) {
        // Track logout event
        await FirebaseService.trackEvent('user_logout', {
          userId: currentUser.uid
        });
      }
      
      await FirebaseService.logoutUser();
      if (mounted.current) {
        setUserProfile(null);
      }
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<void> => {
    if (!mounted.current || !currentUser || !userProfile) return;
    
    await FirebaseService.updateUser(currentUser.uid, updates);
    if (mounted.current) {
      setUserProfile({ ...userProfile, ...updates });
    }
  };

  const value: AuthContextType = {
    currentUser,
    userProfile,
    isAuthenticated: !!currentUser,
    loading,
    login,
    register,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};