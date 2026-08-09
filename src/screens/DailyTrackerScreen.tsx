import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import { useResetScrollOnFocus } from "../hooks/useResetScrollOnFocus";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStore } from "../store/useStore";
import { formatDigitalTime, formatDuration } from "../utils/formatters";
import { format } from "date-fns";
import {
  ChevronLeft,
  Calendar,
  CheckCircle2,
  Circle,
  Play,
  Pause,
  Plus,
  Minus,
} from "lucide-react-native";

export const DailyTrackerScreen = ({ navigation, route }: any) => {
  const insets = useSafeAreaInsets();
  const {
    logs,
    setTaskCompleted,
    logTaskProgress,
    getTasksForDate,
    activeTimers,
    startTimer,
    pauseTimer,
    categories,
  } = useStore();
  const [tick, setTick] = useState(0);
  const todayDateObj = new Date();
  const today = format(todayDateObj, "dd MMM, yyyy");
  const todayISO = format(todayDateObj, "yyyy-MM-dd");

  const [activeCategory, setActiveCategory] = useState(
    route?.params?.category || "all",
  );

  const scrollRef = useResetScrollOnFocus<ScrollView>();

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (Object.keys(activeTimers).length > 0) {
      interval = setInterval(() => setTick((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimers]);

  // Filter tasks for today's tracker
  let activeTasks = getTasksForDate(todayISO);
  if (activeCategory !== "all") {
    activeTasks = activeTasks.filter((t) => t.category === activeCategory);
  } else {
    const archivedCategoryIds = categories
      .filter((c) => c.isArchived)
      .map((c) => c.id);
    activeTasks = activeTasks.filter(
      (t) => !archivedCategoryIds.includes(t.category),
    );
  }

  const habits = activeTasks.filter((t) => t.type === "checkbox");
  const timers = activeTasks.filter((t) => t.type === "timer");
  const counters = activeTasks.filter((t) => t.type === "counter");

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
        <View className="items-center">
          <Text className="text-lg font-bold text-slate-800">
            Daily Tracker
          </Text>
          <Text className="text-xs text-slate-500">{today}</Text>
        </View>
        <TouchableOpacity
          className="p-2 -mr-2"
          onPress={() => navigation.navigate("CalendarHeatmap")}
        >
          <Calendar color="#334155" size={24} />
        </TouchableOpacity>
      </View>

      {/* Categories Nav */}
      <View className="px-5 mt-5">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            onPress={() => setActiveCategory("all")}
            className={`py-1.5 px-5 rounded-full mr-2 ${activeCategory === "all"
              ? "bg-slate-800"
              : "bg-white border border-slate-200"
              }`}
          >
            <Text
              className={`font-semibold capitalize ${activeCategory === "all" ? "text-white" : "text-slate-600"
                }`}
            >
              All
            </Text>
          </TouchableOpacity>

          {useStore((state) => state.categories)
            .filter((c) => !c.isArchived)
            .map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setActiveCategory(cat.id)}
                  className={`py-1.5 px-5 rounded-full mr-2 ${isActive
                    ? "bg-slate-800"
                    : "bg-white border border-slate-200"
                    }`}
                >
                  <Text
                    className={`font-semibold capitalize ${isActive ? "text-white" : "text-slate-600"
                      }`}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
        </ScrollView>
      </View>

      <ScrollView
        ref={scrollRef}
        className="flex-1 px-5 mt-5"
        showsVerticalScrollIndicator={false}
      >
        {/* Habits Section */}
        <View className="mb-5">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              HABITS ({habits.length})
            </Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("AddTaskScreen", {
                  initialDate: todayISO,
                  type: "checkbox",
                  category: activeCategory,
                })
              }
              className="flex-row items-center bg-slate-100 px-3 py-1 rounded-full border border-slate-200/60"
            >
              <Plus color="#0F766E" size={14} />
              <Text className="text-xs font-bold text-teal-700 ml-1">
                Add Habit
              </Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white rounded-3xl px-5 py-1 shadow-xs border border-slate-100">
            {habits.map((task, index) => {
              const logId = `${task.id}-${todayISO}`;
              const isCompleted = logs[logId]?.completed || false;

              return (
                <View key={task.id}>
                  <TouchableOpacity
                    className="flex-row items-center py-3"
                    onPress={() =>
                      setTaskCompleted(task.id, todayISO, !isCompleted)
                    }
                  >
                    {isCompleted ? (
                      <CheckCircle2 color="#2ECC71" size={24} />
                    ) : (
                      <Circle color="#CBD5E1" size={24} />
                    )}
                    <Text
                      className={`ml-3 text-base ${isCompleted ? "text-slate-400 line-through" : "text-slate-700"}`}
                    >
                      {task.name}
                    </Text>
                  </TouchableOpacity>
                  {index < habits.length - 1 && (
                    <View className="h-[1px] bg-slate-100" />
                  )}
                </View>
              );
            })}
            {habits.length === 0 && (
              <Text className="text-slate-400 text-center py-4">
                No habits added.
              </Text>
            )}
          </View>
        </View>

        {/* Timers Section */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              TIMERS ({timers.length})
            </Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("AddTaskScreen", {
                  initialDate: todayISO,
                  type: "timer",
                  category: activeCategory,
                })
              }
              className="flex-row items-center bg-slate-100 px-3 py-1 rounded-full border border-slate-200/60"
            >
              <Plus color="#0F766E" size={14} />
              <Text className="text-xs font-bold text-teal-700 ml-1">
                Add Timer
              </Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white rounded-3xl px-5 py-1 shadow-xs border border-slate-100">
            {timers.map((task, index) => {
              const logId = `${task.id}-${todayISO}`;
              const activeTimer = activeTimers[task.id];
              const isRunning = !!activeTimer;
              const baseElapsed = logs[logId]?.value || 0;
              const currentSessionElapsed = activeTimer
                ? Math.floor((Date.now() - activeTimer.startTime) / 1000)
                : 0;
              const elapsed = baseElapsed + currentSessionElapsed;
              const target = task.target || 3600;
              const progress = Math.min((elapsed / target) * 100, 100);

              return (
                <View key={task.id}>
                  <TouchableOpacity
                    className="py-4"
                    onPress={() =>
                      navigation.navigate("TimerScreen", { taskId: task.id })
                    }
                  >
                    <View className="flex-row justify-between items-center">
                      <Text className="text-md font-semibold text-slate-700">
                        {task.name}
                      </Text>
                      <View className="flex-row items-center">
                        <Text className="text-sm font-semibold text-slate-500 mr-3">
                          {formatDigitalTime(elapsed)} / {formatDuration(target)}
                        </Text>
                        <TouchableOpacity
                          onPress={() =>
                            isRunning
                              ? pauseTimer(task.id, todayISO)
                              : startTimer(task.id, todayISO)
                          }
                          className="bg-[#2ECC71] w-8 h-8 rounded-full items-center justify-center"
                        >
                          {isRunning ? (
                            <Pause color="#FFF" size={14} fill="#FFF" />
                          ) : (
                            <Play
                              color="#FFF"
                              size={14}
                              fill="#FFF"
                              className="ml-0.5"
                            />
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                    {/* Progress Bar */}
                    <View className="h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
                      <View
                        className="h-full bg-[#2ECC71] rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </View>
                  </TouchableOpacity>
                  {index < timers.length - 1 && (
                    <View className="h-[1px] bg-slate-100" />
                  )}
                </View>
              );
            })}
            {timers.length === 0 && (
              <Text className="text-slate-400 text-center py-4">
                No timers added.
              </Text>
            )}
          </View>
        </View>

        {/* Counters Section */}
        <View className="mb-12">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              COUNTERS ({counters.length})
            </Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("AddTaskScreen", {
                  initialDate: todayISO,
                  type: "counter",
                  category: activeCategory,
                })
              }
              className="flex-row items-center bg-slate-100 px-3 py-1 rounded-full border border-slate-200/60"
            >
              <Plus color="#0F766E" size={14} />
              <Text className="text-xs font-bold text-teal-700 ml-1">
                Add Counter
              </Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white rounded-3xl px-5 py-1 shadow-sm border border-slate-50">
            {counters.map((task, index) => {
              const logId = `${task.id}-${todayISO}`;
              const value = logs[logId]?.value || 0;
              const target = task.target || 1;
              const progress = Math.min((value / target) * 100, 100);
              const isCompletedForPlus = value + 1 >= target;
              const isCompletedForMinus = value - 1 >= target;
              return (
                <View key={task.id}>
                  <View className="py-4">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-md font-semibold text-slate-700">
                        {task.name}
                      </Text>
                      <View className="flex-row items-center">
                        <Text className="text-sm font-semibold text-slate-500 mr-3">
                          {value} / {target}
                        </Text>
                        <TouchableOpacity
                          key="minus"
                          disabled={value <= 0}
                          onPress={() =>
                            logTaskProgress(
                              task.id,
                              todayISO,
                              -1,
                              isCompletedForMinus,
                            )
                          }
                          className={`mr-2 w-8 h-8 rounded-full items-center justify-center ${value <= 0 ? "bg-slate-200" : "bg-red-500"}`}
                        >
                          <Minus color="#FFF" size={16} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          key="plus"
                          onPress={() =>
                            logTaskProgress(
                              task.id,
                              todayISO,
                              1,
                              isCompletedForPlus,
                            )
                          }
                          className="bg-blue-500 w-8 h-8 rounded-full items-center justify-center"
                        >
                          <Plus color="#FFF" size={16} />
                        </TouchableOpacity>
                      </View>
                    </View>
                    {/* Progress Bar */}
                    <View className="h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
                      <View
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </View>
                  </View>
                  {index < counters.length - 1 && (
                    <View className="h-[1px] bg-slate-100" />
                  )}
                </View>
              );
            })}
            {counters.length === 0 && (
              <Text className="text-slate-400 text-center py-4">
                No metrics added.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
