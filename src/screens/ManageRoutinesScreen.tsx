import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  ScrollView,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStore } from "../store/useStore";
import {
  ChevronLeft,
  Plus,
  Repeat,
  MoreVertical,
} from "lucide-react-native";
import { useResetScrollOnFocus } from "../hooks/useResetScrollOnFocus";
import { Task } from "../types";
import { TaskOptionsModal } from "../components/TaskOptionsModal";

export const ManageRoutinesScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { tasks, categories, updateTask, deleteTask } = useStore();
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active");
  const [selectedTaskForOptions, setSelectedTaskForOptions] = useState<Task | null>(null);
  const scrollRef = useResetScrollOnFocus<ScrollView>();

  const routineTasks = useMemo(() => tasks["routine"] || [], [tasks]);

  const activeRoutines = useMemo(
    () => routineTasks.filter((t) => !t.isArchived),
    [routineTasks],
  );

  const archivedRoutines = useMemo(
    () => routineTasks.filter((t) => t.isArchived),
    [routineTasks],
  );

  const currentList = activeTab === "active" ? activeRoutines : archivedRoutines;

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

  const handleToggleArchive = (task: Task) => {
    const nextState = !task.isArchived;
    updateTask(task.id, { isArchived: nextState });
  };

  const handleDeleteTask = (task: Task) => {
    Alert.alert(
      "Delete Routine Task",
      `Are you sure you want to delete "${task.name}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteTask(task.id),
        },
      ],
    );
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
      <View className="flex-row justify-between items-center px-5 mt-6 mb-5">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="p-2 -ml-2"
        >
          <ChevronLeft color="#334155" size={24} />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-800">
          Recurring Tasks
        </Text>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("AddTaskScreen", { isRoutine: true })
          }
          className="p-2 -mr-2 flex-row items-center"
        >
          <Plus color="#0F766E" size={22} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs (Active vs Archived) */}
      <View className="px-5 mb-5 flex-row">
        <TouchableOpacity
          onPress={() => setActiveTab("active")}
          className={`flex-1 py-2.5 rounded-2xl items-center mr-2 border ${
            activeTab === "active"
              ? "bg-slate-800 border-slate-800"
              : "bg-white border-slate-200"
          }`}
        >
          <Text
            className={`font-semibold text-sm ${
              activeTab === "active" ? "text-white" : "text-slate-600"
            }`}
          >
            Active ({activeRoutines.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("archived")}
          className={`flex-1 py-2.5 rounded-2xl items-center border ${
            activeTab === "archived"
              ? "bg-slate-800 border-slate-800"
              : "bg-white border-slate-200"
          }`}
        >
          <Text
            className={`font-semibold text-sm ${
              activeTab === "archived" ? "text-white" : "text-slate-600"
            }`}
          >
            Archived ({archivedRoutines.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
      >
        <View className="space-y-3 gap-3 mb-12">
          {currentList.map((task) => {
            const categoryInfo = getCategoryInfo(task.category);

            return (
              <View
                key={task.id}
                className="bg-white rounded-3xl p-4 shadow-xs border border-slate-100"
              >
                <View className="flex-row items-center justify-between">
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
                        className="text-base font-bold text-slate-800 mb-0.5"
                        numberOfLines={1}
                      >
                        {task.name}
                      </Text>
                      <View className="flex-row items-center gap-2 flex-wrap">
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
                        <View className="flex-row items-center">
                          <Repeat color="#94A3B8" size={11} />
                          <Text className="text-xs text-slate-400 font-medium ml-1">
                            {getDaysFormatted(task.daysOfWeek)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Single 3-Dots Options Menu Icon */}
                  <TouchableOpacity
                    onPress={() => setSelectedTaskForOptions(task)}
                    className="w-9 h-9 rounded-2xl bg-slate-50 border border-slate-100 items-center justify-center"
                  >
                    <MoreVertical color="#64748B" size={18} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          {currentList.length === 0 && (
            <View className="bg-white rounded-3xl p-8 border border-slate-100 items-center justify-center">
              <Text className="text-slate-400 text-sm font-medium text-center">
                {activeTab === "active"
                  ? "No active recurring tasks."
                  : "No archived recurring tasks."}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Task Options Modal */}
      <TaskOptionsModal
        visible={!!selectedTaskForOptions}
        task={selectedTaskForOptions}
        onClose={() => setSelectedTaskForOptions(null)}
        onEdit={(task) => navigation.navigate("AddTaskScreen", { task })}
        onToggleArchive={handleToggleArchive}
        onDelete={handleDeleteTask}
      />
    </SafeAreaView>
  );
};
