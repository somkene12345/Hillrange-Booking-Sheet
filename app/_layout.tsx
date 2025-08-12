import { ThemeProvider, useTheme } from '../theme/ThemeContext';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import TabsLayout from './(tabs)/_layout';
import { View, TouchableOpacity } from 'react-native';

const Drawer = createDrawerNavigator();

function DrawerScreens() {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <Drawer.Navigator
      screenOptions={{
        drawerStyle: {
          backgroundColor: darkMode ? '#222' : '#fff',
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
      <Drawer.Screen
        name="MainTabs"
        component={TabsLayout}
        options={{
          title: 'Sheet & Analysis',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="albums-outline" size={size} color={color} />
          ),
        }}
      />
      {/* You can add other drawer-only screens here */}
    </Drawer.Navigator>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <DrawerScreens />
    </ThemeProvider>
  );
}
