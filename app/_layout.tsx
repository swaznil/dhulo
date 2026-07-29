import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { BrandLoader } from '@/components/brand-loader';
import ErrorBoundary from '@/components/error-boundary';
import { DhuloStoreProvider, useSettings } from '@/context/dhulo-store';
import { useColorScheme } from '@/hooks/use-color-scheme';

SplashScreen.preventAutoHideAsync().catch(() => undefined);
SplashScreen.setOptions({ duration: 420, fade: true });

export const unstable_settings = {
  anchor: 'index',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <DhuloStoreProvider>
        <ErrorBoundary>
          <AppReady />
        </ErrorBoundary>
      </DhuloStoreProvider>
    </ThemeProvider>
  );
}

function AppReady() {
  const { hydrated } = useSettings();
  const [minimumShown, setMinimumShown] = useState(false);

  useEffect(() => {
    SplashScreen.hide();
    const timer = setTimeout(() => setMinimumShown(true), 520);
    return () => clearTimeout(timer);
  }, []);

  if (!hydrated || !minimumShown) {
    return (
      <>
        <BrandLoader />
        <StatusBar style="light" />
      </>
    );
  }

  return (
    <>
      <Stack screenOptions={{ animation: 'fade', contentStyle: { backgroundColor: '#030405' } }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}
