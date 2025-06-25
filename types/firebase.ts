// Firebase Data Structures

export interface User {
  id: string;
  email: string;
  empresa: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  correoElectronico: string;
  celular: string;
  ciudad: string;
  estado: string;
  rol: 'customer' | 'agent' | 'admin';
  categoria?: 'Agentes de venta' | 'Servicio al Cliente' | 'Soporte';
  zona?: string;
  activo: boolean;
  foto?: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  fcmTokens: string[]; // Para múltiples dispositivos
  isOnline: boolean;
  lastSeen: string;
}

export interface Request {
  id: string;
  titulo: string;
  mensaje: string;
  tipo: number;
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  estatus: 'nuevo' | 'asignado' | 'en_proceso' | 'pausado' | 'resuelto' | 'cerrado';
  usuarioId: string; // Cliente que hace la solicitud
  agenteId?: string; // Agente asignado
  createdAt: string;
  updatedAt: string;
  fechaVencimiento?: string;
  archivos?: string[];
  tags?: string[];
  rating?: number;
  feedback?: string;
  historialEstatus: StatusHistory[];
  metadata: {
    source: 'web' | 'mobile' | 'email' | 'phone';
    urgencia: boolean;
    cliente_vip: boolean;
  };
}

export interface StatusHistory {
  estatus: string;
  timestamp: string;
  userId: string;
  comentario?: string;
}

export interface ChatRoom {
  id: string;
  tipo: 'support' | 'sales' | 'general';
  participants: string[]; // Array de user IDs
  requestId?: string; // Si el chat está relacionado con una solicitud
  createdAt: string;
  updatedAt: string;
  lastMessage?: {
    id: string;
    message: string;
    senderId: string;
    timestamp: string;
    type: 'text' | 'image' | 'file' | 'audio';
  };
  isActive: boolean;
  unreadCounts: { [userId: string]: number };
  metadata: {
    title: string;
    description?: string;
    priority: 'low' | 'medium' | 'high';
  };
}

export interface Message {
  id: string;
  chatRoomId: string;
  senderId: string;
  senderName: string;
  message: string;
  type: 'text' | 'image' | 'file' | 'audio' | 'system';
  timestamp: string;
  readBy: { [userId: string]: string }; // userId -> timestamp when read
  replyTo?: string; // ID del mensaje al que responde
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  audioDuration?: number;
  editedAt?: string;
  isDeleted: boolean;
  reactions?: { [emoji: string]: string[] }; // emoji -> array de userIds
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'request_update' | 'new_message' | 'assignment' | 'reminder' | 'system';
  priority: 'low' | 'medium' | 'high';
  data?: {
    requestId?: string;
    chatRoomId?: string;
    messageId?: string;
    action?: string;
    url?: string;
  };
  read: boolean;
  createdAt: string;
  readAt?: string;
  expiredAt?: string;
  channels: ('push' | 'email' | 'sms')[];
  sent: boolean;
  sentAt?: string;
}

export interface Analytics {
  event: string;
  userId?: string;
  sessionId: string;
  timestamp: string;
  properties: {
    screen?: string;
    action?: string;
    category?: string;
    value?: number;
    duration?: number;
    [key: string]: any;
  };
  device: {
    platform: string;
    version: string;
    model?: string;
  };
}

export interface Department {
  id: string;
  nombre: string;
  descripcion: string;
  agentes: string[]; // Array de user IDs
  horarios: {
    [day: string]: {
      inicio: string;
      fin: string;
      activo: boolean;
    };
  };
  configuracion: {
    autoAsignacion: boolean;
    tiempoRespuesta: number; // minutos
    escalamiento: {
      activo: boolean;
      tiempo: number; // minutos
      supervisor: string; // user ID
    };
  };
  metricas: {
    solicitudesTotal: number;
    solicitudesResueltas: number;
    tiempoPromedio: number;
    satisfaccion: number;
  };
}

export interface Company {
  id: string;
  nombre: string;
  logo?: string;
  configuracion: {
    horarioAtencion: {
      [day: string]: {
        inicio: string;
        fin: string;
        activo: boolean;
      };
    };
    notificaciones: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    chat: {
      respuestaAutomatica: boolean;
      mensajeBienvenida: string;
      horarioAtencion: boolean;
    };
    solicitudes: {
      autoAsignacion: boolean;
      escalamiento: boolean;
      tiempoRespuesta: number;
    };
  };
  metricas: {
    usuariosActivos: number;
    solicitudesAbiertas: number;
    satisfaccionPromedio: number;
    tiempoRespuestaPromedio: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Real-time presence system
export interface UserPresence {
  userId: string;
  isOnline: boolean;
  lastSeen: string;
  status: 'available' | 'busy' | 'away' | 'offline';
  currentPage?: string;
  device: string;
}

// File uploads
export interface FileUpload {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
  relatedTo: {
    type: 'message' | 'request' | 'user' | 'company';
    id: string;
  };
}

// Settings and Configuration
export interface Settings {
  userId: string;
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
    inApp: boolean;
    sound: boolean;
    vibration: boolean;
  };
  chat: {
    enterToSend: boolean;
    showReadReceipts: boolean;
    showTypingIndicator: boolean;
    theme: 'light' | 'dark' | 'auto';
  };
  privacy: {
    showOnlineStatus: boolean;
    showLastSeen: boolean;
    readReceipts: boolean;
  };
  language: string;
  timezone: string;
  updatedAt: string;
}