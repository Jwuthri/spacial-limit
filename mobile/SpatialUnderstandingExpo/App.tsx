import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import { RootStackParamList } from './src/types';
import { COLORS } from './src/constants';

const Tab = createBottomTabNavigator<RootStackParamList>();

export default function App() {
  return (
    <>
      <StatusBar style="light" backgroundColor={COLORS.primary} />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: COLORS.primary,
            tabBarInactiveTintColor: COLORS.textSecondary,
            tabBarStyle: {
              backgroundColor: COLORS.surface,
              borderTopColor: COLORS.border,
            },
            headerStyle: {
              backgroundColor: COLORS.primary,
            },
            headerTintColor: COLORS.surface,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{
              title: 'Spatial Analysis',
              tabBarLabel: 'Home',
            }}
          />
          <Tab.Screen
            name="History" 
            component={HistoryScreen}
            options={{
              title: 'Analysis History',
              tabBarLabel: 'History',
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
      <Toast />
    </>
  );
}
