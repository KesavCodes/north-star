import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";
import { BookOpen, TrendingUp } from "lucide-react-native";

const QuickActions = () => {
  const navigation = useNavigation<any>();
  return (
    <View className="mt-8">
      <Text className="text-lg font-bold text-slate-800 mb-4">
        Quick Actions
      </Text>
      <View className="flex-row space-x-4">
        <TouchableOpacity
          onPress={() => navigation.navigate("Journal")}
          className="flex-1 bg-[#F0F5FF] rounded-2xl py-3.5 flex-row items-center justify-center border border-blue-100 mr-2"
        >
          <BookOpen color="#3B82F6" size={18} />
          <Text className="text-sm font-semibold text-blue-600 ml-2">
            Log Journal
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("Analytics")}
          className="flex-1 bg-[#F5F0FF] rounded-2xl py-3.5 flex-row items-center justify-center border border-purple-100 ml-2"
        >
          <TrendingUp color="#8B5CF6" size={18} />
          <Text className="text-sm font-semibold text-purple-600 ml-2">
            View Analytics
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default QuickActions;
