import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (currentUser) {
      requestPermission();
      const unsubscribe = subscribeToNotifications();
      return unsubscribe;
    } else {
      // Clean up subscription when user logs out
      if (notificationSubscription) {
        notificationSubscription();
        setNotificationSubscription(null);
      }
      setNotifications([]);
    }
  }, [currentUser]);

  const requestPermission = async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'web') {
        // Web push notifications
        if (messaging) {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            const token = await getToken(messaging, {
              vapidKey: process.env.EXPO_PUBLIC_FIREBASE_VAPID_KEY
            });
            
            if (token && currentUser) {
              await FirebaseService.updateFCMToken(currentUser.uid, token);
            }

            // Listen for foreground messages
            onMessage(messaging, (payload) => {
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

        if (finalStatus === 'granted') {
          const token = (await Notifications.getExpoPushTokenAsync()).data;
          if (currentUser) {
            await FirebaseService.updateFCMToken(currentUser.uid, token);
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
    if (!currentUser) {
      return () => {};
    }

    const unsubscribe = FirebaseService.subscribeToNotifications(currentUser.uid, (newNotifications) => {
      setNotifications(newNotifications);
      
      // Show notifications that haven't been sent yet
      newNotifications.forEach(async (notification) => {
        if (!notification.sent && Platform.OS !== 'web') {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: notification.title,
              body: notification.body,
              data: notification.data || {}
            },
            trigger: null // Send immediately
          });
        }
      });
    });

    setNotificationSubscription(() => unsubscribe);
    return unsubscribe;
  };

  const markAsRead = async (notificationId: string): Promise<void> => {
    try {
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true, readAt: new Date().toISOString() }
            : notification
        )
      );

      // Track notification interaction
      await FirebaseService.trackEvent('notification_read', {
        notificationId,
        notificationType: notifications.find(n => n.id === notificationId)?.type
      });

    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async (): Promise<void> => {
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
      await FirebaseService.trackEvent('notifications_mark_all_read', {
        count: unreadCount
      });

    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const clearNotifications = async (): Promise<void> => {
    try {
      setNotifications([]);
      
      // Track clear action
      await FirebaseService.trackEvent('notifications_cleared', {
        count: notifications.length
      });

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