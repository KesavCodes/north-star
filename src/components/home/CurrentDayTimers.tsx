import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Play, Pause, Clock, Plus } from "lucide-react-native";
import { useStore } from "../../store/useStore";
import { format } from "date-fns";
import { formatDigitalTime, formatDuration } from "../../utils/formatters";

const CurrentDayTimers = () => {
  const navigation = useNavigation<any>();
  const {
    getTasksForDate,
    activeTimers,
    logs,
    categories,
    startTimer,
    pauseTimer,
  } = useStore();
  const [tick, setTick] = useState(0);

  const todayISO = format(new Date(), "yyyy-MM-dd");
  const todayTasks = getTasksForDate(todayISO);
  const timerTasks = todayTasks.filter((t) => t.type === "timer");

  const activeKeys = Object.keys(activeTimers);
  const hasActiveTimer = activeKeys.length > 0;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (hasActiveTimer) {
      interval = setInterval(() => setTick((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [hasActiveTimer]);

  const getCategoryInfo = (categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat || { emoji: "⚡", color: "#3B82F6", name: "General" };
  };

  return (
    <View className="mt-8 mb-24">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-bold text-slate-800">
          Today's Timers
        </Text>
        <Text className="text-xs font-semibold text-slate-400">
          {timerTasks.length} {timerTasks.length === 1 ? "Timer" : "Timers"}
        </Text>
      </View>

      {timerTasks.length === 0 ? (
        <TouchableOpacity
          onPress={() => navigation.navigate("AddTaskScreen", { initialDate: todayISO })}
          className="bg-white rounded-3xl p-6 border border-dashed border-slate-200 items-center justify-center shadow-sm"
        >
          <View className="w-12 h-12 bg-indigo-50 rounded-full items-center justify-center mb-3">
            <Clock color="#6366F1" size={24} />
          </View>
          <Text className="text-slate-700 font-semibold text-base mb-1">
            No Timers Scheduled Today
          </Text>
          <Text className="text-slate-400 font-medium text-xs text-center mb-3">
            Add focus timer tasks to track your productivity daily.
          </Text>
          <View className="flex-row items-center justify-center bg-indigo-600 px-4 py-2 rounded-full">
            <Plus color="#FFFFFF" size={14} />
            <Text className="text-white font-semibold text-xs ml-1 w-[80px]">
              Add Timer Task
            </Text>
          </View>
        </TouchableOpacity>
      ) : (
        <View className="gap-3">
          {timerTasks.map((task) => {
            const logId = `${task.id}-${todayISO}`;
            const baseElapsed = logs[logId]?.value || 0;
            const activeTimer = activeTimers[task.id];
            const isRunning = !!activeTimer;

            const currentSessionElapsed =
              activeTimer && activeTimer.date === todayISO
                ? Math.floor((Date.now() - activeTimer.startTime) / 1000)
                : 0;
            const elapsed = baseElapsed + currentSessionElapsed;
            const target = task.target || 3600;
            const progress = Math.min((elapsed / target) * 100, 100);
            const categoryInfo = getCategoryInfo(task.category);

            return (
              <TouchableOpacity
                key={task.id}
                onPress={() =>
                  navigation.navigate("TimerScreen", { taskId: task.id })
                }
                className={`rounded-3xl p-5 mb-3.5 shadow-sm border ${isRunning
                  ? "bg-slate-900 border-slate-800"
                  : "bg-white border-slate-100"
                  }`}
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center flex-1 mr-3">
                    <View
                      className="w-8 h-8 rounded-full items-center justify-center mr-3"
                      style={{
                        backgroundColor: categoryInfo.color + (isRunning ? "30" : "15"),
                      }}
                    >
                      <Text className="text-sm">{categoryInfo.emoji}</Text>
                    </View>
                    <View className="flex-1">
                      <Text
                        className={`font-semibold text-base ${isRunning ? "text-white" : "text-slate-800"
                          }`}
                        numberOfLines={1}
                      >
                        {task.name}
                      </Text>
                      <Text
                        className={`text-xs font-medium ${isRunning ? "text-slate-400" : "text-slate-500"
                          }`}
                      >
                        {formatDigitalTime(elapsed)} / {formatDuration(target)}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() =>
                      isRunning
                        ? pauseTimer(task.id, todayISO)
                        : startTimer(task.id, todayISO)
                    }
                    className="w-10 h-10 rounded-full items-center justify-center shadow-sm"
                    style={{
                      backgroundColor: isRunning ? "#EF4444" : "#2ECC71",
                    }}
                  >
                    {isRunning ? (
                      <Pause color="#FFF" size={18} fill="#FFF" />
                    ) : (
                      <Play color="#FFF" size={18} fill="#FFF" className="ml-0.5" />
                    )}
                  </TouchableOpacity>
                </View>

                {/* Progress Bar */}
                <View className="h-1.5 bg-slate-100/30 rounded-full overflow-hidden">
                  <View
                    className="h-full rounded-full"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: isRunning ? "#2ECC71" : categoryInfo.color,
                    }}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

export default CurrentDayTimers;
