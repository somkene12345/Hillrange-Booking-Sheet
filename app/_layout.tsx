// app/_layout.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Sheet from './index';
import Analysis from './explore';

const Tab = createBottomTabNavigator();

export default function RootLayout() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tab.Screen name="Sheet" component={Sheet} />
        <Tab.Screen name="Analysis" component={Analysis} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
