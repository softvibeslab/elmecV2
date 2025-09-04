import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { Drill, Settings as SettingsIcon } from 'lucide-react-native';
import HeaderComponent from '@/components/HeaderComponent';

export default function CalculadoraScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { width, height } = Dimensions.get('window');

  const handleNavigation = (screenName: string) => {
    router.push(`/calculator/${screenName}` as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <HeaderComponent 
        title="Calculadora"
        showBackButton={true}
        showSecondButton={true}
        onSecondButtonPress={() => router.push('/calculator/SettingsCalculadora' as any)}
      />
      
      <View style={styles.content}>
        <TouchableOpacity
          style={styles.calculatorButton}
          onPress={() => handleNavigation('Barrenado')}
        >
          <LinearGradient colors={['#ffffff', '#f3f4f6']} style={styles.buttonGradient}>
            <View style={styles.buttonContent}>
              <Drill size={48} color="#1e40af" />
              <Text style={styles.buttonText}>{t('home:barrenado')}</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.calculatorButton}
          onPress={() => handleNavigation('Fresado')}
        >
          <LinearGradient colors={['#ffffff', '#f3f4f6']} style={styles.buttonGradient}>
            <View style={styles.buttonContent}>
              <SettingsIcon size={48} color="#1e40af" />
              <Text style={styles.buttonText}>{t('home:fresado')}</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
    justifyContent: 'center',
    gap: 32,
  },
  calculatorButton: {
    height: 120,
    marginHorizontal: '20%',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonGradient: {
    flex: 1,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContent: {
    alignItems: 'center',
    gap: 12,
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1e40af',
    textAlign: 'center',
  },
});