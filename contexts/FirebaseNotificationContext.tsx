import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import FirebaseService from '../services/firebaseService';
import { useFirebaseAuth } from './FirebaseAuthContext';
import { Notification } from '../types/firebase';
import { messaging } from '../config/firebase';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  requestPermission: () => Promise<boolean>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotifications: () => Promise<void>;
  subscribeToNotifications: () => () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useFirebaseNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useFirebaseNotifications must be used within NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const FirebaseNotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { currentUser } = useFirebaseAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [notificationSubscription, setNotificationSubscription] = useState<(() => void) | null>(null);
  const mounted = useRef(true);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (currentUser && mounted.current) {
      try {
        requestPermission().catch(console.error);
        unsubscribe = subscribeToNotifications();
      } catch (error) {
        console.error('Error setting up notifications:', error);
      }
    } else if (!currentUser && mounted.current) {
      // Clean up subscription when user logs out
      if (notificationSubscription) {
        notificationSubscription();
        setNotificationSubscription(null);
      }
      setNotifications([]);
    }

    return () => {
      mounted.current = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentUser]);

  const requestPermission = async (): Promise<boolean> => {
    if (!mounted.current) return false;
    
    try {
      if (Platform.OS === 'web') {
        // Web push notifications
        if (messaging) {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            try {
              const token = await getToken(messaging, {
                vapidKey: process.env.EXPO_PUBLIC_FIREBASE_VAPID_KEY
              });
              
              if (token && currentUser && mounted.current) {
                await FirebaseService.updateFCMToken(currentUser.uid, token);
              }

              // Listen for foreground messages
              onMessage(messaging, (payload) => {
                if (!mounted.current) return;
                console.log('Foreground message received:', payload);
                // Handle foreground notifications
                if (payload.notification) {
                  new Notification(payload.notification.title || 'Nueva notificación', {
                    body: payload.notification.body,
                    icon: '/assets/images/icon.png'
                  });
                }
              });

              return true;
            } catch (tokenError) {
              console.error('Error getting FCM token:', tokenError);
              return false;
            }
          }
        }
        
        // Fallback to browser notifications
        if ('Notification' in window) {
          const permission = await Notification.requestPermission();
          return permission === 'granted';
        }
        
        return false;
      } else {
        // Mobile push notifications
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus === 'granted' && currentUser && mounted.current) {
          try {
            const token = (await Notifications.getExpoPushTokenAsync()).data;
            await FirebaseService.updateFCMToken(currentUser.uid, token);
          } catch (tokenError) {
            console.error('Error getting Expo push token:', tokenError);
          }
          return true;
        }

        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const subscribeToNotifications = (): (() => void) => {
    if (!mounted.current || !currentUser) {
      return () => {};
    }

    try {
      const unsubscribe = FirebaseService.subscribeToNotifications(currentUser.uid, (newNotifications) => {
        if (!mounted.current) return;
        
        setNotifications(newNotifications);
        
        // Show notifications that haven't been sent yet
        newNotifications.forEach(async (notification) => {
          if (!notification.sent && Platform.OS !== 'web' && mounted.current) {
            try {
              await Notifications.scheduleNotificationAsync({
                content: {
                  title: notification.title,
                  body: notification.body,
                  data: notification.data || {}
                },
                trigger: null // Send immediately
              });
            } catch (error) {
              console.error('Error scheduling notification:', error);
            }
          }
        });
      });

      if (mounted.current) {
        setNotificationSubscription(() => unsubscribe);
      }
      return unsubscribe;
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      return () => {};
    }
  };

  const markAsRead = async (notificationId: string): Promise<void> => {
    if (!mounted.current) return;
    
    try {
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true, readAt: new Date().toISOString() }
            : notification
        )
      );

      // Track notification interaction
      const notification = notifications.find(n => n.id === notificationId);
      if (notification) {
        FirebaseService.trackEvent('notification_read', {
          notificationId,
          notificationType: notification.type
        }).catch(console.error);
      }

    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async (): Promise<void> => {
    if (!mounted.current) return;
    
    try {
      const timestamp = new Date().toISOString();
      setNotifications(prev =>
        prev.map(notification => ({
          ...notification,
          read: true,
          readAt: timestamp
        }))
      );

      // Track bulk read action
      FirebaseService.trackEvent('notifications_mark_all_read', {
        count: unreadCount
      }).catch(console.error);

    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const clearNotifications = async (): Promise<void> => {
    if (!mounted.current) return;
    
    try {
      setNotifications([]);
      
      // Track clear action
      FirebaseService.trackEvent('notifications_cleared', {
        count: notifications.length
      }).catch(console.error);

    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    requestPermission,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    subscribeToNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};