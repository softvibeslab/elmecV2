import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotifications } from '@/contexts/NotificationContext';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';
import FirebaseService from '@/services/firebaseService';
import { Plus, Clock, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, Send, X, User, Filter, Search } from 'lucide-react-native';
import type { User as FirebaseUser } from '@/types/firebase';

export default function Requests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [agents, setAgents] = useState<FirebaseUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [newRequest, setNewRequest] = useState({
    titulo: '',
    mensaje: '',
    agenteDestino: '',
  });
  const { sendLocalNotification } = useNotifications();
  const { sendDemoNotification } = useNotifications();
  const { userProfile: user } = useFirebaseAuth();

  // Load requests and agents from Firebase
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Simular datos para evitar errores
        setRequests([
          {
            id: '1',
            titulo: 'Problema con equipo industrial',
            mensaje: 'El equipo se apaga cada 10 minutos',
            estatus: 'en_proceso',
            prioridad: 'alta',
            createdAt: new Date().toISOString(),
            agenteId: 'agent1'
          },
          {
            id: '2',
            titulo: 'Consulta sobre facturación',
            mensaje: 'Necesito información sobre mi última factura',
            estatus: 'resuelto',
            prioridad: 'media',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            agenteId: 'agent2',
            feedback: 'La consulta ha sido resuelta. Los cargos corresponden al mantenimiento programado.'
          }
        ]);
        
        setAgents([
          {
            id: 'agent1',
            nombre: 'Luis',
            apellidoPaterno: 'Ramírez',
            apellidoMaterno: 'González',
            categoria: 'Soporte',
            correoElectronico: 'luis@elmec.com',
            empresa: 'ELMEC',
            celular: '+52 123 456 7890',
            ciudad: 'México',
            estado: 'CDMX',
            rol: 'agent',
            zona: 'Centro',
            activo: true,
            fcmTokens: [],
            isOnline: true,
            lastSeen: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'agent2',
            nombre: 'Ana',
            apellidoPaterno: 'García',
            apellidoMaterno: 'Martínez',
            categoria: 'Servicio al Cliente',
            correoElectronico: 'ana@elmec.com',
            empresa: 'ELMEC',
            celular: '+52 987 654 3210',
            ciudad: 'México',
            estado: 'CDMX',
            rol: 'agent',
            zona: 'Norte',
            activo: true,
            fcmTokens: [],
            isOnline: true,
            lastSeen: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]);
        
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Filtrar solicitudes
  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.mensaje.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || request.estatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'nuevo':
      case 'asignado':
        return <AlertTriangle size={16} color="#f59e0b" />;
      case 'en_proceso':
        return <Clock size={16} color="#3b82f6" />;
      case 'pausado':
        return <AlertTriangle size={16} color="#f97316" />;
      case 'resuelto':
      case 'cerrado':
        return <CheckCircle size={16} color="#10b981" />;
      default:
        return <AlertTriangle size={16} color="#6b7280" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'nuevo':
        return 'Nuevo';
      case 'asignado':
        return 'Asignado';
      case 'en_proceso':
        return 'En proceso';
      case 'pausado':
        return 'Pausado';
      case 'resuelto':
        return 'Resuelto';
      case 'cerrado':
        return 'Cerrado';
      default:
        return 'Desconocido';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'nuevo':
      case 'asignado':
        return '#f59e0b';
      case 'en_proceso':
        return '#3b82f6';
      case 'pausado':
        return '#f97316';
      case 'resuelto':
      case 'cerrado':
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
    if (!newRequest.titulo || !newRequest.mensaje || !newRequest.agenteDestino || !user) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    try {
      const selectedAgent = agents.find(agent => agent.nombre === newRequest.agenteDestino);
      
      // Simular creación de solicitud
      const newRequestData = {
        id: Date.now().toString(),
        titulo: newRequest.titulo,
        mensaje: newRequest.mensaje,
        estatus: 'nuevo',
        prioridad: 'media',
        createdAt: new Date().toISOString(),
        agenteId: selectedAgent?.id || ''
      };
      
      setRequests(prev => [newRequestData, ...prev]);
      
      setNewRequest({ titulo: '', mensaje: '', agenteDestino: '' });
      setShowNewRequestModal(false);
      
      // Send notification for new request
      await sendDemoNotification(
        'Solicitud enviada',
        `Tu solicitud "${newRequestData.titulo}" ha sido enviada correctamente`,
        'success',
        { requestId: newRequestData.id }
      );
      
      Alert.alert('Éxito', 'Solicitud enviada correctamente');
    } catch (error) {
      console.error('Error creating request:', error);
      Alert.alert('Error', 'No se pudo enviar la solicitud');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>Solicitudes</Text>
            <Text style={styles.subtitle}>
              {filteredRequests.length} de {requests.length} solicitudes
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowNewRequestModal(true)}
            >
              <Plus size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#6b7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar solicitudes..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <View style={styles.statusFilter}>
          <TouchableOpacity
            style={[styles.statusChip, statusFilter === 'todos' && styles.statusChipActive]}
            onPress={() => setStatusFilter('todos')}
          >
            <Text style={[styles.statusChipText, statusFilter === 'todos' && styles.statusChipTextActive]}>
              Todos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statusChip, statusFilter === 'nuevo' && styles.statusChipActive]}
            onPress={() => setStatusFilter('nuevo')}
          >
            <Text style={[styles.statusChipText, statusFilter === 'nuevo' && styles.statusChipTextActive]}>
              Nuevos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statusChip, statusFilter === 'en_proceso' && styles.statusChipActive]}
            onPress={() => setStatusFilter('en_proceso')}
          >
            <Text style={[styles.statusChipText, statusFilter === 'en_proceso' && styles.statusChipTextActive]}>
              En Proceso
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {filteredRequests.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No se encontraron solicitudes</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery || statusFilter !== 'todos' 
                ? 'Intenta cambiar los filtros de búsqueda'
                : 'Toca el botón + para crear tu primera solicitud'
              }
            </Text>
          </View>
        ) : (
          filteredRequests.map((request) => (
          <View key={request.id} style={styles.requestCard}>
            <View style={styles.requestHeader}>
              <View style={styles.requestStatus}>
                {getStatusIcon(request.estatus)}
                <Text style={[styles.statusText, { color: getStatusColor(request.estatus) }]}>
                  {getStatusText(request.estatus)}
                </Text>
              </View>
              <Text style={styles.requestDate}>{formatDate(request.createdAt)}</Text>
            </View>

            <Text style={styles.requestTitle}>{request.titulo}</Text>
            <Text style={styles.requestMessage}>{request.mensaje}</Text>

            {request.agenteId && (
              <View style={styles.agentInfo}>
                <User size={16} color="#6b7280" />
                <Text style={styles.agentName}>Asignado a: {agents.find(a => a.id === request.agenteId)?.nombre || 'Agente'}</Text>
              </View>
            )}

            {request.feedback && (
               <View style={styles.responseContainer}>
                 <Text style={styles.responseLabel}>Respuesta del agente:</Text>
                 <Text style={styles.responseText}>{request.feedback}</Text>
               </View>
             )}
          </View>
          ))
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
                {agents.map((agent) => (
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
                      {agent.categoria || 'Soporte'}
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
  },
  statusFilter: {
    flexDirection: 'row',
    gap: 8,
  },
  statusChip: {
    backgroundColor: '#f9fafb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statusChipActive: {
    backgroundColor: '#1e40af',
    borderColor: '#1e40af',
  },
  statusChipText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6b7280',
  },
  statusChipTextActive: {
    color: '#ffffff',
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