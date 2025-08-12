import { createDrawerNavigator } from '@react-navigation/drawer';
import { View, Text, StyleSheet } from 'react-native';
import HomeScreen from './index';
import ExplorePage from './explore';

const Drawer = createDrawerNavigator();

export default function RootLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Drawer.Navigator
        initialRouteName="Home"
        screenOptions={{
          drawerStyle: {
            backgroundColor: '#fff',
            width: 250,
          },
        }}
      >
        <Drawer.Screen name="Home" component={HomeScreen} options={{ title: 'Sheet' }} />
        <Drawer.Screen name="Search Notes" component={ExplorePage} options={{ title: 'Analysis' }} />
      </Drawer.Navigator>
      
      {/* Added footer only - no other changes */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Designed by Somkenenna Okechukwu</Text>
      </View>
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
    borderTopColor: '#eee'
  },
  footerText: {
    fontSize: 14,
    color: '#666'
  }
});