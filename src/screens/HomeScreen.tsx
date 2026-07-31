import React, { useState, useEffect } from "react";
import { View, ScrollView, TouchableOpacity, AppState } from "react-native";
import { ScreenWrapper } from "../components/ScreenWrapper";
import { Bell, Menu } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import Greetings from "../components/home/Greetings";
import DateRow from "../components/home/DateRow";
// import MotivationCard from "../components/home/MotivationCard";
import TodaysOverview from "../components/home/TodaysOverview";
import QuickActions from "../components/home/QuickActions";
import CurrentDayTimers from "../components/home/CurrentDayTimers";

export const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const [hasUnread, setHasUnread] = useState(false);

  const checkNotifications = async () => {
    try {
      const delivered = await Notifications.getPresentedNotificationsAsync();
      const relevant = delivered.filter(
        (n) => n.request.identifier !== "active-timer-notification",
      );
      setHasUnread(relevant.length > 0);
    } catch {
      setHasUnread(false);
    }
  };

  useEffect(() => {
    // Check on mount
    checkNotifications();
    // Re-check whenever the app comes back to the foreground
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") checkNotifications();
    });
    return () => sub.remove();
  }, []);
  return (
    <ScreenWrapper className="flex-1 bg-[#F8F9FA]">
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row justify-end items-center mt-4">
          {/* <TouchableOpacity className="p-2 -ml-2">
            <Menu color="#334155" size={24} />
          </TouchableOpacity> */}
          <TouchableOpacity
            className="p-2 -mr-2"
            onPress={() => navigation.navigate("Notifications")}
          >
            <Bell color="#334155" size={24} />
            {hasUnread && (
              <View className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </TouchableOpacity>
        </View>
        {/* Greeting */}
        <Greetings />
        {/* Date Row */}
        <DateRow />
        {/* Motivation Card */}
        {/* <MotivationCard /> */}
        {/* Today's Overview */}
        <TodaysOverview />
        {/* Quick Actions */}
        <QuickActions />
        {/* Today's Timers Overview */}
        <CurrentDayTimers />
      </ScrollView>
    </ScreenWrapper>
  );
};
