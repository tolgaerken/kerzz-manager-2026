/**
 * Notification list item component
 */

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import type { ManagerNotification } from "@kerzz/shared";

interface Props {
  notification: ManagerNotification;
  onPress: (notification: ManagerNotification) => void;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Az önce";
  if (diffMins < 60) return `${diffMins} dk önce`;
  if (diffHours < 24) return `${diffHours} saat önce`;
  if (diffDays < 7) return `${diffDays} gün önce`;

  return date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
  });
}

function getEntityIcon(entityType: string): string {
  switch (entityType) {
    case "customer":
      return "👤";
    case "contract":
      return "📄";
    case "license":
      return "🔑";
    default:
      return "📋";
  }
}

export function NotificationItem({ notification, onPress }: Props) {
  return (
    <TouchableOpacity
      style={[styles.container, !notification.isRead && styles.unread]}
      onPress={() => onPress(notification)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{getEntityIcon(notification.entityType)}</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.sender} numberOfLines={1}>
            {notification.mentionedBy.name}
          </Text>
          <Text style={styles.time}>{formatDate(notification.createdAt)}</Text>
        </View>
        <Text style={styles.message} numberOfLines={2}>
          {notification.message}
        </Text>
        {notification.entityName && (
          <Text style={styles.entityName} numberOfLines={1}>
            {notification.entityName}
          </Text>
        )}
      </View>
      {!notification.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  unread: {
    backgroundColor: "#f8fafc",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  sender: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1a1a1a",
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 13,
    color: "#999",
  },
  message: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  entityName: {
    fontSize: 13,
    color: "#2563eb",
    marginTop: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2563eb",
    marginLeft: 8,
    alignSelf: "center",
  },
});
