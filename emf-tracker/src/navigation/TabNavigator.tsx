import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { COLORS } from '../constants/colors';
import LiveScreen from '../screens/LiveScreen';
import ChartScreen from '../screens/ChartScreen';
import SessionsScreen from '../screens/SessionsScreen';
import AboutScreen from '../screens/AboutScreen';

const Tab = createBottomTabNavigator();

function TabIcon({ icon, focused }: { icon: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{icon}</Text>
  );
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.surface, borderBottomWidth: 0 },
        headerTintColor: COLORS.textPrimary,
        headerTitleStyle: { fontFamily: 'monospace', letterSpacing: 2, fontSize: 13 },
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarLabelStyle: { fontFamily: 'monospace', fontSize: 10, letterSpacing: 1 },
      }}
    >
      <Tab.Screen
        name="Live"
        component={LiveScreen}
        options={{
          title: 'LIVE',
          headerTitle: 'EMF TRACKER',
          tabBarIcon: ({ focused }) => <TabIcon icon="📡" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Chart"
        component={ChartScreen}
        options={{
          title: 'CHART',
          headerTitle: 'FIELD HISTORY',
          tabBarIcon: ({ focused }) => <TabIcon icon="📊" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Sessions"
        component={SessionsScreen}
        options={{
          title: 'SESSIONS',
          headerTitle: 'SESSION LOG',
          tabBarIcon: ({ focused }) => <TabIcon icon="📋" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="About"
        component={AboutScreen}
        options={{
          title: 'ABOUT',
          headerTitle: 'ABOUT EMF TRACKER',
          tabBarIcon: ({ focused }) => <TabIcon icon="ℹ️" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}
