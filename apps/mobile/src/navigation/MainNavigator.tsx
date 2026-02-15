/**
 * Main tab navigator for authenticated users
 */

import React, { useCallback } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, StyleSheet } from "react-native";
import { HomeScreen, ProfileScreen } from "../screens/main";
import { NotificationsScreen } from "../screens/notifications";
import type { MainTabParamList } from "./types";

const Tab = createBottomTabNavigator<MainTabParamList>();

const icons: Record<string, string> = {
  Home: "🏠",
  Notifications: "🔔",
  Profile: "👤",
};

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  return (
    <Text style={[styles.icon, focused && styles.iconFocused]}>
      {icons[name] || "•"}
    </Text>
  );
}

export function MainNavigator() {
  const renderTabIcon = useCallback(
    (routeName: string) =>
      ({ focused }: { focused: boolean }) => (
        <TabIcon name={routeName} focused={focused} />
      ),
    []
  );

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: renderTabIcon(route.name),
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "#666",
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: "Ana Sayfa" }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ tabBarLabel: "Bildirimler" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: "Profil" }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingTop: 8,
    paddingBottom: 8,
    height: 60,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  icon: {
    fontSize: 24,
  },
  iconFocused: {
    transform: [{ scale: 1.1 }],
  },
});
