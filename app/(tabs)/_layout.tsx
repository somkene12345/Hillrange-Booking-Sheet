import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import Sheet from './index';
import Analysis from './explore';

const Tab = createBottomTabNavigator();

export default function TabsLayout() {
  const { darkMode } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: darkMode ? '#222' : '#fff',
        },
        tabBarActiveTintColor: darkMode ? '#ffd700' : '#000',
        tabBarInactiveTintColor: darkMode ? '#888' : '#aaa',
        headerShown: false, // Drawer already has header
      }}
    >
      <Tab.Screen
        name="Sheet"
        component={Sheet}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Analysis"
        component={Analysis}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="analytics-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
