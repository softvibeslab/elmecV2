import React, { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ChatProvider } from '@/contexts/ChatContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { NotificationManager } from '@/components/NotificationToast';

interface ContextProvidersProps {
  children: ReactNode;
}

export const ContextProviders: React.FC<ContextProvidersProps> = ({ children }) => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ChatProvider>
          {children}
          <NotificationManager />
        </ChatProvider>
      </NotificationProvider>
    </AuthProvider>
  );
};