import React from "react";
import { Text, View } from "react-native";
import { useStore } from "../../store/useStore";

const Greetings = () => {
  const { userInfo } = useStore();

  return (
    <View className="mt-4">
      <Text className="text-2xl font-bold text-slate-800">
        Good morning, {userInfo?.name || "User"} 👋
      </Text>
      <Text className="text-md text-slate-500 font-medium mt-1">
        Focus on progress, not perfection.
      </Text>
    </View>
  );
};

export default Greetings;
