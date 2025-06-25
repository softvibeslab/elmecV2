import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    } else {
      router.replace('/auth');
    }
  }, [isAuthenticated]);

  return (
    <View style={styles.container}>
      <Text style={styles.loadingText}>Cargando...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e40af',
  },
  loadingText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
});