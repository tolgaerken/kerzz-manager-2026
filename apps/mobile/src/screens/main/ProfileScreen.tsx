/**
 * Profile screen
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../../store/authStore";

export function ProfileScreen() {
  const { userInfo, activeLicance, logout, setActiveLicance } = useAuthStore();

  const handleLicanceChange = (licance: typeof activeLicance) => {
    if (licance) {
      setActiveLicance(licance);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userInfo?.name?.charAt(0).toUpperCase() || "U"}
            </Text>
          </View>
          <Text style={styles.userName}>{userInfo?.name}</Text>
          <Text style={styles.userEmail}>{userInfo?.mail}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lisanslar</Text>
          {userInfo?.licances.map((licance) => (
            <TouchableOpacity
              key={licance.id}
              style={[
                styles.licanceItem,
                activeLicance?.id === licance.id && styles.licanceItemActive,
              ]}
              onPress={() => handleLicanceChange(licance)}
            >
              <View style={styles.licanceInfo}>
                <Text style={styles.licanceBrand}>{licance.brand}</Text>
                <Text style={styles.licanceStatus}>
                  {licance.isSuspend
                    ? "Askıda"
                    : licance.active
                      ? "Aktif"
                      : "Pasif"}
                </Text>
              </View>
              {activeLicance?.id === licance.id && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hesap</Text>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Ayarlar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Yardım</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={logout}>
            <Text style={[styles.menuItemText, styles.logoutText]}>
              Çıkış Yap
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: "#666",
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    textTransform: "uppercase",
    marginBottom: 12,
  },
  licanceItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  licanceItemActive: {
    borderWidth: 2,
    borderColor: "#2563eb",
  },
  licanceInfo: {
    flex: 1,
  },
  licanceBrand: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  licanceStatus: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  checkmark: {
    fontSize: 20,
    color: "#2563eb",
    fontWeight: "bold",
  },
  menuItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  menuItemText: {
    fontSize: 16,
    color: "#1a1a1a",
  },
  logoutText: {
    color: "#dc2626",
  },
});
