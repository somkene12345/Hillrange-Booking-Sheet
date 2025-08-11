import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from './index';
import ExplorePage from './explore';
import { useTheme } from '../../theme/ThemeContext';

const Drawer = createDrawerNavigator();

export default function RootLayout() {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <View style={{ flex: 1 }}>
      <Drawer.Navigator
        initialRouteName="Sheet"
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
        <Drawer.Screen name="Sheet" component={HomeScreen} />
        <Drawer.Screen name="Analysis" component={ExplorePage} />
      </Drawer.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
});
