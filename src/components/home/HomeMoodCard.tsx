import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useStore } from "../../store/useStore";
import { format } from "date-fns";
import { useNavigation } from "@react-navigation/native";
import { MoodLogModal } from "../mood/MoodLogModal";
import { Heart, Plus, ChevronRight, Clock } from "lucide-react-native";
import { MoodLog } from "../../types";

export const HomeMoodCard: React.FC = () => {
  const navigation = useNavigation<any>();
  const { moodLogs } = useStore();
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todayLogs = moodLogs[todayStr] || [];
  const latestLog: MoodLog | undefined = todayLogs[0];

  const [modalVisible, setModalVisible] = useState(false);

  const handleNavigateToLogScreen = () => {
    navigation.navigate("MoodLogScreen");
  };

  const handleOpenNewModal = () => {
    setModalVisible(true);
  };

  return (
    <View className="mt-6">
      {/* Widget Header Row */}
      <View className="flex-row items-center justify-between mb-2.5 px-1">
        <View className="flex-row items-center">
          <Text className="text-lg font-bold text-slate-800">Mood Tracker</Text>
          {todayLogs.length > 0 && (
            <View className="bg-teal-50 px-2 py-0.5 rounded-full ml-2 border border-teal-100">
              <Text className="text-[10px] font-bold text-teal-700">
                {todayLogs.length} {todayLogs.length === 1 ? "log" : "logs"} today
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          onPress={handleOpenNewModal}
          className="flex-row items-center bg-teal-50 px-3 py-1 rounded-xl border border-teal-100/60"
        >
          <Plus color="#0F766E" size={14} />
          <Text className="text-xs font-bold text-teal-800 ml-1">Log Mood</Text>
        </TouchableOpacity>
      </View>

      {/* Main Card */}
      {latestLog ? (
        <TouchableOpacity
          onPress={handleNavigateToLogScreen}
          className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex-row items-center justify-between"
        >
          <View className="flex-row items-center flex-1 mr-3">
            <View className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 items-center justify-center mr-3.5">
              <Text className="text-2xl">{latestLog.mood}</Text>
            </View>

            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className="text-base font-bold text-slate-800 mr-2">
                  Feeling {getMoodLabel(latestLog.mood)}
                </Text>
                <View className="flex-row items-center bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                  <Clock color="#94A3B8" size={11} />
                  <Text className="text-[11px] text-slate-500 font-medium ml-1">
                    {format(new Date(latestLog.timestamp), "hh:mm a")}
                  </Text>
                </View>
              </View>

              {latestLog.tags && latestLog.tags.length > 0 ? (
                <Text className="text-xs text-slate-500 font-medium mt-1">
                  {latestLog.tags.slice(0, 3).join(" • ")}
                </Text>
              ) : latestLog.note ? (
                <Text
                  className="text-xs text-slate-500 font-normal mt-1"
                  numberOfLines={1}
                >
                  "{latestLog.note}"
                </Text>
              ) : (
                <Text className="text-xs text-slate-400 font-normal mt-1">
                  Tap to view history
                </Text>
              )}
            </View>
          </View>

          <ChevronRight color="#CBD5E1" size={20} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={handleNavigateToLogScreen}
          className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex-row items-center justify-between"
        >
          <View className="flex-row items-center flex-1 mr-2">
            <View className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 items-center justify-center mr-3.5">
              <Heart color="#F43F5E" size={22} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-slate-800">
                How are you feeling today?
              </Text>
              <Text className="text-xs text-slate-400 font-medium mt-0.5">
                Log your emotion and daily context
              </Text>
            </View>
          </View>

          <ChevronRight color="#CBD5E1" size={20} />
        </TouchableOpacity>
      )}

      {/* Quick Add Mood Log Modal */}
      <MoodLogModal
        visible={modalVisible}
        moodLog={null}
        date={todayStr}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};

const getMoodLabel = (emoji: string): string => {
  switch (emoji) {
    case "😄":
      return "Great";
    case "🙂":
      return "Good";
    case "😐":
      return "Okay";
    case "🙁":
      return "Bad";
    case "😭":
      return "Awful";
    default:
      return "Good";
  }
};
