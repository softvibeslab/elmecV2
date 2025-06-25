import React, { ReactNode } from 'react';
import { FirebaseAuthProvider } from '@/contexts/FirebaseAuthContext';
import { FirebaseNotificationProvider } from '@/contexts/FirebaseNotificationContext';
import { FirebaseChatProvider } from '@/contexts/FirebaseChatContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { NotificationManager } from '@/components/NotificationToast';

interface ContextProvidersProps {
  children: ReactNode;
}

export const ContextProviders: React.FC<ContextProvidersProps> = ({ children }) => {
  return (
    <FirebaseAuthProvider>
      <NotificationProvider>
        <FirebaseNotificationProvider>
          <FirebaseChatProvider>
            {children}
            <NotificationManager />
          </FirebaseChatProvider>
        </FirebaseNotificationProvider>
      </NotificationProvider>
    </FirebaseAuthProvider>
  );
};