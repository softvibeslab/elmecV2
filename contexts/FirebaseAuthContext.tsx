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
  const mounted = useRef(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    try {
      unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!mounted.current) return;
        
        try {
          setCurrentUser(user);
          
          if (user) {
            // Get user profile from Firestore
            const profile = await FirebaseService.getUserInfo(user.uid);
            if (mounted.current && profile) {
              setUserProfile(profile);
              
              // Track login event
              FirebaseService.trackEvent('user_login', {
                userId: user.uid,
                method: 'email'
              }).catch(console.error);
            }
          } else {
            if (mounted.current) {
              setUserProfile(null);
            }
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
        } finally {
          if (mounted.current) {
            setLoading(false);
          }
        }
      });
    } catch (error) {
      console.error('Error setting up auth listener:', error);
      if (mounted.current) {
        setLoading(false);
      }
    }

    return () => {
      mounted.current = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    if (!mounted.current) {
      throw new Error('Component unmounted');
    }
    
    setLoading(true);
    try {
      const user = await FirebaseService.loginUser(email, password);
      if (mounted.current) {
        setUserProfile(user);
      }
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  };

  const register = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
    if (!mounted.current) {
      throw new Error('Component unmounted');
    }
    
    setLoading(true);
    try {
      const user = await FirebaseService.registerUser(userData);
      if (mounted.current) {
        setUserProfile(user);
        
        // Track registration event
        FirebaseService.trackEvent('user_register', {
          userId: user.id,
          role: user.rol,
          company: user.empresa
        }).catch(console.error);
      }
      return user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
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
        FirebaseService.trackEvent('user_logout', {
          userId: currentUser.uid
        }).catch(console.error);
      }
      
      await FirebaseService.logoutUser();
      if (mounted.current) {
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<void> => {
    if (!mounted.current || !currentUser || !userProfile) return;
    
    try {
      await FirebaseService.updateUser(currentUser.uid, updates);
      if (mounted.current) {
        setUserProfile({ ...userProfile, ...updates });
      }
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
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