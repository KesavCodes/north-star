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
import { Task } from "../types";

export const CalendarHeatmapScreen = ({ navigation }: any) => {
  const { logs, getTasksForDate } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const dateFormat = "MMMM yyyy";
  const days = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const monthlyTaskData = eachDayOfInterval({
    start: monthStart,
    end: monthEnd,
  }).reduce((acc: any, day) => {
    const dateStr = format(day, "yyyy-MM-dd");
    acc[dateStr] = getTasksForDate(dateStr);
    return acc;
  }, {});

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const streaks = useMemo(() => {
    const calc = (category: string) => {
      let current = 0;
      let best = 0;
      const logDates = Object.values(logs)
        .map((l: any) => l.date)
        .filter((date: any) => date && /^\d{4}-\d{2}-\d{2}$/.test(date));
      if (logDates.length === 0) return { current: 0, best: 0 };

      logDates.sort(
        (a: any, b: any) => new Date(a).getTime() - new Date(b).getTime(),
      );
      const earliestDate = new Date(logDates[0]);
      const todayDate = new Date();

      if (earliestDate > todayDate) return { current: 0, best: 0 };

      const daysToCheck = eachDayOfInterval({
        start: earliestDate,
        end: todayDate,
      });

      daysToCheck.forEach((day) => {
        const dateStr = format(day, "yyyy-MM-dd");
        const activeTasks = getTasksForDate(dateStr).filter((t: Task) => {
          if (t.category !== category) return false;
          if (!t.isRoutine) return true;
          const createdDateStr = format(new Date(t.createdAt), "yyyy-MM-dd");
          return (
            dateStr >= createdDateStr &&
            dateStr <= format(todayDate, "yyyy-MM-dd")
          );
        });
        if (activeTasks.length === 0) return;
        const completedCount = activeTasks.filter(
          (t: Task) => logs[`${t.id}-${dateStr}`]?.completed,
        ).length;

        if (completedCount === activeTasks.length) {
          current++;
          best = Math.max(best, current);
        } else {
          if (dateStr !== format(todayDate, "yyyy-MM-dd")) {
            current = 0;
          }
        }
      });

      return { current, best };
    };

    return {
      discipline: calc("discipline"),
      kindness: calc("kindness"),
    };
  }, [logs, getTasksForDate]);

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
      }}
    >
      {/* Header */}
      <View className="flex-row justify-between items-center px-5 mt-4">
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
        className="flex-1 px-5 mt-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Month Selector */}
        <View className="flex-row justify-between items-center mb-6">
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
        <View className="flex-row justify-between items-center mt-6 pt-6 border-t border-slate-200">
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

        {/* Streaks Overview */}
        <View className="mt-8 mb-8">
          <Text className="text-base font-bold text-slate-800 mb-4 px-1">
            Current Streaks
          </Text>
          <View className="flex-row space-x-4">
            <View className="flex-1 bg-white rounded-3xl p-5 shadow-sm border border-slate-50 mr-2">
              <Text className="text-sm font-bold text-[#F39C12] mb-4">
                Discipline
              </Text>
              <View className="flex-row items-center mb-2">
                <Flame color="#F39C12" size={28} fill="#F39C12" />
                <Text className="text-3xl font-bold text-slate-800 ml-2">
                  {streaks.discipline.current}{" "}
                  <Text className="text-base text-slate-500 font-medium">
                    days
                  </Text>
                </Text>
              </View>
              <Text className="text-xs text-slate-400">
                Best: {streaks.discipline.best} days
              </Text>
            </View>

            <View className="flex-1 bg-white rounded-3xl p-5 shadow-sm border border-slate-50 ml-2">
              <Text className="text-sm font-bold text-[#E74C3C] mb-4">
                Kindness
              </Text>
              <View className="flex-row items-center mb-2">
                <Heart color="#E74C3C" size={28} fill="#E74C3C" />
                <Text className="text-3xl font-bold text-slate-800 ml-2">
                  {streaks.kindness.current}{" "}
                  <Text className="text-base text-slate-500 font-medium">
                    days
                  </Text>
                </Text>
              </View>
              <Text className="text-xs text-slate-400">
                Best: {streaks.kindness.best} days
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
