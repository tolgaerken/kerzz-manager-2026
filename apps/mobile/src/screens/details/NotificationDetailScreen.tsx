/**
 * Notification detail screen - opened via deeplink or push notification
 */

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "NotificationDetail">;

export function NotificationDetailScreen({ route, navigation }: Props) {
  const { notificationId } = route.params;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Bildirim Detayı</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.idLabel}>Bildirim ID:</Text>
        <Text style={styles.idValue}>{notificationId}</Text>
        <Text style={styles.placeholder}>
          Bildirim detayları burada yüklenecek
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    paddingRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: "#2563eb",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  content: {
    flex: 1,
    padding: 24,
  },
  idLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  idValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 24,
  },
  placeholder: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});
