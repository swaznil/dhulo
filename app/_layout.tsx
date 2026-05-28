import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import ErrorBoundary from '@/components/error-boundary';
import { DhuloStoreProvider } from '@/context/dhulo-store';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: 'index',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <DhuloStoreProvider>
        <ErrorBoundary>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="light" />
        </ErrorBoundary>
      </DhuloStoreProvider>
    </ThemeProvider>
  );
}
