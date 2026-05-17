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
import { useStore } from "../store/useStore";
import { format } from "date-fns";
import {
  ChevronLeft,
  Calendar,
  CheckCircle2,
  Circle,
  Play,
  Pause,
  Plus,
} from "lucide-react-native";

export const DailyTrackerScreen = ({ navigation, route }: any) => {
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
    const archivedCategoryIds = categories.filter(c => c.isArchived).map(c => c.id);
    activeTasks = activeTasks.filter((t) => !archivedCategoryIds.includes(t.category));
  }

  const habits = activeTasks.filter((t) => t.type === "checkbox");
  const timers = activeTasks.filter((t) => t.type === "timer");
  const counters = activeTasks.filter((t) => t.type === "counter");

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
      <View className="px-5 mt-6 pb-2">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            onPress={() => setActiveCategory("all")}
            className={`py-2 px-6 rounded-full mr-2 ${
              activeCategory === "all"
                ? "bg-slate-800"
                : "bg-white border border-slate-200"
            }`}
          >
            <Text
              className={`font-semibold capitalize ${
                activeCategory === "all" ? "text-white" : "text-slate-600"
              }`}
            >
              All
            </Text>
          </TouchableOpacity>

          {useStore((state) => state.categories).filter((c) => !c.isArchived).map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setActiveCategory(cat.id)}
                className={`py-2 px-6 rounded-full mr-2 ${
                  isActive ? "bg-slate-800" : "bg-white border border-slate-200"
                }`}
              >
                <Text
                  className={`font-semibold capitalize ${
                    isActive ? "text-white" : "text-slate-600"
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
        className="flex-1 px-5 mt-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Habits Section */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xs font-bold text-slate-500 tracking-wider">
              HABITS
            </Text>
            <Text className="text-xs text-slate-400">
              {habits.length} habits
            </Text>
          </View>

          <View className="bg-white rounded-3xl p-5 shadow-sm border border-slate-50">
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
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xs font-bold text-slate-500 tracking-wider">
              PRODUCTIVITY (TIMER)
            </Text>
            <Text className="text-xs text-slate-400">
              {timers.length} tasks
            </Text>
          </View>

          <View className="bg-white rounded-3xl p-5 shadow-sm border border-slate-50">
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
                          {Math.floor(elapsed / 60)}:
                          {(elapsed % 60).toString().padStart(2, "0")} /{" "}
                          {Math.floor(target / 60)}:00
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
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xs font-bold text-slate-500 tracking-wider">
              METRICS (COUNTER)
            </Text>
            <Text className="text-xs text-slate-400">
              {counters.length} tasks
            </Text>
          </View>

          <View className="bg-white rounded-3xl p-5 shadow-sm border border-slate-50">
            {counters.map((task, index) => {
              const logId = `${task.id}-${todayISO}`;
              const value = logs[logId]?.value || 0;
              const target = task.target || 1;
              const progress = Math.min((value / target) * 100, 100);
              const isCompleted = value + 1 >= target;
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
                          onPress={() =>
                            logTaskProgress(task.id, todayISO, 1, isCompleted)
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
