import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { children: React.ReactNode };

export default class ErrorBoundary extends React.Component<Props, { hasError: boolean; error?: any }> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: any) {
    // Minimal crash logging; users can replace with Sentry or similar.
    console.error('ErrorBoundary caught', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>The app encountered an error. Try reloading or return to notes.</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => this.setState({ hasError: false, error: undefined })}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Try again</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    marginBottom: 18,
    textAlign: 'center',
    color: '#666',
  },
  button: {
    backgroundColor: '#111',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '800',
  },
});
