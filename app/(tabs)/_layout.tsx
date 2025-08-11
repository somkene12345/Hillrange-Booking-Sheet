import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ThemeProvider, useTheme } from '../theme/ThemeContext';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from './index';
import ExplorePage from './explore';

const Drawer = createDrawerNavigator();
const Tab = createMaterialTopTabNavigator();

function TopTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarIndicatorStyle: { backgroundColor: '#fa0' },
      }}
    >
      <Tab.Screen name="Sheet" component={HomeScreen} />
      <Tab.Screen name="Analysis" component={ExplorePage} />
    </Tab.Navigator>
  );
}

function CustomDrawerContent(props: any) {
  return (
    <DrawerContentScrollView {...props}>
      <DrawerItem
        label="Sheet"
        onPress={() => props.navigation.navigate('MainTabs', { screen: 'Sheet' })}
      />
      <DrawerItem
        label="Analysis"
        onPress={() => props.navigation.navigate('MainTabs', { screen: 'Analysis' })}
      />
    </DrawerContentScrollView>
  );
}

function DrawerWrapper({ navigation }: any) {
  const { darkMode, toggleTheme } = useTheme();


  return (
    <View style={{ flex: 1 }}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        {/* Hamburger Menu */}
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={28} color={darkMode ? '#fff' : '#000'} />
        </TouchableOpacity>

        <Text style={styles.topBarTitle}>Mednote Style</Text>

        {/* Theme Toggle */}
        <TouchableOpacity onPress={toggleTheme}>
          <Ionicons
            name={darkMode ? 'sunny-outline' : 'moon-outline'}
            size={26}
            color={darkMode ? '#ffd700' : '#555'}
          />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <TopTabs />

    </View>
  );
}

export default function Layout() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Drawer.Navigator
          drawerContent={(props) => <CustomDrawerContent {...props} />}
          screenOptions={{ headerShown: false }}
        >
          <Drawer.Screen name="MainTabs" component={DrawerWrapper} />
        </Drawer.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  topBar: {
    height: 50,
    backgroundColor: '#fa0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  topBarTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#000',
  },
});
