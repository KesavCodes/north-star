import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStore } from "../store/useStore";
import { ChevronLeft, Flame, Award, Repeat } from "lucide-react-native";
import {
  calculateTaskStreak,
  calculateTaskBestStreak,
} from "../utils/streakUtils";

export const StreaksScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { tasks, logs, categories, firstUsedAt } = useStore();

  // Get all routine tasks
  const recurringTasks = useMemo(() => tasks["routine"] || [], [tasks]);

  // Top streak task (deterministic comparison: highest current streak, tie-broken by best streak)
  const topTask = useMemo(() => {
    if (recurringTasks.length === 0) return null;

    let bestMatch = null;
    let maxCur = -1;
    let maxBst = -1;

    for (const t of recurringTasks) {
      const cur = calculateTaskStreak(t, logs, undefined, firstUsedAt);
      const bst = calculateTaskBestStreak(t, logs, undefined, firstUsedAt);

      if (cur > maxCur || (cur === maxCur && bst > maxBst)) {
        maxCur = cur;
        maxBst = bst;
        bestMatch = { task: t, currentStreak: cur, bestStreak: bst };
      }
    }

    // Only show top task highlight card if a task has at least 1 day streak recorded
    if (bestMatch && (bestMatch.currentStreak > 0 || bestMatch.bestStreak > 0)) {
      return bestMatch;
    }

    return null;
  }, [recurringTasks, logs]);

  const getCategoryInfo = (categoryId: string) => {
    return (
      categories.find((c) => c.id === categoryId) || {
        name: "General",
        color: "#64748B",
        emoji: "📌",
      }
    );
  };

  const getDaysFormatted = (days?: number[]) => {
    if (!days || days.length === 0 || days.length === 7) return "Daily";
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days.map((d) => dayNames[d]).join(", ");
  };

  return (
    <SafeAreaView
      className="flex-1 bg-[#F8F9FA]"
      style={{
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
        paddingBottom: Math.max(insets.bottom, 16),
      }}
    >
      {/* Header */}
      <View className="flex-row justify-between items-center px-5 mt-6">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="p-2 -ml-2"
        >
          <ChevronLeft color="#334155" size={24} />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-800">
          Streaks
        </Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1 px-5 mt-5" showsVerticalScrollIndicator={false}>
        {/* Highlight Top Performing Routine */}
        {topTask && (
          <View className="mb-5">
            <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Top Performing Routine
            </Text>
            <View className="bg-gradient-to-r bg-white rounded-3xl p-5 shadow-xs border border-amber-200/60 relative overflow-hidden">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center flex-1 mr-2">
                  <View
                    className="w-10 h-10 rounded-2xl items-center justify-center mr-3"
                    style={{
                      backgroundColor: topTask.task.color
                        ? topTask.task.color + "20"
                        : "#FEF3C7",
                    }}
                  >
                    <Text className="text-base">
                      {getCategoryInfo(topTask.task.category).emoji}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-base font-bold text-slate-800"
                      numberOfLines={1}
                    >
                      {topTask.task.name}
                    </Text>
                    <View className="flex-row items-center gap-2 mt-1 flex-wrap">
                      <View
                        className="px-2 py-0.5 rounded-md"
                        style={{
                          backgroundColor:
                            (getCategoryInfo(topTask.task.category).color ||
                              "#64748B") + "18",
                        }}
                      >
                        <Text
                          className="text-[11px] font-semibold"
                          style={{
                            color:
                              getCategoryInfo(topTask.task.category).color ||
                              "#64748B",
                          }}
                          numberOfLines={1}
                        >
                          {getCategoryInfo(topTask.task.category).name}
                        </Text>
                      </View>
                      <Text
                        className="text-xs text-slate-400 font-medium"
                        numberOfLines={1}
                      >
                        {getDaysFormatted(topTask.task.daysOfWeek)}
                      </Text>
                    </View>
                  </View>
                </View>
                <Award color="#F59E0B" size={24} />
              </View>

              <View className="flex-row items-center justify-between bg-amber-50/60 rounded-2xl px-4 py-3 border border-amber-100">
                <View className="flex-row items-center">
                  <Flame color="#F59E0B" size={20} fill="#F59E0B" />
                  <Text className="text-lg font-extrabold text-slate-800 ml-2">
                    {topTask.currentStreak}{" "}
                    <Text className="text-xs text-slate-500 font-semibold">
                      current streak
                    </Text>
                  </Text>
                </View>
                <Text className="text-xs font-bold text-amber-700">
                  Best: {topTask.bestStreak}d
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Individual Recurring Routine Streaks */}
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-sm font-bold text-slate-800">
            Recurring Routines ({recurringTasks.length})
          </Text>
        </View>

        <View className="space-y-3 gap-1.5 mb-12">
          {recurringTasks.map((task) => {
            const currentStreak = calculateTaskStreak(task, logs, undefined, firstUsedAt);
            const bestStreak = calculateTaskBestStreak(task, logs, undefined, firstUsedAt);
            const categoryInfo = getCategoryInfo(task.category);
            const isStreakActive = currentStreak > 0;

            return (
              <View
                key={task.id}
                className="bg-white rounded-3xl px-4 py-3 shadow-xs border border-slate-100"
              >
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center flex-1 mr-3">
                    <View
                      className="w-10 h-10 rounded-2xl items-center justify-center mr-3"
                      style={{
                        backgroundColor: task.color
                          ? task.color + "20"
                          : "#F1F5F9",
                      }}
                    >
                      <Text className="text-base">{categoryInfo.emoji}</Text>
                    </View>
                    <View className="flex-1">
                      <Text
                        className="text-base font-bold text-slate-800"
                        numberOfLines={1}
                      >
                        {task.name}
                      </Text>
                      <View className="flex-row items-center gap-2 mt-1 flex-wrap">
                        <View
                          className="px-2 py-0.5 rounded-md"
                          style={{
                            backgroundColor:
                              (categoryInfo.color || "#64748B") + "18",
                          }}
                        >
                          <Text
                            className="text-[11px] font-semibold"
                            style={{
                              color: categoryInfo.color || "#64748B",
                            }}
                            numberOfLines={1}
                          >
                            {categoryInfo.name}
                          </Text>
                        </View>
                        <Text
                          className="text-xs text-slate-400 font-medium"
                          numberOfLines={1}
                        >
                          {getDaysFormatted(task.daysOfWeek)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View className="flex-row items-center">
                    <View className="items-end mr-3">
                      <View className="flex-row items-baseline">
                        <Text className="text-lg font-bold text-slate-800">
                          {currentStreak}
                        </Text>
                        <Text className="text-xs text-slate-500 font-semibold ml-1">
                          {currentStreak === 1 ? "day" : "days"}
                        </Text>
                      </View>
                      <Text className="text-[11px] text-slate-400 font-medium">
                        Best: {bestStreak}d
                      </Text>
                    </View>
                    <View
                      className={`w-9 h-9 rounded-2xl items-center justify-center ${isStreakActive
                        ? "bg-amber-50 border border-amber-100"
                        : "bg-slate-50 border border-slate-100"
                        }`}
                    >
                      <Flame
                        color={isStreakActive ? "#F59E0B" : "#94A3B8"}
                        size={18}
                        fill={isStreakActive ? "#F59E0B" : "transparent"}
                      />
                    </View>
                  </View>
                </View>
              </View>
            );
          })}

          {recurringTasks.length === 0 && (
            <View className="bg-white rounded-3xl p-6 border border-slate-100 items-center justify-center">
              <Repeat color="#94A3B8" size={32} className="mb-2" />
              <Text className="text-slate-700 font-bold text-base mb-1">
                No Recurring Routines Yet
              </Text>
              <Text className="text-slate-400 text-center text-xs px-4">
                Create a recurring daily or weekly task to start building consistency streaks!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
