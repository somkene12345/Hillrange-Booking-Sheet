import React from 'react';
import { Drawer } from 'expo-router/drawer';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeProvider, useTheme } from '../theme/ThemeContext';
import HomeScreen from './index';
import ExplorePage from './explore';

function DrawerScreens() {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <Drawer
      screenOptions={{
        drawerStyle: {
          backgroundColor: darkMode ? '#222' : '#fff',
          width: 250,
        },
        headerStyle: {
          backgroundColor: darkMode ? '#222' : '#fff',
        },
        headerTintColor: darkMode ? '#fff' : '#000',
        headerRight: () => (
          <TouchableOpacity
            onPress={toggleTheme}
            style={{ paddingRight: 15 }}
          >
            <Ionicons
              name={darkMode ? 'sunny-outline' : 'moon-outline'}
              size={26}
              color={darkMode ? '#ffd700' : '#555'}
            />
          </TouchableOpacity>
        ),
      }}
    >
<Drawer.Screen name="(tabs)/index" options={{ title: 'Sheet' }} />
<Drawer.Screen name="(tabs)/explore" options={{ title: 'Analysis' }} />
    </Drawer>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <DrawerScreens />
    </ThemeProvider>
  );
}
yyy