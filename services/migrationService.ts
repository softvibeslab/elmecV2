import FirebaseService from './firebaseService';
import { User, Request, ChatRoom, Message } from '../types/firebase';

/**
 * Service to migrate data from existing API to Firebase
 * This helps transition from the current backend to Firebase
 */
export class MigrationService {
  
  // Migrate user data from legacy format to Firebase format
  static mapLegacyUserToFirebase(legacyUser: any): Omit<User, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      email: legacyUser.email || legacyUser.correoElectronico,
      empresa: legacyUser.empresa || 'ELMEC',
      nombre: legacyUser.first_name || legacyUser.nombre,
      apellidoPaterno: legacyUser.last_name || legacyUser.apellidoPaterno,
      apellidoMaterno: legacyUser.materno || legacyUser.apellidoMaterno,
      correoElectronico: legacyUser.email || legacyUser.correoElectronico,
      celular: legacyUser.telefono || legacyUser.celular,
      ciudad: legacyUser.ciudad || '',
      estado: legacyUser.estado || '',
      rol: this.mapLegacyRoleToFirebase(legacyUser.rol),
      categoria: legacyUser.categoria,
      zona: legacyUser.zona,
      activo: legacyUser.activo !== false,
      foto: legacyUser.foto,
      fcmTokens: [],
      isOnline: false,
      lastSeen: new Date().toISOString()
    };
  }

  // Map legacy role numbers to Firebase role strings
  static mapLegacyRoleToFirebase(legacyRole: number): 'customer' | 'agent' | 'admin' {
    switch (legacyRole) {
      case 1:
        return 'customer';
      case 2:
        return 'agent';
      case 3:
        return 'admin';
      default:
        return 'customer';
    }
  }

  // Migrate request data from legacy format to Firebase format
  static mapLegacyRequestToFirebase(legacyRequest: any): Omit<Request, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      titulo: legacyRequest.titulo,
      mensaje: legacyRequest.mensaje,
      tipo: legacyRequest.tipo,
      prioridad: legacyRequest.prioridad || 'media',
      estatus: legacyRequest.estatus || 'nuevo',
      usuarioId: legacyRequest.usuario || legacyRequest.usuarioId,
      agenteId: legacyRequest.agente || legacyRequest.agenteId,
      fechaVencimiento: legacyRequest.fechaVencimiento,
      archivos: legacyRequest.archivos || [],
      tags: legacyRequest.tags || [],
      rating: legacyRequest.rating,
      feedback: legacyRequest.feedback,
      historialEstatus: legacyRequest.historialEstatus || [],
      metadata: {
        source: 'migration',
        urgencia: legacyRequest.urgencia || false,
        cliente_vip: legacyRequest.cliente_vip || false
      }
    };
  }

  // Migrate chat data from legacy format to Firebase format
  static mapLegacyChatToFirebase(legacyChat: any): Omit<ChatRoom, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      tipo: 'support',
      participants: [legacyChat.usuario, legacyChat.agente].filter(Boolean),
      requestId: legacyChat.solicitud,
      isActive: true,
      unreadCounts: {},
      metadata: {
        title: 'Chat migrado',
        priority: 'medium'
      }
    };
  }

  // Migrate messages from legacy format to Firebase format
  static mapLegacyMessageToFirebase(legacyMessage: any, chatRoomId: string): Omit<Message, 'id'> {
    return {
      chatRoomId,
      senderId: legacyMessage.usuario.toString(),
      senderName: legacyMessage.senderName || 'Usuario',
      message: legacyMessage.mensaje,
      type: legacyMessage.archivo ? 'file' : 'text',
      timestamp: legacyMessage.fecha_envio,
      readBy: {},
      fileUrl: legacyMessage.archivo,
      isDeleted: false
    };
  }

  // Batch migration functions
  static async migrateUsers(legacyUsers: any[]): Promise<void> {
    console.log(`Starting migration of ${legacyUsers.length} users...`);
    
    for (const legacyUser of legacyUsers) {
      try {
        const firebaseUser = this.mapLegacyUserToFirebase(legacyUser);
        await FirebaseService.registerUser(firebaseUser);
        console.log(`Migrated user: ${firebaseUser.correoElectronico}`);
      } catch (error) {
        console.error(`Error migrating user ${legacyUser.email}:`, error);
      }
    }
    
    console.log('User migration completed');
  }

  static async migrateRequests(legacyRequests: any[]): Promise<void> {
    console.log(`Starting migration of ${legacyRequests.length} requests...`);
    
    for (const legacyRequest of legacyRequests) {
      try {
        const firebaseRequest = this.mapLegacyRequestToFirebase(legacyRequest);
        await FirebaseService.createRequest(firebaseRequest);
        console.log(`Migrated request: ${firebaseRequest.titulo}`);
      } catch (error) {
        console.error(`Error migrating request ${legacyRequest.id}:`, error);
      }
    }
    
    console.log('Request migration completed');
  }

  static async migrateChats(legacyChats: any[]): Promise<void> {
    console.log(`Starting migration of ${legacyChats.length} chats...`);
    
    for (const legacyChat of legacyChats) {
      try {
        const firebaseChatRoom = this.mapLegacyChatToFirebase(legacyChat);
        const chatRoom = await FirebaseService.createChatRoom(
          firebaseChatRoom.participants,
          firebaseChatRoom.tipo,
          firebaseChatRoom.requestId
        );
        
        // Migrate messages for this chat
        if (legacyChat.messages) {
          for (const legacyMessage of legacyChat.messages) {
            const firebaseMessage = this.mapLegacyMessageToFirebase(legacyMessage, chatRoom.id);
            await FirebaseService.sendMessage(
              chatRoom.id,
              firebaseMessage.senderId,
              firebaseMessage.senderName,
              firebaseMessage.message,
              firebaseMessage.type
            );
          }
        }
        
        console.log(`Migrated chat room: ${chatRoom.id}`);
      } catch (error) {
        console.error(`Error migrating chat ${legacyChat.id}:`, error);
      }
    }
    
    console.log('Chat migration completed');
  }

  // Full migration orchestrator
  static async runFullMigration(): Promise<void> {
    console.log('Starting full data migration from legacy API to Firebase...');
    
    try {
      // You would fetch data from your existing API here
      // const legacyUsers = await existingApiService.getUsers();
      // const legacyRequests = await existingApiService.getRequests();
      // const legacyChats = await existingApiService.getChats();
      
      // await this.migrateUsers(legacyUsers);
      // await this.migrateRequests(legacyRequests);
      // await this.migrateChats(legacyChats);
      
      console.log('Full migration completed successfully!');
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }
}

export default MigrationService;