import { View, Text, Image } from "react-native";
import React from "react";

const MotivationCard = () => {
  return (
    <View className="bg-[#fdf5e0] rounded-3xl pl-6 pr-3 py-2 mt-6 flex-row justify-between shadow-sm overflow-hidden">
      <View className="flex justify-center">
        <Text className="text-lg mb-1 font-bold">Keep going!</Text>
        <Text className="text-sm font-medium text-slate-600 mt-1">
          Small actions, big change.
        </Text>
      </View>
      <Image
        source={require("../../../assets/plant.png")}
        className="w-32 h-32 mb-[-26px]"
        resizeMode="contain"
      />
    </View>
  );
};

export default MotivationCard;
