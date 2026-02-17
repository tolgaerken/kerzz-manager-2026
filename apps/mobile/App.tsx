/**
 * Kerzz Manager Mobile App
 * React Native application for iOS and Android
 */

import React from "react";
import { StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RootNavigator, navigationRef, linking } from "./src/navigation";
import { usePushNotifications } from "./src/hooks";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function AppContent(): React.JSX.Element {
  usePushNotifications();

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <NavigationContainer ref={navigationRef} linking={linking}>
        <RootNavigator />
      </NavigationContainer>
    </>
  );
}

function App(): React.JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

export default App;
