import React from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { ScreenWrapper } from "../components/ScreenWrapper";
import { Bell, Menu } from "lucide-react-native";
import Greetings from "../components/home/Greetings";
import DateRow from "../components/home/DateRow";
import MotivationCard from "../components/home/MotivationCard";
import TodaysOverview from "../components/home/TodaysOverview";
import QuickActions from "../components/home/QuickActions";
import ActiveTimers from "../components/home/ActiveTimers";

export const HomeScreen = () => {
  return (
    <ScreenWrapper className="flex-1 bg-[#F8F9FA]">
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row justify-between items-center mt-4">
          <TouchableOpacity className="p-2 -ml-2">
            <Menu color="#334155" size={24} />
          </TouchableOpacity>
          <TouchableOpacity className="p-2 -mr-2">
            <Bell color="#334155" size={24} />
            <View className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </TouchableOpacity>
        </View>
        {/* Greeting */}
        <Greetings />
        {/* Date Row */}
        <DateRow />
        {/* Motivation Card */}
        <MotivationCard />
        {/* Today's Overview */}
        <TodaysOverview />
        {/* Quick Actions */}
        <QuickActions />
        {/* Active Timers */}
        <ActiveTimers />
      </ScrollView>
    </ScreenWrapper>
  );
};
