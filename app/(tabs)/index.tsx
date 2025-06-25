import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { Users, FileText, Calculator, Clock, CircleCheck as CheckCircle, CircleAlert as AlertCircle } from 'lucide-react-native';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  const quickActions = [
    {
      title: 'Directorio',
      description: 'Buscar personal',
      icon: Users,
      color: '#3b82f6',
      route: '/directory',
    },
    {
      title: 'Nueva Solicitud',
      description: 'Crear solicitud',
      icon: FileText,
      color: '#10b981',
      route: '/requests',
    },
    {
      title: 'Calculadora',
      description: 'Herramientas',
      icon: Calculator,
      color: '#f59e0b',
      route: '/calculator',
    },
  ];

  const recentActivity = [
    {
      id: '1',
      type: 'solicitud',
      title: 'Solicitud de soporte técnico',
      status: 'en_proceso',
      time: '2 horas',
      agent: 'Carlos Mendoza',
    },
    {
      id: '2',
      type: 'solicitud',
      title: 'Consulta sobre facturación',
      status: 'resuelto',
      time: '1 día',
      agent: 'Ana García',
    },
    {
      id: '3',
      type: 'contacto',
      title: 'Llamada a ventas',
      status: 'completado',
      time: '3 días',
      agent: 'Luis Ramírez',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'en_proceso':
        return <Clock size={16} color="#f59e0b" />;
      case 'resuelto':
      case 'completado':
        return <CheckCircle size={16} color="#10b981" />;
      default:
        return <AlertCircle size={16} color="#ef4444" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'en_proceso':
        return 'En proceso';
      case 'resuelto':
        return 'Resuelto';
      case 'completado':
        return 'Completado';
      default:
        return 'Pendiente';
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={['#1e40af', '#3b82f6']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <Text style={styles.greeting}>¡Hola!</Text>
            <Text style={styles.userName}>
              {user?.nombre} {user?.apellidoPaterno}
            </Text>
            <Text style={styles.userCompany}>{user?.empresa}</Text>
          </View>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.nombre?.charAt(0)}{user?.apellidoPaterno?.charAt(0)}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accesos Rápidos</Text>
          <View style={styles.quickActions}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionCard}
                onPress={() => router.push(action.route as any)}
              >
                <View style={[styles.actionIcon, { backgroundColor: `${action.color}15` }]}>
                  <action.icon size={24} color={action.color} />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionDescription}>{action.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actividad Reciente</Text>
          <View style={styles.activityList}>
            {recentActivity.map((item) => (
              <View key={item.id} style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  {getStatusIcon(item.status)}
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{item.title}</Text>
                  <Text style={styles.activityAgent}>Con: {item.agent}</Text>
                  <View style={styles.activityMeta}>
                    <Text style={styles.activityStatus}>
                      {getStatusText(item.status)}
                    </Text>
                    <Text style={styles.activityTime}>hace {item.time}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estadísticas</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>5</Text>
              <Text style={styles.statLabel}>Solicitudes</Text>
              <Text style={styles.statSubLabel}>Este mes</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>2</Text>
              <Text style={styles.statLabel}>En proceso</Text>
              <Text style={styles.statSubLabel}>Activas</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Contactos</Text>
              <Text style={styles.statSubLabel}>Realizados</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  userCompany: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  avatarContainer: {
    marginLeft: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 24,
    marginTop: -16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    textAlign: 'center',
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 4,
  },
  activityAgent: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    marginBottom: 8,
  },
  activityMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityStatus: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  activityTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9ca3af',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1e40af',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 2,
  },
  statSubLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
});