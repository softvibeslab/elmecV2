import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { FirebaseAuthProvider } from '@/contexts/FirebaseAuthContext';
import { FirebaseNotificationProvider } from '@/contexts/FirebaseNotificationContext';
import { FirebaseChatProvider } from '@/contexts/FirebaseChatContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { NotificationManager } from '@/components/NotificationToast';
import { AnalyticsProvider } from '@/components/AnalyticsProvider';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();
  
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <FirebaseAuthProvider>
      <NotificationProvider>
        <FirebaseNotificationProvider>
          <FirebaseChatProvider>
            <AnalyticsProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="auth" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
              </Stack>
              <StatusBar style="auto" />
              <NotificationManager />
            </AnalyticsProvider>
          </FirebaseChatProvider>
        </FirebaseNotificationProvider>
      </NotificationProvider>
    </FirebaseAuthProvider>
  );
}