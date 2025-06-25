import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import FirebaseService from '../services/firebaseService';
import { UserPresence } from '../types/firebase';

interface PresenceIndicatorProps {
  userId: string;
  showStatus?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({ 
  userId, 
  showStatus = false, 
  size = 'medium' 
}) => {
  const [presence, setPresence] = useState<UserPresence | null>(null);

  useEffect(() => {
    const unsubscribe = FirebaseService.subscribeToPresence((presenceData) => {
      setPresence(presenceData[userId] || null);
    });

    return unsubscribe;
  }, [userId]);

  const getStatusColor = () => {
    if (!presence) return '#9ca3af';
    
    switch (presence.status) {
      case 'available':
        return '#10b981';
      case 'busy':
        return '#ef4444';
      case 'away':
        return '#f59e0b';
      default:
        return '#9ca3af';
    }
  };

  const getStatusText = () => {
    if (!presence) return 'Desconectado';
    
    if (presence.isOnline) {
      switch (presence.status) {
        case 'available':
          return 'En línea';
        case 'busy':
          return 'Ocupado';
        case 'away':
          return 'Ausente';
        default:
          return 'En línea';
      }
    }
    
    const lastSeen = new Date(presence.lastSeen);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60));
    
    if (diffMinutes < 5) {
      return 'Hace un momento';
    } else if (diffMinutes < 60) {
      return `Hace ${diffMinutes} min`;
    } else if (diffMinutes < 1440) {
      const hours = Math.floor(diffMinutes / 60);
      return `Hace ${hours} h`;
    } else {
      return lastSeen.toLocaleDateString();
    }
  };

  const sizeStyles = {
    small: { width: 8, height: 8 },
    medium: { width: 12, height: 12 },
    large: { width: 16, height: 16 }
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.indicator,
          sizeStyles[size],
          { backgroundColor: getStatusColor() }
        ]}
      />
      {showStatus && (
        <Text style={styles.statusText}>{getStatusText()}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  indicator: {
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
});