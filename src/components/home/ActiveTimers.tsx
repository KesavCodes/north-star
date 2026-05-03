import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";
import { Pause } from "lucide-react-native";

const ActiveTimers = () => {
  const navigation = useNavigation<any>();
  return (
    <View className="mt-8 mb-24">
      <Text className="text-base font-bold text-slate-800 mb-4">
        Currently Active Timers
      </Text>

      <TouchableOpacity
        onPress={() => navigation.navigate("TimerScreen")}
        className="bg-[#1E293B] rounded-3xl p-4 flex-row items-center justify-between shadow-md"
      >
        <View className="flex-row items-center">
          <View className="w-2 h-10 bg-[#2ECC71] rounded-full mr-4" />
          <View>
            <Text className="text-white font-semibold text-base">Coding</Text>
            <Text className="text-slate-400 font-medium text-sm mt-1">
              01:24:17
            </Text>
          </View>
        </View>

        <View className="bg-[#2ECC71] w-12 h-12 rounded-full items-center justify-center">
          <Pause color="#FFF" size={24} fill="#FFF" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default ActiveTimers;
