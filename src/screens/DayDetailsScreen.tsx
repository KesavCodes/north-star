import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  StyleSheet,
} from "react-native";
import { useStore } from "../store/useStore";
import { formatDigitalTime, formatDuration } from "../utils/formatters";
import { format, parseISO } from "date-fns";
import { ChevronLeft, CheckCircle2, Info, XCircle, Plus, Minus } from "lucide-react-native";
import { DayJournal } from "../components/dayDetails/DayJournal";

export const DayDetailsScreen = ({ route, navigation }: any) => {
  const [activeTab, setActiveTab] = useState<"overview" | "journal">(
    "overview",
  );
  const [isEditingHabits, setIsEditingHabits] = useState(false);
  const [isEditingCounters, setIsEditingCounters] = useState(false);
  const [editedLogs, setEditedLogs] = useState<Record<string, boolean>>({});
  const [editedCounterLogs, setEditedCounterLogs] = useState<Record<string, number>>({});
  const { date } = route.params || { date: format(new Date(), "yyyy-MM-dd") };
  const { logs, getTasksForDate, setTaskCompleted, setTaskValue, activeTimers } = useStore();
  const [tick, setTick] = useState(0);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTimers && Object.keys(activeTimers).length > 0) {
      interval = setInterval(() => setTick((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimers]);

  const displayDate = format(parseISO(date), "dd MMM, yyyy");

  const dateTimestamp = parseISO(date).getTime();
  const activeTasks = getTasksForDate(date).filter(
    (t) => t.createdAt <= dateTimestamp + 86400000,
  );

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
      <View className="flex-row justify-between items-center px-5 mt-6">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="p-2 -ml-2"
        >
          <ChevronLeft color="#334155" size={24} />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-800">{displayDate}</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("AddTaskScreen", { initialDate: date })}
          className="p-2 -mr-2 flex-row items-center"
        >
          <Plus color="#334155" size={24} />
        </TouchableOpacity>
      </View>

      {/* Tab Bar — all dynamic styling via `style`, only static strings in `className` */}
      <View className="flex-row mx-5 mt-5 p-1 bg-slate-100 rounded-2xl">
        <TouchableOpacity
          className="flex-1 py-2 rounded-xl items-center"
          style={
            activeTab === "overview" ? styles.tabActive : styles.tabInactive
          }
          onPress={() => setActiveTab("overview")}
        >
          <Text
            className="text-sm font-bold"
            style={
              activeTab === "overview"
                ? styles.tabTextActive
                : styles.tabTextInactive
            }
          >
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 py-2 rounded-xl items-center"
          style={
            activeTab === "journal" ? styles.tabActive : styles.tabInactive
          }
          onPress={() => setActiveTab("journal")}
        >
          <Text
            className="text-sm font-bold"
            style={
              activeTab === "journal"
                ? styles.tabTextActive
                : styles.tabTextInactive
            }
          >
            Journal
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "overview" ? (
        <ScrollView
          className="flex-1 px-5 mt-5"
          showsVerticalScrollIndicator={false}
        >
          {/* Summary Row */}
          <View className="flex-row justify-between mb-5 bg-white px-5 py-3 rounded-3xl shadow-xs border border-slate-100">
            <View className="items-center">
              <Text className="text-[10px] font-bold text-slate-400">
                Habits
              </Text>
              <Text className="text-sm font-semibold text-slate-800 mt-1">
                {
                  habits.filter((t) => logs[`${t.id}-${date}`]?.completed)
                    .length
                }
                /{habits.length}
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-[10px] font-bold text-slate-400">
                Timers
              </Text>
              <Text className="text-sm font-semibold text-slate-800 mt-1">
                {
                  timers.filter((t) => logs[`${t.id}-${date}`]?.completed)
                    .length
                }
                /{timers.length}
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-[10px] font-bold text-slate-400">
                Counters
              </Text>
              <Text className="text-sm font-semibold text-slate-800 mt-1">
                {
                  counters.filter((t) => logs[`${t.id}-${date}`]?.completed)
                    .length
                }
                /{counters.length}
              </Text>
            </View>
            {/* <View className="items-center">
              <Text className="text-[10px] font-bold text-slate-400">
                Kindness
              </Text>
              <Text className="text-sm font-semibold text-purple-500 mt-1">
                {
                  activeTasks.filter(
                    (t) =>
                      t.category === "kindness" &&
                      logs[`${t.id}-${date}`]?.completed,
                  ).length
                }
              </Text>
            </View> */}
          </View>

          <Text className="text-sm font-bold text-slate-800 mb-2">
            Completed Tasks
          </Text>

          {/* Habits Section */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-xs font-bold text-slate-500 tracking-wider">
                HABITS
              </Text>
              <TouchableOpacity
                className="px-4 py-1.5 rounded-full"
                style={{ backgroundColor: isEditingHabits ? "#2ECC71" : "#1e293b" }}
                onPress={() => {
                  if (isEditingHabits) {
                    Object.entries(editedLogs).forEach(
                      ([taskId, completed]) => {
                        setTaskCompleted(taskId, date, completed);
                      },
                    );
                    setIsEditingHabits(false);
                    setEditedLogs({});
                  } else {
                    setIsEditingHabits(true);
                    setEditedLogs({});
                  }
                }}
              >
                <Text className="text-xs font-bold text-white">
                  {isEditingHabits ? "Save" : "Edit"}
                </Text>
              </TouchableOpacity>
            </View>
            {isEditingHabits && (
              <View className="flex-row items-center mb-3">
                <Info color="#94A3B8" size={14} />
                <Text className="text-xs font-normal text-slate-500 ml-1.5 tracking-wider flex-1">
                  Tap a habit to update its completion status for this day.
                </Text>
              </View>
            )}
            <View className="bg-white rounded-3xl px-5 py-3 shadow-sm border border-slate-50">
              {habits.map((task) => {
                const logId = `${task.id}-${date}`;
                const originalCompleted = logs[logId]?.completed || false;
                const isCompleted =
                  editedLogs[task.id] !== undefined
                    ? editedLogs[task.id]
                    : originalCompleted;

                return (
                  <View key={task.id}>
                    <TouchableOpacity
                      className="flex-row items-center py-2 justify-between"
                      disabled={!isEditingHabits}
                      onPress={() => {
                        setEditedLogs((prev) => ({
                          ...prev,
                          [task.id]: !isCompleted,
                        }));
                      }}
                    >
                      <View className="flex-row items-center">
                        {isEditingHabits ? (
                          isCompleted ? (
                            <CheckCircle2 color="#94A3B8" size={20} />
                          ) : (
                            <XCircle color="#CBD5E1" size={20} />
                          )
                        ) : isCompleted ? (
                          <CheckCircle2 color="#2ECC71" size={20} />
                        ) : (
                          <XCircle color="#F8575F" size={20} />
                        )}
                        <Text
                          className="ml-3 text-sm"
                          style={{ color: isCompleted ? "#334155" : "#94a3b8" }}
                        >
                          {task.name}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })}
              {habits.length === 0 && (
                <Text className="text-slate-400 text-xs">
                  No habits tracked.
                </Text>
              )}
            </View>
          </View>

          {/* Timers Section */}
          <View className="mb-5">
            <Text className="text-xs font-bold text-slate-500 tracking-wider mb-3">
              TIMERS
            </Text>
            <View className="bg-white rounded-3xl px-5 py-3 shadow-sm border border-slate-50 gap-3">
              {timers.map((task) => {
                const logId = `${task.id}-${date}`;
                const baseElapsed = logs[logId]?.value || 0;
                const activeTimer = activeTimers?.[task.id];
                const currentSessionElapsed =
                  activeTimer && activeTimer.date === date
                    ? Math.floor((Date.now() - activeTimer.startTime) / 1000)
                    : 0;
                const elapsed = baseElapsed + currentSessionElapsed;
                const target = task.target || 3600;
                const progress = Math.min((elapsed / target) * 100, 100);

                return (
                  <TouchableOpacity
                    key={task.id}
                    className="py-2 border-b border-slate-50"
                    onPress={() => navigation.navigate("TimerScreen", { taskId: task.id })}
                  >
                    <View className="flex-row justify-between items-center">
                      <Text className="text-sm text-slate-700 font-medium">
                        {task.name}
                      </Text>
                      <Text className="text-xs text-slate-500 font-medium">
                        {formatDigitalTime(elapsed)} / {formatDuration(target)}
                      </Text>
                    </View>
                    <View className="h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
                      <View
                        className="h-full bg-[#2ECC71] rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </View>
                  </TouchableOpacity>
                );
              })}
              {timers.length === 0 && (
                <Text className="text-slate-400 text-xs">
                  No timers tracked.
                </Text>
              )}
            </View>
          </View>

          {/* Counters Section */}
          <View className="mb-5">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-xs font-bold text-slate-500 tracking-wider">
                COUNTERS
              </Text>
              <TouchableOpacity
                className="px-4 py-1.5 rounded-full"
                style={{ backgroundColor: isEditingCounters ? "#2ECC71" : "#1e293b" }}
                onPress={() => {
                  if (isEditingCounters) {
                    Object.entries(editedCounterLogs).forEach(
                      ([taskId, val]) => {
                        setTaskValue(taskId, date, val);
                      },
                    );
                    setIsEditingCounters(false);
                    setEditedCounterLogs({});
                  } else {
                    setIsEditingCounters(true);
                    setEditedCounterLogs({});
                  }
                }}
              >
                <Text className="text-xs font-bold text-white">
                  {isEditingCounters ? "Save" : "Edit"}
                </Text>
              </TouchableOpacity>
            </View>
            <View className="bg-white rounded-3xl px-5 py-3 shadow-sm border border-slate-50 gap-3">
              {counters.map((task) => {
                const logId = `${task.id}-${date}`;
                const originalValue = logs[logId]?.value || 0;
                const value =
                  editedCounterLogs[task.id] !== undefined
                    ? editedCounterLogs[task.id]
                    : originalValue;
                const target = Math.max(task.target || 1, 1);
                const progress = Math.min(
                  Math.max((value / target) * 100, 0),
                  100,
                );
                const isTargetReached = value >= target;

                return (
                  <View key={task.id} className="py-2.5 border-b border-slate-50">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-sm text-slate-700 font-medium flex-1 mr-3">
                        {task.name}
                      </Text>

                      {isEditingCounters ? (
                        <View className="flex-row items-center space-x-2">
                          <TouchableOpacity
                            onPress={() =>
                              setEditedCounterLogs((prev) => ({
                                ...prev,
                                [task.id]: Math.max(value - 1, 0),
                              }))
                            }
                            disabled={value <= 0}
                            className={`w-7 h-7 rounded-full items-center justify-center border ${value <= 0
                              ? "bg-slate-100 border-slate-200"
                              : "bg-red-50 border-red-200"
                              }`}
                          >
                            <Minus color={value <= 0 ? "#CBD5E1" : "#EF4444"} size={14} />
                          </TouchableOpacity>

                          <Text className="text-sm font-bold text-slate-800 w-10 text-center">
                            {value}
                          </Text>

                          <TouchableOpacity
                            onPress={() =>
                              setEditedCounterLogs((prev) => ({
                                ...prev,
                                [task.id]: value + 1,
                              }))
                            }
                            className="w-7 h-7 rounded-full items-center justify-center bg-teal-50 border border-teal-200"
                          >
                            <Plus color="#0F766E" size={14} />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View className="flex-row items-center">
                          <Text className="text-xs text-slate-500 font-semibold mr-1.5">
                            {value} / {target}
                          </Text>
                          {isTargetReached && (
                            <CheckCircle2 color="#2ECC71" size={16} />
                          )}
                        </View>
                      )}
                    </View>

                    {/* Progress Bar (capped at 100%) */}
                    <View className="h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                      <View
                        className={`h-full rounded-full`}
                        style={{ width: `${progress}%`, backgroundColor: isTargetReached ? "#2ECC71" : "#1e293b" }}
                      />
                    </View>
                  </View>
                );
              })}
              {counters.length === 0 && (
                <Text className="text-slate-400 text-xs">
                  No counters tracked.
                </Text>
              )}
            </View>
          </View>

          {/* Add Task for this Day Button */}
          <TouchableOpacity
            onPress={() => navigation.navigate("AddTaskScreen", { initialDate: date })}
            className="bg-slate-800 rounded-2xl py-4 flex-row items-center justify-center mb-20 shadow-sm"
          >
            <Plus color="#FFFFFF" size={20} />
            <Text className="text-white font-semibold text-base ml-2">
              Add Task for this Day
            </Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <DayJournal date={date} />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  tabActive: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabInactive: {},
  tabTextActive: { color: "#1e293b" },
  tabTextInactive: { color: "#94a3b8" },
});
