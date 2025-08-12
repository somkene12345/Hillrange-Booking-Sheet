// app/_layout.tsx
import { ThemeProvider, useTheme } from '../theme/ThemeContext';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Your screens
import Sheet from './Sheet';     // Rename index.tsx to Sheet.tsx
import Analysis from './Analysis'; // Rename explore.tsx to Analysis.tsx

const Drawer = createDrawerNavigator();

function DrawerScreens() {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <Drawer.Navigator
      initialRouteName="Sheet"
      screenOptions={{
        headerStyle: { backgroundColor: darkMode ? '#222' : '#fff' },
        headerTintColor: darkMode ? '#fff' : '#000',
        drawerStyle: { backgroundColor: darkMode ? '#222' : '#fff' },
        drawerActiveTintColor: darkMode ? '#ffd700' : '#000',
        drawerInactiveTintColor: darkMode ? '#aaa' : '#666',
        headerRight: () => (
          <TouchableOpacity onPress={toggleTheme} style={{ paddingRight: 15 }}>
            <Ionicons
              name={darkMode ? 'sunny-outline' : 'moon-outline'}
              size={24}
              color={darkMode ? '#ffd700' : '#555'}
            />
          </TouchableOpacity>
        ),
      }}
    >
      <Drawer.Screen name="Sheet" component={Sheet} />
      <Drawer.Screen name="Analysis" component={Analysis} />
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
