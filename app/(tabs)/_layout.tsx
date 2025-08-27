import React from 'react';
import { ThemeProvider } from '../../theme/ThemeContext'; // ✅ import your ThemeProvider
  import { View, Text } from 'react-native';
  import { Stack } from 'expo-router';

  export default function Layout() {
    return (
    <ThemeProvider>
      <Stack>
        <Stack.Screen name="index" />
        <Stack.Screen name="explore" />
      </Stack>
    </ThemeProvider>
    );
  }