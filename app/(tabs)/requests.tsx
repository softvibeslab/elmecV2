import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotifications } from '@/contexts/NotificationContext';
import { Plus, Clock, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, Send, X, User } from 'lucide-react-native';

interface Request {
  id: string;
  titulo: string;
  mensaje: string;
  agenteDestino: string;
  fechaEnvio: string;
  estatus: 'recibido' | 'en_proceso' | 'resuelto';
  respuesta?: string;
}

const mockRequests: Request[] = [
  {
    id: '1',
    titulo: 'Soporte técnico urgente',
    mensaje: 'Necesito ayuda con la configuración del equipo nuevo que se instaló ayer.',
    agenteDestino: 'Carlos Mendoza López',
    fechaEnvio: '2024-01-15T10:30:00',
    estatus: 'en_proceso',
  },
  {
    id: '2',
    titulo: 'Consulta sobre facturación',
    mensaje: 'Tengo dudas sobre los cargos en mi última factura del mes pasado.',
    agenteDestino: 'Ana García Martínez',
    fechaEnvio: '2024-01-14T14:15:00',
    estatus: 'resuelto',
    respuesta: 'Los cargos corresponden al mantenimiento programado. Te envié el detalle por correo.',
  },
  {
    id: '3',
    titulo: 'Información sobre productos',
    mensaje: 'Me interesa conocer más sobre las nuevas soluciones de energía renovable.',
    agenteDestino: 'Luis Ramírez González',
    fechaEnvio: '2024-01-13T09:45:00',
    estatus: 'recibido',
  },
];

const mockAgents = [
  { id: '1', nombre: 'Luis Ramírez González', categoria: 'Agentes de venta' },
  { id: '2', nombre: 'Ana García Martínez', categoria: 'Servicio al Cliente' },
  { id: '3', nombre: 'Carlos Mendoza López', categoria: 'Soporte' },
  { id: '4', nombre: 'María Torres Ruiz', categoria: 'Agentes de venta' },
  { id: '5', nombre: 'José Hernández Silva', categoria: 'Servicio al Cliente' },
];

export default function Requests() {
  const [requests, setRequests] = useState<Request[]>(mockRequests);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [newRequest, setNewRequest] = useState({
    titulo: '',
    mensaje: '',
    agenteDestino: '',
  });
  const { sendLocalNotification } = useNotifications();
  const { sendDemoNotification } = useNotifications();

  // Simulate status changes and send notifications
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly update request status
      if (Math.random() > 0.98) {
        setRequests(prevRequests => {
          const updatedRequests = [...prevRequests];
          const randomIndex = Math.floor(Math.random() * updatedRequests.length);
          const request = updatedRequests[randomIndex];
          
          if (request.estatus === 'recibido') {
            request.estatus = 'en_proceso';
            sendDemoNotification(
              'Solicitud actualizada',
              `Tu solicitud "${request.titulo}" está ahora en proceso`,
              'info',
              { requestId: request.id }
            );
          } else if (request.estatus === 'en_proceso' && Math.random() > 0.5) {
            request.estatus = 'resuelto';
            request.respuesta = 'Tu solicitud ha sido resuelta. Revisa los detalles en la aplicación.';
            sendDemoNotification(
              'Solicitud resuelta',
              `Tu solicitud "${request.titulo}" ha sido resuelta`,
              'success',
              { requestId: request.id }
            );
          }
          
          return updatedRequests;
        });
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [sendDemoNotification]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'recibido':
        return <AlertTriangle size={16} color="#f59e0b" />;
      case 'en_proceso':
        return <Clock size={16} color="#3b82f6" />;
      case 'resuelto':
        return <CheckCircle size={16} color="#10b981" />;
      default:
        return <AlertTriangle size={16} color="#6b7280" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'recibido':
        return 'Recibido';
      case 'en_proceso':
        return 'En proceso';
      case 'resuelto':
        return 'Resuelto';
      default:
        return 'Desconocido';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'recibido':
        return '#f59e0b';
      case 'en_proceso':
        return '#3b82f6';
      case 'resuelto':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCreateRequest = async () => {
    if (!newRequest.titulo || !newRequest.mensaje || !newRequest.agenteDestino) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    const request: Request = {
      id: Date.now().toString(),
      titulo: newRequest.titulo,
      mensaje: newRequest.mensaje,
      agenteDestino: newRequest.agenteDestino,
      fechaEnvio: new Date().toISOString(),
      estatus: 'recibido',
    };

    setRequests([request, ...requests]);
    setNewRequest({ titulo: '', mensaje: '', agenteDestino: '' });
    setShowNewRequestModal(false);
    
    // Send notification for new request
    await sendDemoNotification(
      'Solicitud enviada',
      `Tu solicitud "${request.titulo}" ha sido enviada correctamente`,
      'success',
      { requestId: request.id }
    );
    
    Alert.alert('Éxito', 'Solicitud enviada correctamente');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>Solicitudes</Text>
            <Text style={styles.subtitle}>{requests.length} solicitudes totales</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowNewRequestModal(true)}
          >
            <Plus size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {requests.map((request) => (
          <View key={request.id} style={styles.requestCard}>
            <View style={styles.requestHeader}>
              <View style={styles.requestStatus}>
                {getStatusIcon(request.estatus)}
                <Text style={[styles.statusText, { color: getStatusColor(request.estatus) }]}>
                  {getStatusText(request.estatus)}
                </Text>
              </View>
              <Text style={styles.requestDate}>{formatDate(request.fechaEnvio)}</Text>
            </View>

            <Text style={styles.requestTitle}>{request.titulo}</Text>
            <Text style={styles.requestMessage}>{request.mensaje}</Text>

            <View style={styles.agentInfo}>
              <User size={16} color="#6b7280" />
              <Text style={styles.agentName}>Para: {request.agenteDestino}</Text>
            </View>

            {request.respuesta && (
              <View style={styles.responseContainer}>
                <Text style={styles.responseLabel}>Respuesta:</Text>
                <Text style={styles.responseText}>{request.respuesta}</Text>
              </View>
            )}
          </View>
        ))}

        {requests.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No tienes solicitudes aún</Text>
            <Text style={styles.emptySubtext}>Toca el botón + para crear tu primera solicitud</Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showNewRequestModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Nueva Solicitud</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowNewRequestModal(false)}
            >
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Título</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Describe brevemente tu solicitud"
                placeholderTextColor="#9ca3af"
                value={newRequest.titulo}
                onChangeText={(text) => setNewRequest(prev => ({ ...prev, titulo: text }))}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Agente Destino</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.agentsScroll}>
                {mockAgents.map((agent) => (
                  <TouchableOpacity
                    key={agent.id}
                    style={[
                      styles.agentChip,
                      newRequest.agenteDestino === agent.nombre && styles.agentChipSelected
                    ]}
                    onPress={() => setNewRequest(prev => ({ ...prev, agenteDestino: agent.nombre }))}
                  >
                    <Text style={[
                      styles.agentChipText,
                      newRequest.agenteDestino === agent.nombre && styles.agentChipTextSelected
                    ]}>
                      {agent.nombre}
                    </Text>
                    <Text style={[
                      styles.agentChipCategory,
                      newRequest.agenteDestino === agent.nombre && styles.agentChipCategorySelected
                    ]}>
                      {agent.categoria}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Mensaje</Text>
              <TextInput
                style={[styles.formInput, styles.formTextArea]}
                placeholder="Describe tu solicitud en detalle..."
                placeholderTextColor="#9ca3af"
                value={newRequest.mensaje}
                onChangeText={(text) => setNewRequest(prev => ({ ...prev, mensaje: text }))}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleCreateRequest}
            >
              <Send size={20} color="#ffffff" />
              <Text style={styles.submitButtonText}>Enviar Solicitud</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 24,
    paddingTop: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
  addButton: {
    width: 48,
    height: 48,
    backgroundColor: '#1e40af',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  list: {
    flex: 1,
    paddingHorizontal: 24,
  },
  requestCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  requestDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9ca3af',
  },
  requestTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 8,
  },
  requestMessage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  agentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  agentName: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  responseContainer: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  responseLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1e40af',
    marginBottom: 4,
  },
  responseText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1e3a8a',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9ca3af',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  formGroup: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  formTextArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  agentsScroll: {
    flexGrow: 0,
  },
  agentChip: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minWidth: 200,
  },
  agentChipSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  agentChipText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 4,
  },
  agentChipTextSelected: {
    color: '#1e40af',
  },
  agentChipCategory: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
  agentChipCategorySelected: {
    color: '#3b82f6',
  },
  submitButton: {
    backgroundColor: '#1e40af',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 16,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
});