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
import { format, parseISO } from "date-fns";
import { ChevronLeft, CheckCircle2, Info, XCircle } from "lucide-react-native";
import { DayJournal } from "../components/dayDetails/DayJournal";

export const DayDetailsScreen = ({ route, navigation }: any) => {
  const [activeTab, setActiveTab] = useState<"overview" | "journal">(
    "overview",
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editedLogs, setEditedLogs] = useState<Record<string, boolean>>({});
  const { date } = route.params || { date: format(new Date(), "yyyy-MM-dd") };
  const { logs, getTasksForDate, setTaskCompleted } = useStore();

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
      <View className="flex-row justify-between items-center px-5 mt-4">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="p-2 -ml-2"
        >
          <ChevronLeft color="#334155" size={24} />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-800">{displayDate}</Text>
        <View className="w-8" />
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
          className="flex-1 px-5 mt-6"
          showsVerticalScrollIndicator={false}
        >
          {/* Summary Row */}
          <View className="flex-row justify-between mb-8 bg-white p-4 rounded-2xl shadow-sm border border-slate-50">
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
                Metrics
              </Text>
              <Text className="text-sm font-semibold text-slate-800 mt-1">
                {
                  counters.filter((t) => logs[`${t.id}-${date}`]?.completed)
                    .length
                }
                /{counters.length}
              </Text>
            </View>
            <View className="items-center">
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
            </View>
          </View>

          <Text className="text-sm font-bold text-slate-800 mb-4">
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
                style={{ backgroundColor: isEditing ? "#2ECC71" : "#1e293b" }}
                onPress={() => {
                  if (isEditing) {
                    Object.entries(editedLogs).forEach(
                      ([taskId, completed]) => {
                        setTaskCompleted(taskId, date, completed);
                      },
                    );
                    setIsEditing(false);
                    setEditedLogs({});
                  } else {
                    setIsEditing(true);
                    setEditedLogs({});
                  }
                }}
              >
                <Text className="text-xs font-bold text-white">
                  {isEditing ? "Save" : "Edit"}
                </Text>
              </TouchableOpacity>
            </View>
            {isEditing && (
              <View className="flex-row items-center mb-3">
                <Info color="#94A3B8" size={14} />
                <Text className="text-xs font-normal text-slate-500 ml-1.5 tracking-wider flex-1">
                  Tap a habit to update its completion status for this day.
                </Text>
              </View>
            )}
            <View className="bg-white rounded-3xl p-5 shadow-sm border border-slate-50">
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
                      disabled={!isEditing}
                      onPress={() => {
                        setEditedLogs((prev) => ({
                          ...prev,
                          [task.id]: !isCompleted,
                        }));
                      }}
                    >
                      <View className="flex-row items-center">
                        {isEditing ? (
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
          <View className="mb-6">
            <Text className="text-xs font-bold text-slate-500 tracking-wider mb-3">
              PRODUCTIVITY (TIMER)
            </Text>
            <View className="bg-white rounded-3xl p-5 shadow-sm border border-slate-50">
              {timers.map((task) => {
                const logId = `${task.id}-${date}`;
                const elapsed = logs[logId]?.value || 0;
                const target = task.target || 3600;
                const progress = Math.min((elapsed / target) * 100, 100);

                return (
                  <View key={task.id} className="py-2 border-b border-slate-50">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-sm text-slate-700 font-medium">
                        {task.name}
                      </Text>
                      <Text className="text-xs text-slate-500">
                        {Math.floor(elapsed / 60)}:
                        {(elapsed % 60).toString().padStart(2, "0")} /{" "}
                        {Math.floor(target / 60)}:00
                      </Text>
                    </View>
                    <View className="h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
                      <View
                        className="h-full bg-[#2ECC71] rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </View>
                  </View>
                );
              })}
              {timers.length === 0 && (
                <Text className="text-slate-400 text-xs">
                  No timers tracked.
                </Text>
              )}
            </View>
          </View>
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
