import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  CheckCircle, 
  XCircle, 
  Loader, 
  Database, 
  MessageCircle, 
  Bell, 
  Users,
  BarChart3,
  Shield,
  Wifi
} from 'lucide-react-native';
import { auth, db, realtimeDb, analytics } from '../config/firebase';
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext';
import FirebaseService from '../services/firebaseService';
import { 
  connectivityState,
  enableNetwork,
  disableNetwork 
} from 'firebase/firestore';
import { 
  connectDatabaseEmulator,
  goOffline,
  goOnline
} from 'firebase/database';

interface ServiceStatus {
  name: string;
  status: 'checking' | 'connected' | 'error' | 'disabled';
  message: string;
  icon: any;
  details?: string[];
}

export const FirebaseValidator: React.FC = () => {
  const { currentUser, userProfile } = useFirebaseAuth();
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: 'Authentication',
      status: 'checking',
      message: 'Verificando...',
      icon: Shield
    },
    {
      name: 'Firestore Database',
      status: 'checking', 
      message: 'Verificando...',
      icon: Database
    },
    {
      name: 'Realtime Database',
      status: 'checking',
      message: 'Verificando...',
      icon: MessageCircle
    },
    {
      name: 'Analytics',
      status: 'checking',
      message: 'Verificando...',
      icon: BarChart3
    },
    {
      name: 'Push Notifications',
      status: 'checking',
      message: 'Verificando...',
      icon: Bell
    },
    {
      name: 'User Presence',
      status: 'checking',
      message: 'Verificando...',
      icon: Wifi
    }
  ]);

  const [isValidating, setIsValidating] = useState(false);
  const [configInfo, setConfigInfo] = useState<any>({});

  useEffect(() => {
    validateFirebaseServices();
    loadConfigInfo();
  }, []);

  const loadConfigInfo = () => {
    setConfigInfo({
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'No configurado',
      authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'No configurado',
      environment: process.env.EXPO_PUBLIC_ENVIRONMENT || 'development',
      currentUser: currentUser?.uid || 'No autenticado',
      userProfile: userProfile?.nombre || 'Sin perfil'
    });
  };

  const validateFirebaseServices = async () => {
    setIsValidating(true);
    
    // 1. Validate Authentication
    await validateAuth();
    
    // 2. Validate Firestore
    await validateFirestore();
    
    // 3. Validate Realtime Database
    await validateRealtimeDb();
    
    // 4. Validate Analytics
    await validateAnalytics();
    
    // 5. Validate Push Notifications
    await validateNotifications();
    
    // 6. Validate User Presence
    await validatePresence();
    
    setIsValidating(false);
  };

  const validateAuth = async () => {
    try {
      updateServiceStatus('Authentication', 'checking', 'Verificando estado de autenticación...');
      
      // Check if auth is initialized
      if (!auth) {
        throw new Error('Auth no está inicializado');
      }

      // Check current user
      if (currentUser) {
        updateServiceStatus('Authentication', 'connected', `Usuario autenticado: ${currentUser.email}`, [
          `UID: ${currentUser.uid}`,
          `Email verificado: ${currentUser.emailVerified ? 'Sí' : 'No'}`,
          `Último login: ${currentUser.metadata.lastSignInTime || 'Nunca'}`
        ]);
      } else {
        updateServiceStatus('Authentication', 'error', 'No hay usuario autenticado', [
          'Para probar completamente, inicia sesión primero'
        ]);
      }
    } catch (error) {
      updateServiceStatus('Authentication', 'error', `Error: ${error}`, [
        'Verifica la configuración de Firebase Auth',
        'Revisa las variables de entorno'
      ]);
    }
  };

  const validateFirestore = async () => {
    try {
      updateServiceStatus('Firestore Database', 'checking', 'Probando conexión a Firestore...');
      
      if (!db) {
        throw new Error('Firestore no está inicializado');
      }

      // Test connectivity
      const connectivityStatus = await connectivityState(db);
      
      if (currentUser) {
        // Try to read user data
        const userInfo = await FirebaseService.getUserInfo(currentUser.uid);
        updateServiceStatus('Firestore Database', 'connected', 'Conectado y funcionando', [
          `Estado: ${connectivityStatus}`,
          `Datos de usuario: ${userInfo ? 'Encontrados' : 'No encontrados'}`,
          `Proyecto: ${process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID}`
        ]);
      } else {
        updateServiceStatus('Firestore Database', 'connected', 'Conectado (sin autenticación)', [
          `Estado: ${connectivityStatus}`,
          'Para probar operaciones, inicia sesión'
        ]);
      }
    } catch (error) {
      updateServiceStatus('Firestore Database', 'error', `Error: ${error}`, [
        'Verifica las reglas de seguridad',
        'Confirma que el proyecto esté configurado correctamente'
      ]);
    }
  };

  const validateRealtimeDb = async () => {
    try {
      updateServiceStatus('Realtime Database', 'checking', 'Probando Realtime Database...');
      
      if (!realtimeDb) {
        throw new Error('Realtime Database no está inicializado');
      }

      // Test basic connectivity
      if (currentUser) {
        await FirebaseService.setUserPresence(currentUser.uid, true);
        updateServiceStatus('Realtime Database', 'connected', 'Conectado y funcionando', [
          `URL: ${process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL}`,
          'Presencia de usuario configurada',
          'Real-time sync activo'
        ]);
      } else {
        updateServiceStatus('Realtime Database', 'connected', 'Conectado (sin autenticación)', [
          'Para probar operaciones en tiempo real, inicia sesión'
        ]);
      }
    } catch (error) {
      updateServiceStatus('Realtime Database', 'error', `Error: ${error}`, [
        'Verifica la URL de Realtime Database',
        'Confirma las reglas de seguridad'
      ]);
    }
  };

  const validateAnalytics = async () => {
    try {
      updateServiceStatus('Analytics', 'checking', 'Probando Analytics...');
      
      if (analytics) {
        // Test analytics event
        await FirebaseService.trackEvent('firebase_validation', {
          timestamp: new Date().toISOString(),
          user_authenticated: !!currentUser
        });
        
        updateServiceStatus('Analytics', 'connected', 'Analytics funcionando', [
          'Eventos se están enviando',
          `Measurement ID: ${process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID}`,
          'Solo funciona en web'
        ]);
      } else {
        updateServiceStatus('Analytics', 'disabled', 'Analytics no disponible', [
          'Analytics solo funciona en web',
          'En móvil se usa el sistema personalizado'
        ]);
      }
    } catch (error) {
      updateServiceStatus('Analytics', 'error', `Error: ${error}`, [
        'Verifica el Measurement ID',
        'Analytics puede no estar habilitado'
      ]);
    }
  };

  const validateNotifications = async () => {
    try {
      updateServiceStatus('Push Notifications', 'checking', 'Probando notificaciones...');
      
      // Check if notifications are supported
      if (typeof window !== 'undefined' && 'Notification' in window) {
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
          updateServiceStatus('Push Notifications', 'connected', 'Notificaciones habilitadas', [
            'Permisos concedidos',
            'Sistema web funcionando',
            `VAPID Key: ${process.env.EXPO_PUBLIC_FIREBASE_VAPID_KEY ? 'Configurado' : 'No configurado'}`
          ]);
        } else {
          updateServiceStatus('Push Notifications', 'error', 'Permisos denegados', [
            'El usuario negó los permisos',
            'Habilita notificaciones en el navegador'
          ]);
        }
      } else {
        updateServiceStatus('Push Notifications', 'disabled', 'No disponible en esta plataforma', [
          'Usa Expo Notifications en móvil'
        ]);
      }
    } catch (error) {
      updateServiceStatus('Push Notifications', 'error', `Error: ${error}`, [
        'Problema con el sistema de notificaciones'
      ]);
    }
  };

  const validatePresence = async () => {
    try {
      updateServiceStatus('User Presence', 'checking', 'Probando sistema de presencia...');
      
      if (currentUser) {
        // Test presence system
        const unsubscribe = FirebaseService.subscribeToPresence((presenceData) => {
          const userPresence = presenceData[currentUser.uid];
          updateServiceStatus('User Presence', 'connected', 'Sistema de presencia activo', [
            `Estado: ${userPresence?.isOnline ? 'En línea' : 'Fuera de línea'}`,
            `Última actividad: ${userPresence?.lastSeen || 'No disponible'}`,
            'Real-time sync funcionando'
          ]);
          unsubscribe();
        });
        
        // Set user as online
        await FirebaseService.setUserPresence(currentUser.uid, true);
      } else {
        updateServiceStatus('User Presence', 'error', 'Requiere autenticación', [
          'Inicia sesión para probar presencia'
        ]);
      }
    } catch (error) {
      updateServiceStatus('User Presence', 'error', `Error: ${error}`, [
        'Problema con Realtime Database'
      ]);
    }
  };

  const updateServiceStatus = (serviceName: string, status: ServiceStatus['status'], message: string, details?: string[]) => {
    setServices(prev => prev.map(service => 
      service.name === serviceName 
        ? { ...service, status, message, details }
        : service
    ));
  };

  const getStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'checking':
        return <Loader size={20} color="#f59e0b" />;
      case 'connected':
        return <CheckCircle size={20} color="#10b981" />;
      case 'error':
        return <XCircle size={20} color="#ef4444" />;
      case 'disabled':
        return <XCircle size={20} color="#9ca3af" />;
      default:
        return <Loader size={20} color="#f59e0b" />;
    }
  };

  const getStatusColor = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'connected':
        return '#ecfdf5';
      case 'error':
        return '#fef2f2';
      case 'disabled':
        return '#f9fafb';
      default:
        return '#fffbeb';
    }
  };

  const testFirebaseOperations = async () => {
    if (!currentUser) {
      Alert.alert('Error', 'Debes estar autenticado para probar las operaciones');
      return;
    }

    try {
      Alert.alert('Probando...', 'Ejecutando operaciones de prueba');
      
      // Test user operations
      await FirebaseService.updateUser(currentUser.uid, {
        lastSeen: new Date().toISOString()
      });

      // Test analytics
      await FirebaseService.trackEvent('test_operation', {
        timestamp: new Date().toISOString()
      });

      // Test notifications
      await FirebaseService.createNotification({
        userId: currentUser.uid,
        title: 'Prueba de Firebase',
        body: 'Todas las operaciones funcionan correctamente',
        type: 'system',
        priority: 'medium'
      });

      Alert.alert('¡Éxito!', 'Todas las operaciones de prueba funcionaron correctamente');
    } catch (error) {
      Alert.alert('Error en pruebas', `Error: ${error}`);
    }
  };

  const retryValidation = () => {
    setServices(prev => prev.map(service => ({
      ...service,
      status: 'checking' as const,
      message: 'Verificando...',
      details: undefined
    })));
    validateFirebaseServices();
  };

  const connectedCount = services.filter(s => s.status === 'connected').length;
  const errorCount = services.filter(s => s.status === 'error').length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>🔥 Validador de Firebase</Text>
          <Text style={styles.subtitle}>
            Estado de los servicios: {connectedCount} conectados, {errorCount} errores
          </Text>
        </View>

        {/* Configuration Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Información de Configuración</Text>
          <View style={styles.configCard}>
            <Text style={styles.configItem}>Proyecto: {configInfo.projectId}</Text>
            <Text style={styles.configItem}>Dominio: {configInfo.authDomain}</Text>
            <Text style={styles.configItem}>Entorno: {configInfo.environment}</Text>
            <Text style={styles.configItem}>Usuario: {configInfo.currentUser}</Text>
            <Text style={styles.configItem}>Perfil: {configInfo.userProfile}</Text>
          </View>
        </View>

        {/* Services Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Estado de Servicios</Text>
          {services.map((service, index) => (
            <View key={index} style={[styles.serviceCard, { backgroundColor: getStatusColor(service.status) }]}>
              <View style={styles.serviceHeader}>
                <View style={styles.serviceInfo}>
                  <service.icon size={24} color="#374151" />
                  <Text style={styles.serviceName}>{service.name}</Text>
                </View>
                {getStatusIcon(service.status)}
              </View>
              
              <Text style={styles.serviceMessage}>{service.message}</Text>
              
              {service.details && (
                <View style={styles.serviceDetails}>
                  {service.details.map((detail, idx) => (
                    <Text key={idx} style={styles.serviceDetail}>• {detail}</Text>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧪 Acciones de Prueba</Text>
          
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={retryValidation}
            disabled={isValidating}
          >
            <Text style={styles.actionButtonText}>
              {isValidating ? 'Validando...' : 'Revalidar Servicios'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.testButton]} 
            onPress={testFirebaseOperations}
            disabled={!currentUser}
          >
            <Text style={styles.actionButtonText}>
              Probar Operaciones Firebase
            </Text>
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>💡 Información</Text>
            <Text style={styles.infoText}>
              • Para probar completamente, inicia sesión con una cuenta
            </Text>
            <Text style={styles.infoText}>
              • Algunos servicios solo funcionan en web (Analytics, notificaciones web)
            </Text>
            <Text style={styles.infoText}>
              • Las notificaciones push requieren configuración adicional en producción
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 16,
  },
  configCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  configItem: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    marginBottom: 8,
  },
  serviceCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  serviceName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  serviceMessage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    marginBottom: 8,
  },
  serviceDetails: {
    marginTop: 8,
  },
  serviceDetail: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9ca3af',
    marginBottom: 4,
  },
  actionButton: {
    backgroundColor: '#1e40af',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  testButton: {
    backgroundColor: '#10b981',
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  infoBox: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#dbeafe',
    marginTop: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1e40af',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#1e3a8a',
    marginBottom: 4,
  },
});