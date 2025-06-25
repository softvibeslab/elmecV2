import React, { useEffect, ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { useAnalytics } from '../hooks/useAnalytics';
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext';

interface AnalyticsProviderProps {
  children: ReactNode;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  const router = useRouter();
  const { trackScreenView, setUserProperties } = useAnalytics();
  const { userProfile } = useFirebaseAuth();

  // Track screen views
  useEffect(() => {
    // This would ideally be implemented with a navigation listener
    // For now, we'll track based on route changes
    const currentRoute = router.pathname || '/';
    trackScreenView(currentRoute);
  }, [router.pathname]);

  // Set user properties when user profile changes
  useEffect(() => {
    if (userProfile) {
      setUserProperties({
        user_id: userProfile.id,
        user_role: userProfile.rol,
        company: userProfile.empresa,
        location: `${userProfile.ciudad}, ${userProfile.estado}`,
        signup_date: userProfile.createdAt
      });
    }
  }, [userProfile]);

  return <>{children}</>;
};