import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior for mobile
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface InAppNotification {
  id: string;
  title: string;
  body: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  data?: any;
  read: boolean;
}

interface NotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  inAppNotifications: InAppNotification[];
  unreadCount: number;
  sendDemoNotification: (title: string, body: string, type?: InAppNotification['type'], data?: any) => Promise<void>;
  sendLocalNotification: (title: string, body: string, data?: any) => Promise<void>;
  markNotificationAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  registerForPushNotifications: () => Promise<string | null>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

const sendWebNotification = (title: string, body: string) => {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/assets/images/icon.png',
      badge: '/assets/images/icon.png',
    });
  }
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [inAppNotifications, setInAppNotifications] = useState<InAppNotification[]>([]);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  const unreadCount = inAppNotifications.filter(n => !n.read).length;

  useEffect(() => {
    // Only run notification setup on mobile platforms
    if (Platform.OS !== 'web') {
      registerForPushNotifications().then(token => setExpoPushToken(token));

      // Listen for incoming notifications
      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        setNotification(notification);
      });

      // Listen for notification responses (when user taps notification)
      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('Notification response:', response);
      });
    } else {
      // Request web notification permissions
      requestWebNotificationPermission();
    }

    return () => {
      if (Platform.OS !== 'web') {
        if (notificationListener.current) {
          Notifications.removeNotificationSubscription(notificationListener.current);
        }
        if (responseListener.current) {
          Notifications.removeNotificationSubscription(responseListener.current);
        }
      }
    };
  }, []);

  const requestWebNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    }
  };

  const registerForPushNotifications = async (): Promise<string | null> => {
    if (Platform.OS === 'web') {
      console.log('Push notifications are not supported on web');
      return null;
    }

    let token;
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }

    try {
      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Expo push token:', token);
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return token;
  };

  const sendDemoNotification = useCallback(async (
    title: string, 
    body: string, 
    type: InAppNotification['type'] = 'info', 
    data?: any
  ) => {
    const newNotification: InAppNotification = {
      id: Date.now().toString(),
      title,
      body,
      type,
      timestamp: new Date().toISOString(),
      data,
      read: false,
    };

    setInAppNotifications(prev => [newNotification, ...prev]);

    // Also send web notification if on web platform
    if (Platform.OS === 'web') {
      sendWebNotification(title, body);
    } else {
      // Send native notification on mobile
      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            data,
            sound: true,
          },
          trigger: null, // Send immediately
        });
      } catch (error) {
        console.log('Error sending native notification:', error);
      }
    }
  }, []);

  const sendLocalNotification = async (title: string, body: string, data?: any) => {
    // For demo purposes, always create an in-app notification
    await sendDemoNotification(title, body, 'info', data);
  };

  const markNotificationAsRead = (id: string) => {
    setInAppNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setInAppNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const clearNotifications = () => {
    setInAppNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        expoPushToken,
        notification,
        inAppNotifications,
        unreadCount,
        sendDemoNotification,
        sendLocalNotification,
        markNotificationAsRead,
        markAllAsRead,
        clearNotifications,
        registerForPushNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};