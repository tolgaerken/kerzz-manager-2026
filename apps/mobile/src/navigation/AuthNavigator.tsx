/**
 * Auth stack navigator
 */

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { OtpRequestScreen, OtpVerifyScreen } from "../screens/auth";
import type { AuthStackParamList } from "./types";

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="OtpRequest"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="OtpRequest" component={OtpRequestScreen} />
      <Stack.Screen name="OtpVerify" component={OtpVerifyScreen} />
    </Stack.Navigator>
  );
}
