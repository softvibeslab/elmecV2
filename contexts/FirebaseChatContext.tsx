import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import FirebaseService from '../services/firebaseService';
import { useFirebaseAuth } from './FirebaseAuthContext';
import { ChatRoom, Message } from '../types/firebase';

interface ChatContextType {
  chatRooms: ChatRoom[];
  messages: { [chatRoomId: string]: Message[] };
  loading: boolean;
  createChatRoom: (participantId: string, tipo: string, requestId?: string) => Promise<ChatRoom>;
  sendMessage: (chatRoomId: string, message: string, type?: string) => Promise<void>;
  markMessagesAsRead: (chatRoomId: string) => Promise<void>;
  subscribeToChat: (chatRoomId: string) => () => void;
  getUnreadCount: () => number;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useFirebaseChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useFirebaseChat must be used within ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const FirebaseChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const { currentUser, userProfile } = useFirebaseAuth();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<{ [chatRoomId: string]: Message[] }>({});
  const [loading, setLoading] = useState(false);
  const [activeSubscriptions, setActiveSubscriptions] = useState<{ [chatRoomId: string]: () => void }>({});

  // Load user's chat rooms when authenticated
  useEffect(() => {
    if (currentUser && userProfile) {
      loadChatRooms();
    }
  }, [currentUser, userProfile]);

  const loadChatRooms = async () => {
    // In a real implementation, you would query for chat rooms where the user is a participant
    // For now, we'll use the existing mock data structure
    setLoading(false);
  };

  const createChatRoom = async (participantId: string, tipo: string, requestId?: string): Promise<ChatRoom> => {
    if (!currentUser || !userProfile) {
      throw new Error('User not authenticated');
    }

    try {
      const chatRoom = await FirebaseService.createChatRoom(
        [currentUser.uid, participantId],
        tipo,
        requestId
      );

      setChatRooms(prev => [chatRoom, ...prev]);
      
      // Track chat creation
      await FirebaseService.trackEvent('chat_created', {
        chatRoomId: chatRoom.id,
        participants: chatRoom.participants.length,
        type: tipo
      });

      return chatRoom;
    } catch (error) {
      console.error('Error creating chat room:', error);
      throw error;
    }
  };

  const sendMessage = async (chatRoomId: string, message: string, type: string = 'text'): Promise<void> => {
    if (!currentUser || !userProfile) {
      throw new Error('User not authenticated');
    }

    try {
      const messageData = await FirebaseService.sendMessage(
        chatRoomId,
        currentUser.uid,
        `${userProfile.nombre} ${userProfile.apellidoPaterno}`,
        message,
        type
      );

      // Track message sent
      await FirebaseService.trackEvent('message_sent', {
        chatRoomId,
        messageType: type,
        messageLength: message.length
      });

      // Update local messages state
      setMessages(prev => ({
        ...prev,
        [chatRoomId]: [...(prev[chatRoomId] || []), messageData]
      }));

    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const markMessagesAsRead = async (chatRoomId: string): Promise<void> => {
    if (!currentUser) return;

    try {
      await FirebaseService.markMessagesAsRead(chatRoomId, currentUser.uid);
      
      // Update local unread counts
      setChatRooms(prev =>
        prev.map(room =>
          room.id === chatRoomId
            ? { ...room, unreadCounts: { ...room.unreadCounts, [currentUser.uid]: 0 } }
            : room
        )
      );

    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const subscribeToChat = (chatRoomId: string): (() => void) => {
    // Unsubscribe from previous subscription if exists
    if (activeSubscriptions[chatRoomId]) {
      activeSubscriptions[chatRoomId]();
    }

    const unsubscribe = FirebaseService.subscribeToMessages(chatRoomId, (newMessages) => {
      setMessages(prev => ({
        ...prev,
        [chatRoomId]: newMessages
      }));
    });

    setActiveSubscriptions(prev => ({
      ...prev,
      [chatRoomId]: unsubscribe
    }));

    return unsubscribe;
  };

  const getUnreadCount = (): number => {
    if (!currentUser) return 0;
    
    return chatRooms.reduce((total, room) => {
      return total + (room.unreadCounts[currentUser.uid] || 0);
    }, 0);
  };

  // Cleanup subscriptions on unmount
  useEffect(() => {
    return () => {
      Object.values(activeSubscriptions).forEach(unsubscribe => unsubscribe());
    };
  }, []);

  const value: ChatContextType = {
    chatRooms,
    messages,
    loading,
    createChatRoom,
    sendMessage,
    markMessagesAsRead,
    subscribeToChat,
    getUnreadCount
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};