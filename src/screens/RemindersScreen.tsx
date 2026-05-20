import React, { useMemo } from "react";
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
import { useStore } from "../store/useStore";
import { ChevronLeft, BellOff, Clock, Trash2 } from "lucide-react-native";
import { cancelTaskReminder } from "../utils/notifications";
import { Task } from "../types";

export const RemindersScreen = ({ navigation }: any) => {
  const { tasks, updateTask, categories } = useStore();

  const activeReminders = useMemo(() => {
    const allTasks = Object.values(tasks).flat();
    return allTasks.filter((task) => !!task.reminderTime);
  }, [tasks]);

  const handleRemoveReminder = (task: Task) => {
    Alert.alert(
      "Remove Reminder",
      `Are you sure you want to remove the reminder for "${task.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            await cancelTaskReminder(task.id);
            // We use undefined to remove the property, but since Partial<Task> is expected,
            // we might need to cast it or just set it to undefined as any.
            updateTask(task.id, { reminderTime: undefined } as any);
          },
        },
      ],
    );
  };

  const getCategoryInfo = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category || { emoji: "📝", color: "#94A3B8" };
  };

  return (
    <SafeAreaView
      className="flex-1 bg-[#F8F9FA]"
      style={{
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
      }}
    >
      {/* Header */}
      <View className="flex-row justify-between items-center px-5 mt-4 mb-8">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="p-2 -ml-2"
        >
          <ChevronLeft color="#334155" size={24} />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-800">
          Active Reminders
        </Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {activeReminders.length === 0 ? (
          <View className="flex-1 items-center justify-center mt-20">
            <View className="w-20 h-20 bg-slate-100 rounded-full items-center justify-center mb-6">
              <BellOff color="#94A3B8" size={40} />
            </View>
            <Text className="text-slate-800 text-lg font-semibold text-center mb-2">
              No Active Reminders
            </Text>
            <Text className="text-slate-500 text-center px-4">
              When you set reminders for your tasks, they will appear here.
            </Text>
          </View>
        ) : (
          <View className="bg-white rounded-3xl p-2 shadow-sm border border-slate-50 mb-12">
            {activeReminders.map((task, index) => {
              const categoryInfo = getCategoryInfo(task.category);
              return (
                <React.Fragment key={task.id}>
                  <View className="flex-row items-center justify-between p-4">
                    <View className="flex-row items-center flex-1">
                      <View
                        className="w-10 h-10 rounded-full items-center justify-center mr-3"
                        style={{ backgroundColor: categoryInfo.color + "20" }}
                      >
                        <Text className="text-lg">{categoryInfo.emoji}</Text>
                      </View>
                      <View className="flex-1">
                        <Text
                          className="text-slate-800 text-base font-semibold mb-1"
                          numberOfLines={1}
                        >
                          {task.name}
                        </Text>
                        <View className="flex-row items-center">
                          <Clock color="#94A3B8" size={14} />
                          <Text className="text-slate-500 text-sm ml-1">
                            {task.reminderTime}
                            {task.isRoutine ? " (Daily)" : ` (${task.date})`}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleRemoveReminder(task)}
                      className="w-10 h-10 items-center justify-center rounded-full bg-red-50 ml-2"
                    >
                      <Trash2 color="#EF4444" size={20} />
                    </TouchableOpacity>
                  </View>
                  {index < activeReminders.length - 1 && (
                    <View className="h-[1px] bg-slate-100 mx-4" />
                  )}
                </React.Fragment>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
