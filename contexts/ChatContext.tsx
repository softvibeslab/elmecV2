import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  message: string;
  messageType: 'text' | 'image' | 'audio' | 'file' | 'emoji';
  timestamp: string;
  isRead: boolean;
  replyTo?: string;
  fileUrl?: string;
  fileName?: string;
  audioDuration?: number;
}

export interface ChatRoom {
  id: string;
  participants: string[];
  participantNames: string[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ChatContextType {
  chatRooms: ChatRoom[];
  messages: { [roomId: string]: ChatMessage[] };
  sendMessage: (roomId: string, message: string, messageType?: ChatMessage['messageType'], fileUrl?: string, fileName?: string, audioDuration?: number, replyTo?: string) => Promise<void>;
  createChatRoom: (participantId: string, participantName: string) => Promise<string>;
  markMessagesAsRead: (roomId: string) => void;
  getChatRoom: (roomId: string) => ChatRoom | undefined;
  getUnreadCount: () => number;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};

// Mock data for demonstration
const mockChatRooms: ChatRoom[] = [
  {
    id: '1',
    participants: ['user1', 'agent1'],
    participantNames: ['Usuario', 'Luis Ramírez González'],
    unreadCount: 2,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z',
  },
  {
    id: '2',
    participants: ['user1', 'agent2'],
    participantNames: ['Usuario', 'Ana García Martínez'],
    unreadCount: 0,
    createdAt: '2024-01-14T09:00:00Z',
    updatedAt: '2024-01-14T16:45:00Z',
  },
];

const mockMessages: { [roomId: string]: ChatMessage[] } = {
  '1': [
    {
      id: '1',
      senderId: 'agent1',
      senderName: 'Luis Ramírez González',
      receiverId: 'user1',
      message: '¡Hola! He recibido tu solicitud de soporte técnico. ¿Podrías darme más detalles sobre el problema?',
      messageType: 'text',
      timestamp: '2024-01-15T10:30:00Z',
      isRead: true,
    },
    {
      id: '2',
      senderId: 'user1',
      senderName: 'Usuario',
      receiverId: 'agent1',
      message: 'Hola Luis, el equipo que instalaron ayer no está funcionando correctamente. Se apaga cada 10 minutos.',
      messageType: 'text',
      timestamp: '2024-01-15T10:35:00Z',
      isRead: true,
    },
    {
      id: '3',
      senderId: 'agent1',
      senderName: 'Luis Ramírez González',
      receiverId: 'user1',
      message: 'Entiendo. ¿Podrías enviarme una foto del panel de control del equipo?',
      messageType: 'text',
      timestamp: '2024-01-15T10:40:00Z',
      isRead: true,
    },
    {
      id: '4',
      senderId: 'user1',
      senderName: 'Usuario',
      receiverId: 'agent1',
      message: 'Aquí está la foto del panel',
      messageType: 'image',
      timestamp: '2024-01-15T10:45:00Z',
      isRead: false,
      fileUrl: 'https://images.pexels.com/photos/159298/gears-cogs-machine-machinery-159298.jpeg',
    },
    {
      id: '5',
      senderId: 'agent1',
      senderName: 'Luis Ramírez González',
      receiverId: 'user1',
      message: 'Perfecto, veo el problema. Voy a programar una visita técnica para mañana por la mañana.',
      messageType: 'text',
      timestamp: '2024-01-15T14:30:00Z',
      isRead: false,
    },
  ],
  '2': [
    {
      id: '6',
      senderId: 'agent2',
      senderName: 'Ana García Martínez',
      receiverId: 'user1',
      message: 'Hola, he revisado tu consulta sobre facturación. Los cargos corresponden al mantenimiento programado.',
      messageType: 'text',
      timestamp: '2024-01-14T14:00:00Z',
      isRead: true,
    },
    {
      id: '7',
      senderId: 'user1',
      senderName: 'Usuario',
      receiverId: 'agent2',
      message: 'Gracias por la aclaración Ana 👍',
      messageType: 'text',
      timestamp: '2024-01-14T16:45:00Z',
      isRead: true,
    },
  ],
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>(mockChatRooms);
  const [messages, setMessages] = useState<{ [roomId: string]: ChatMessage[] }>(mockMessages);
  const { user } = useAuth();
  const { sendLocalNotification, sendDemoNotification } = useNotifications();

  const sendMessage = async (
    roomId: string,
    message: string,
    messageType: ChatMessage['messageType'] = 'text',
    fileUrl?: string,
    fileName?: string,
    audioDuration?: number,
    replyTo?: string
  ) => {
    if (!user) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: user.id,
      senderName: `${user.nombre} ${user.apellidoPaterno}`,
      receiverId: 'agent', // This would be dynamic in a real app
      message,
      messageType,
      timestamp: new Date().toISOString(),
      isRead: false,
      fileUrl,
      fileName,
      audioDuration,
      replyTo,
    };

    setMessages(prev => ({
      ...prev,
      [roomId]: [...(prev[roomId] || []), newMessage],
    }));

    // Update chat room's last message and timestamp
    setChatRooms(prev =>
      prev.map(room =>
        room.id === roomId
          ? { ...room, lastMessage: newMessage, updatedAt: newMessage.timestamp }
          : room
      )
    );

    // Send notification to the receiver (in a real app, this would be handled by the server)
    await sendDemoNotification(
      `💬 Mensaje enviado`,
      `Tu mensaje ha sido enviado a ${getRoomParticipantName(roomId)}`,
      'success',
      { roomId, messageId: newMessage.id }
    );
  };

  const createChatRoom = async (participantId: string, participantName: string): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    // Check if chat room already exists
    const existingRoom = chatRooms.find(room =>
      room.participants.includes(participantId) && room.participants.includes(user.id)
    );

    if (existingRoom) {
      return existingRoom.id;
    }

    const newRoom: ChatRoom = {
      id: Date.now().toString(),
      participants: [user.id, participantId],
      participantNames: [`${user.nombre} ${user.apellidoPaterno}`, participantName],
      unreadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setChatRooms(prev => [newRoom, ...prev]);
    setMessages(prev => ({ ...prev, [newRoom.id]: [] }));

    return newRoom.id;
  };

  const markMessagesAsRead = useCallback((roomId: string) => {
    setMessages(prev => ({
      ...prev,
      [roomId]: prev[roomId]?.map(msg => ({ ...msg, isRead: true })) || [],
    }));

    setChatRooms(prev =>
      prev.map(room =>
        room.id === roomId ? { ...room, unreadCount: 0 } : room
      )
    );
  }, []);

  const getChatRoom = (roomId: string): ChatRoom | undefined => {
    return chatRooms.find(room => room.id === roomId);
  };

  const getUnreadCount = (): number => {
    return chatRooms.reduce((total, room) => total + room.unreadCount, 0);
  };

  const getRoomParticipantName = (roomId: string): string => {
    const room = chatRooms.find(r => r.id === roomId);
    if (!room || !user) return 'Usuario';
    return room.participantNames.find(name => name !== `${user.nombre} ${user.apellidoPaterno}`) || 'Usuario';
  };

  // Simulate receiving messages (in a real app, this would come from WebSocket or push notifications)
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly send a message from an agent
      if (Math.random() > 0.95 && chatRooms.length > 0) {
        const randomRoom = chatRooms[Math.floor(Math.random() * chatRooms.length)];
        const agentName = randomRoom.participantNames.find(name => name !== `${user?.nombre} ${user?.apellidoPaterno}`);
        
        if (agentName) {
          const responses = [
            'Gracias por tu mensaje, estoy revisando tu solicitud.',
            'Te contacto en unos minutos para resolver tu consulta.',
            '¿Necesitas alguna información adicional?',
            'He actualizado el estatus de tu solicitud.',
          ];
          
          const randomResponse = responses[Math.floor(Math.random() * responses.length)];
          
          const newMessage: ChatMessage = {
            id: Date.now().toString(),
            senderId: 'agent',
            senderName: agentName,
            receiverId: user?.id || '',
            message: randomResponse,
            messageType: 'text',
            timestamp: new Date().toISOString(),
            isRead: false,
          };

          setMessages(prev => ({
            ...prev,
            [randomRoom.id]: [...(prev[randomRoom.id] || []), newMessage],
          }));

          setChatRooms(prev =>
            prev.map(room =>
              room.id === randomRoom.id
                ? { ...room, lastMessage: newMessage, updatedAt: newMessage.timestamp, unreadCount: room.unreadCount + 1 }
                : room
            )
          );

          sendDemoNotification(
            `Nuevo mensaje de ${agentName}`,
            randomResponse,
            'info',
            { roomId: randomRoom.id, messageId: newMessage.id }
          );
        }
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [chatRooms, user, sendLocalNotification]);

  return (
    <ChatContext.Provider
      value={{
        chatRooms,
        messages,
        sendMessage,
        createChatRoom,
        markMessagesAsRead,
        getChatRoom,
        getUnreadCount,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};