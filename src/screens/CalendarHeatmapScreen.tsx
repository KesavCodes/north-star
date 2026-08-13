import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  ScrollView,
} from "react-native";
import { useStore } from "../store/useStore";
import {
  format,
  parseISO,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Circle,
  Flame,
  Heart,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Task } from "../types";
import { useResetScrollOnFocus } from "../hooks/useResetScrollOnFocus";
import {
  calculateTaskStreak,
  calculateTaskBestStreak,
} from "../utils/streakUtils";

export const CalendarHeatmapScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { logs, getTasksForDate, categories, tasks, firstUsedAt } = useStore();
  const routineTasks = useMemo(() => tasks["routine"] || [], [tasks]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const scrollRef = useResetScrollOnFocus<ScrollView>();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const dateFormat = "MMMM yyyy";
  const days = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const archivedCategoryIds = useMemo(() => categories.filter(c => c.isArchived).map(c => c.id), [categories]);

  const monthlyTaskData = eachDayOfInterval({
    start: monthStart,
    end: monthEnd,
  }).reduce((acc: any, day) => {
    const dateStr = format(day, "yyyy-MM-dd");
    acc[dateStr] = getTasksForDate(dateStr).filter((t: Task) => !archivedCategoryIds.includes(t.category));
    return acc;
  }, {});

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const getDaysFormatted = (days?: number[]) => {
    if (!days || days.length === 0 || days.length === 7) return "Daily";
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days.map((d) => dayNames[d]).join(", ");
  };

  const streaks = useMemo(() => {
    const calc = (category: string) => {
      let current = 0;
      let best = 0;

      const allCategoryTasks = Object.values(useStore.getState().tasks)
        .flat()
        .filter((t) => t.category === category);

      if (allCategoryTasks.length === 0) return { current: 0, best: 0 };

      const taskCreatedDates = allCategoryTasks.map((t) =>
        format(new Date(t.createdAt), "yyyy-MM-dd"),
      );
      const logDates = Object.values(logs)
        .filter((l: any) => {
          const t = allCategoryTasks.find((task) => task.id === l.taskId);
          return !!t;
        })
        .map((l: any) => l.date)
        .filter((date: any) => date && /^\d{4}-\d{2}-\d{2}$/.test(date));

      const allDates = [...taskCreatedDates, ...logDates].sort((a, b) =>
        a.localeCompare(b),
      );
      if (allDates.length === 0) return { current: 0, best: 0 };

      const earliestDateStr = allDates[0];
      const todayDate = new Date();
      const todayStr = format(todayDate, "yyyy-MM-dd");

      if (earliestDateStr > todayStr) return { current: 0, best: 0 };

      const daysToCheck = eachDayOfInterval({
        start: parseISO(earliestDateStr),
        end: todayDate,
      });

      daysToCheck.forEach((day) => {
        const dateStr = format(day, "yyyy-MM-dd");
        const activeTasks = getTasksForDate(dateStr).filter((t: Task) => {
          if (t.category !== category) return false;
          const createdDateStr = format(new Date(t.createdAt), "yyyy-MM-dd");
          if (dateStr < createdDateStr) return false;
          if (!t.isRoutine) return t.date === dateStr;
          return true;
        });

        // If no tasks scheduled for this category on this day (off-day), skip without breaking streak
        if (activeTasks.length === 0) return;

        const completedCount = activeTasks.filter(
          (t: Task) => logs[`${t.id}-${dateStr}`]?.completed,
        ).length;

        if (completedCount === activeTasks.length) {
          current++;
          best = Math.max(best, current);
        } else {
          if (dateStr !== todayStr) {
            current = 0;
          }
        }
      });

      return { current, best };
    };

    const categoryStreaks: Record<string, { current: number; best: number }> =
      {};
    categories
      .filter((c) => !c.isArchived)
      .forEach((cat) => {
        categoryStreaks[cat.id] = calc(cat.id);
      });
    return categoryStreaks;
  }, [logs, getTasksForDate, categories]);

  const getDayColor = (dateStr: string) => {
    const currentDateStr = format(new Date(), "yyyy-MM-dd");
    const dailyLogs = monthlyTaskData[dateStr]?.filter((item: Task) => {
      if (!item.isRoutine) return true;
      const createdDateStr = format(new Date(item.createdAt), "yyyy-MM-dd");
      return dateStr >= createdDateStr && dateStr <= currentDateStr;
    });
    if (!dailyLogs || dailyLogs.length === 0)
      return "bg-slate-50 border-slate-100";
    const completedTasks = dailyLogs.filter(
      (log: any) => logs[`${log.id}-${dateStr}`]?.completed,
    ).length;
    // console.log(dateStr, completedTasks, dailyLogs.length);
    if (completedTasks === 0) return "bg-red-100 border-red-200";
    if (completedTasks < dailyLogs.length)
      return "bg-yellow-100 border-yellow-200"; // Partial
    return "bg-[#2ECC71] border-[#2ECC71]"; // Great Day (all attempted were completed)
  };

  return (
    <SafeAreaView
      className="flex-1 bg-[#F8F9FA]"
      style={{
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
        // paddingBottom: Math.max(insets.bottom, 16),
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
        <Text className="text-lg font-bold text-slate-800">Calendar</Text>
        <View className="w-8" />
      </View>

      <ScrollView
        ref={scrollRef}
        className="flex-1 px-5 mt-5"
        showsVerticalScrollIndicator={false}
      >
        {/* Month Selector */}
        <View className="flex-row justify-between items-center mb-5">
          <TouchableOpacity onPress={prevMonth} className="p-2">
            <ChevronLeft color="#334155" size={20} />
          </TouchableOpacity>
          <Text className="text-base font-bold text-slate-800">
            {format(currentDate, dateFormat)}
          </Text>
          <TouchableOpacity onPress={nextMonth} className="p-2">
            <ChevronRight color="#334155" size={20} />
          </TouchableOpacity>
        </View>

        {/* Days Header */}
        <View className="flex-row justify-between mb-4">
          {days
            .map((day) => format(day, "eee"))
            .slice(0, 7)
            .map((d, idx) => (
              <Text
                key={`${d}-${idx}`}
                className="text-xs font-semibold text-slate-400 w-10 text-center"
              >
                {d}
              </Text>
            ))}
        </View>

        {/* Calendar Grid */}
        <View>
          {Array.from({ length: Math.ceil(days.length / 7) }).map(
            (_, rowIndex) => (
              <View key={rowIndex} className="flex-row justify-between w-full">
                {days.slice(rowIndex * 7, (rowIndex + 1) * 7).map((day) => {
                  const dateStr = format(day, "yyyy-MM-dd");
                  const colorClass = getDayColor(dateStr);
                  const isCurrentMonth = isSameMonth(day, monthStart);
                  const isTodayDate = isToday(day);
                  return (
                    <TouchableOpacity
                      key={day.toISOString()}
                      onPress={() =>
                        navigation.navigate("DayDetails", { date: dateStr })
                      }
                      className={`w-10 h-10 mb-4 rounded-full relative
                        items-center justify-center border 
                        ${isCurrentMonth ? colorClass : "bg-transparent border-transparent opacity-30"}`}
                    >
                      <Text
                        className={`text-sm font-medium 
                          ${colorClass.includes("bg-[#2ECC71]") ? "text-white" : "text-slate-700"}`}
                      >
                        {format(day, "d")}
                      </Text>
                      {isTodayDate && (
                        <View className="absolute -top-1 -right-1 bg-white rounded-full p-[1px]">
                          <Circle color="#3B82F6" size={12} fill="#3B82F6" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ),
          )}
        </View>

        {/* Legend */}
        <View className="flex-row justify-between items-center pt-5 border-t border-slate-200">
          <View className="flex-row items-center">
            <View className="w-2 h-2 rounded-full bg-[#2ECC71] mr-1" />
            <Text className="text-[10px] text-slate-500">Great Day</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-2 h-2 rounded-full bg-yellow-400 mr-1" />
            <Text className="text-[10px] text-slate-500">Partial Day</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-2 h-2 rounded-full bg-red-400 mr-1" />
            <Text className="text-[10px] text-slate-500">Missed Day</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-2 h-2 rounded-full bg-slate-200 mr-1" />
            <Text className="text-[10px] text-slate-500">No Data</Text>
          </View>
        </View>

        {/* Current Streaks Section matching StreaksScreen UI */}
        <View className="mt-6 mb-12">
          <View className="flex-row items-center justify-between mb-3 px-1">
            <Text className="text-base font-bold text-slate-800">
              Current Streaks ({routineTasks.length})
            </Text>
          </View>

          <View className="space-y-3 gap-2">
            {routineTasks.map((task) => {
              const currentStreak = calculateTaskStreak(
                task,
                logs,
                undefined,
                firstUsedAt,
              );
              const bestStreak = calculateTaskBestStreak(
                task,
                logs,
                undefined,
                firstUsedAt,
              );
              const categoryInfo = categories.find(
                (c) => c.id === task.category,
              ) || {
                name: "General",
                color: "#64748B",
                emoji: "📌",
              };
              const isStreakActive = currentStreak > 0;

              return (
                <View
                  key={task.id}
                  className="bg-white rounded-3xl px-4 py-3.5 shadow-xs border border-slate-100"
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
                          <Text className="text-xl font-extrabold text-slate-800">
                            {currentStreak}{" "}
                          </Text>
                          <Text className="text-xs font-semibold text-slate-500">
                            {currentStreak === 1 ? "day" : "days"}
                          </Text>
                        </View>
                        <Text className="text-[10px] text-slate-400 font-medium mt-0.5">
                          Best: {bestStreak}d
                        </Text>
                      </View>
                      <View
                        className={`w-9 h-9 rounded-2xl items-center justify-center ${
                          isStreakActive
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

            {routineTasks.length === 0 && (
              <View className="bg-white rounded-3xl p-5 border border-slate-100 items-center justify-center">
                <Text className="text-slate-400 text-xs font-medium">
                  No active routine tasks.
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
