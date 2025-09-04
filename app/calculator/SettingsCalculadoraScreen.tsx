import React, { useState, useEffect } from 'react';
import { ScrollView, Text, Pressable, StyleSheet, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Check, Settings } from 'lucide-react-native';
import HeaderComponent from '@/components/HeaderComponent';

const MEDIDAS = [
  { code: 'mt', label: 'Métrico' },
  { code: 'im', label: 'Imperial' }
];

const VELOCIDAD = [
  { code: 'n', label: 'Normal' },
  { code: 'fn', label: 'Fast' }
];

export default function SettingsCalculadoraScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [selectedMedidaCode, setSelectedMedidaCode] = useState('mt');
  const [selectedVelocidadCode, setSelectedVelocidadCode] = useState('n');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const medida = await AsyncStorage.getItem('user-medida');
      const velocidad = await AsyncStorage.getItem('user-velocidad');
      
      if (medida) setSelectedMedidaCode(medida);
      if (velocidad) setSelectedVelocidadCode(velocidad);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const setMedida = async (code: string) => {
    setSelectedMedidaCode(code);
    await AsyncStorage.setItem('user-medida', code);
  };

  const setVelocidad = async (code: string) => {
    setSelectedVelocidadCode(code);
    await AsyncStorage.setItem('user-velocidad', code);
  };

  return (
    <SafeAreaView style={styles.container}>
      <HeaderComponent 
        title="Configuración"
        showBackButton={true}
      />
      
      <ScrollView style={styles.content}>
        <TouchableOpacity style={styles.mainButton} onPress={() => router.back()}>
          <Settings size={24} color="#1e40af" />
          <Text style={styles.mainButtonText}>{t('settings:ajustes')}</Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>{t('settings:medida')}:</Text>
          {MEDIDAS.map(medida => (
            <Pressable
              key={medida.code}
              style={[
                styles.optionButton,
                selectedMedidaCode === medida.code && styles.optionButtonSelected
              ]}
              onPress={() => setMedida(medida.code)}
            >
              <Text style={[
                styles.optionText,
                selectedMedidaCode === medida.code && styles.optionTextSelected
              ]}>
                {medida.label}
              </Text>
              {selectedMedidaCode === medida.code && (
                <Check size={20} color="#10b981" />
              )}
            </Pressable>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>{t('settings:velocidad')}:</Text>
          {VELOCIDAD.map(velocidad => (
            <Pressable
              key={velocidad.code}
              style={[
                styles.optionButton,
                selectedVelocidadCode === velocidad.code && styles.optionButtonSelected
              ]}
              onPress={() => setVelocidad(velocidad.code)}
            >
              <Text style={[
                styles.optionText,
                selectedVelocidadCode === velocidad.code && styles.optionTextSelected
              ]}>
                {velocidad.label}
              </Text>
              {selectedVelocidadCode === velocidad.code && (
                <Check size={20} color="#10b981" />
              )}
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  mainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  mainButtonText: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1e40af',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionButtonSelected: {
    borderColor: '#10b981',
    backgroundColor: '#ecfdf5',
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  optionTextSelected: {
    color: '#059669',
    fontFamily: 'Inter-SemiBold',
  },
});