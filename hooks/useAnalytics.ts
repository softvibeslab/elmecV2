import { useCallback } from 'react';
import { getAnalytics, logEvent } from 'firebase/analytics';
import FirebaseService from '../services/firebaseService';
import { analytics } from '../config/firebase';
import { Platform } from 'react-native';

interface AnalyticsHook {
  trackEvent: (event: string, properties?: any) => Promise<void>;
  trackScreenView: (screenName: string, properties?: any) => Promise<void>;
  trackUserAction: (action: string, category: string, properties?: any) => Promise<void>;
  trackTiming: (category: string, variable: string, value: number, label?: string) => Promise<void>;
  setUserProperties: (properties: any) => Promise<void>;
}

export const useAnalytics = (): AnalyticsHook => {
  const trackEvent = useCallback(async (event: string, properties: any = {}) => {
    try {
      // Track in Firebase Analytics (web only)
      if (Platform.OS === 'web' && analytics) {
        logEvent(analytics, event, properties);
      }

      // Track in custom analytics system (all platforms)
      await FirebaseService.trackEvent(event, properties);
      
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }, []);

  const trackScreenView = useCallback(async (screenName: string, properties: any = {}) => {
    await trackEvent('screen_view', {
      screen_name: screenName,
      ...properties
    });
  }, [trackEvent]);

  const trackUserAction = useCallback(async (action: string, category: string, properties: any = {}) => {
    await trackEvent('user_action', {
      action,
      category,
      ...properties
    });
  }, [trackEvent]);

  const trackTiming = useCallback(async (category: string, variable: string, value: number, label?: string) => {
    await trackEvent('timing', {
      category,
      variable,
      value,
      label
    });
  }, [trackEvent]);

  const setUserProperties = useCallback(async (properties: any) => {
    try {
      // Set user properties in Firebase Analytics (web only)
      if (Platform.OS === 'web' && analytics) {
        // Firebase Analytics doesn't have a direct setUserProperties method
        // We'll track it as a special event
        logEvent(analytics, 'user_properties_updated', properties);
      }

      // Track in custom system
      await trackEvent('user_properties_updated', properties);
      
    } catch (error) {
      console.error('Error setting user properties:', error);
    }
  }, [trackEvent]);

  return {
    trackEvent,
    trackScreenView,
    trackUserAction,
    trackTiming,
    setUserProperties
  };
};