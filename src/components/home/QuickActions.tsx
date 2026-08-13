import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";
import { BookOpen, Flame } from "lucide-react-native";

const QuickActions = () => {
  const navigation = useNavigation<any>();
  return (
    <View className="mt-3">
      <Text className="text-lg font-bold text-slate-800 mb-2">
        Quick Actions
      </Text>
      <View className="flex-row">
        <TouchableOpacity
          onPress={() => navigation.navigate("Journal")}
          className="flex-1 bg-blue-50 rounded-2xl py-3.5 flex-row items-center justify-center border border-blue-100 mr-1.5"
        >
          <BookOpen color="#3B82F6" size={18} />
          <Text className="text-sm font-semibold text-blue-600 ml-2">
            Log Journal
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("Streaks")}
          className="flex-1 bg-amber-50 rounded-2xl py-3.5 flex-row items-center justify-center border border-amber-100 ml-1.5"
        >
          <Flame color="#F59E0B" size={18} />
          <Text className="text-sm font-semibold text-amber-700 ml-2">
            View Streaks
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default QuickActions;
