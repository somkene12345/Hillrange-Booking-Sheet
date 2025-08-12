import { createDrawerNavigator } from '@react-navigation/drawer';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeProvider, useTheme } from '../theme/ThemeContext';
import TabsLayout from './(tabs)/_layout';

const Drawer = createDrawerNavigator();

function DrawerContent() {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <Drawer.Navigator
      initialRouteName="Tabs"
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
          <TouchableOpacity onPress={toggleTheme} style={{ paddingRight: 15 }}>
            <Ionicons
              name={darkMode ? 'sunny-outline' : 'moon-outline'}
              size={26}
              color={darkMode ? '#ffd700' : '#555'}
            />
          </TouchableOpacity>
        ),
      }}
    >
      <Drawer.Screen name="Tabs" component={TabsLayout} options={{ title: 'Mednote' }} />
    </Drawer.Navigator>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <DrawerContent />
    </ThemeProvider>
  );
}
