import React from "react";
import { Text, View } from "react-native";
import { useStore } from "../../store/useStore";

const Greetings = () => {
  const { userInfo } = useStore();
  const getGreetings = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return "Good Morning";
    } else if (hour < 16) {
      return "Good Afternoon";
    } else if (hour < 20) {
      return "Good Evening";
    } else {
      return "Good Night";
    }
  };
  const getEmoji = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return "👋";
    } else if (hour < 16) {
      return "🌤️";
    } else if (hour < 20) {
      return "☕";
    } else {
      return "🌙";
    }
  };

  return (
    <View className="">
      <Text className="text-2xl font-bold text-slate-800">
        {getGreetings()}, {userInfo?.name || "User"} {getEmoji()}
      </Text>
      <Text className="text-md text-slate-500 font-medium mt-1">
        Focus on progress, not perfection.
      </Text>
    </View>
  );
};

export default Greetings;
