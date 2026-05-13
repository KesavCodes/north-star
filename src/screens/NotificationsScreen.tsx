import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Platform,
  StatusBar,
  SafeAreaView,
} from "react-native";
import * as Notifications from "expo-notifications";
import { ChevronLeft, Bell, BellOff, X } from "lucide-react-native";
import { formatDistanceToNow } from "date-fns";

interface NotificationItem {
  identifier: string;
  date: number;
  title: string | null | undefined;
  body: string | null | undefined;
}

export const NotificationsScreen = ({ navigation }: any) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const delivered = await Notifications.getPresentedNotificationsAsync();
        const mapped: NotificationItem[] = delivered
          .filter((n) => n.request.identifier !== "active-timer-notifications")
          .map((n) => ({
            identifier: n.request.identifier,
            date: n.date,
            title: n.request.content.title,
            body: n.request.content.body,
          }))
          .sort((a, b) => b.date - a.date)
          .slice(0, 30);
        setNotifications(mapped);
      } catch (e) {
        console.warn("Failed to load notifications", e);
      }
    };
    load();
  }, []);

  const dismissAll = async () => {
    await Notifications.dismissAllNotificationsAsync();
    setNotifications([]);
  };

  const dismissOne = async (identifier: string) => {
    await Notifications.dismissNotificationAsync(identifier);
    setNotifications((prev) => prev.filter((n) => n.identifier !== identifier));
  };

  return (
    <SafeAreaView
      className="flex-1 bg-[#F8F9FA]"
      style={{
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
      }}
    >
      {/* Header */}
      <View className="flex-row justify-between items-center px-5 mt-4 mb-6">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="p-2 -ml-2"
        >
          <ChevronLeft color="#334155" size={24} />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-800">Notifications</Text>
        {notifications.length > 0 ? (
          <TouchableOpacity onPress={dismissAll} className="p-2 -mr-2">
            <Text className="text-sm font-semibold text-red-400">
              Clear All
            </Text>
          </TouchableOpacity>
        ) : (
          <View className="w-10" />
        )}
      </View>

      {notifications.length === 0 ? (
        <View className="flex-1 items-center mt-48 px-8">
          <View className="w-20 h-20 bg-slate-100 rounded-full items-center justify-center mb-5">
            <BellOff color="#94A3B8" size={36} />
          </View>
          <Text className="text-slate-700 font-bold text-lg mb-2">
            All Caught Up
          </Text>
          <Text className="text-slate-400 text-sm text-center leading-6">
            You have no notifications right now. They'll appear here when
            something needs your attention.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.identifier}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
          ItemSeparatorComponent={() => (
            <View className="h-[1px] bg-slate-100 my-1" />
          )}
          renderItem={({ item }) => (
            <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-slate-50">
              <View className="flex-row items-start gap-3">
                <View className="w-9 h-9 bg-slate-100 rounded-full items-center justify-center mt-0.5">
                  <Bell color="#64748B" size={16} />
                </View>
                <View className="flex-1">
                  {item.title ? (
                    <Text className="text-slate-800 font-semibold text-sm mb-0.5">
                      {item.title}
                    </Text>
                  ) : null}
                  {item.body ? (
                    <Text className="text-slate-500 text-sm leading-5">
                      {item.body}
                    </Text>
                  ) : null}
                  <Text className="text-slate-400 text-xs mt-2">
                    {formatDistanceToNow(new Date(item.date), {
                      addSuffix: true,
                    })}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => dismissOne(item.identifier)}
                  className="p-1 -mt-0.5 -mr-0.5"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <X color="#94A3B8" size={16} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};
