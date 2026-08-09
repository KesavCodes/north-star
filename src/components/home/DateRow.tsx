import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import {
  Calendar,
  //  ChevronDown
} from "lucide-react-native";
import { format } from "date-fns";
import { useNavigation } from "@react-navigation/native";

const DateRow = () => {
  const navigation = useNavigation<any>();
  const today = format(new Date(), "dd MMM, yyyy");
  return (
    <View className="flex-row justify-between items-center mt-5">
      <View>
        <View className="flex-row items-center">
          <Text className="text-lg font-bold text-slate-800">Today</Text>
          {/* <ChevronDown color="#334155" size={16} className="ml-1" /> */}
        </View>
        <Text className="text-md font-medium text-slate-500 mt-1">{today}</Text>
      </View>
      <TouchableOpacity
        className="bg-white p-3 rounded-xl shadow-sm border border-slate-100"
        onPress={() => navigation.navigate("CalendarHeatmap")}
      >
        <Calendar color="#334155" size={20} />
      </TouchableOpacity>
    </View>
  );
};

export default DateRow;
