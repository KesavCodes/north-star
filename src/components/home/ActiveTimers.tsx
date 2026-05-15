import { View, Text, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { Pause } from "lucide-react-native";
import { useStore } from "../../store/useStore";

const ACCENT = "#2ECC71";

const ActiveTimers = () => {
  const navigation = useNavigation<any>();
  const { activeTimers, logs, getTaskById, pauseTimer } = useStore();
  const [tick, setTick] = useState(0);

  const activeKeys = Object.keys(activeTimers);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeKeys.length > 0) {
      interval = setInterval(() => setTick((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [activeKeys.length]);

  return (
    <View className="mt-8 mb-24">
      <Text className="text-base font-bold text-slate-800 mb-4">
        Currently Active Timers
      </Text>

      {activeKeys.length === 0 ? (
        <View 
          key="empty"
          className="bg-white rounded-3xl p-6 border border-dashed border-slate-300 items-center justify-center shadow-sm"
        >
          <Text className="text-slate-500 font-medium text-center leading-6">
            No timers active right now. Start a task from your daily tracker to
            see it here!
          </Text>
        </View>
      ) : (
        <View key="list" className="gap-4">
          {activeKeys.map((taskId) => {
            const timer = activeTimers[taskId];
            const task = getTaskById(taskId);
            if (!task) return null;

            const logId = `${taskId}-${timer.date}`;
            const baseElapsed = logs[logId]?.value || 0;
            const currentElapsed = Math.floor(
              (Date.now() - timer.startTime) / 1000,
            );
            const elapsed = baseElapsed + currentElapsed;

            const h = Math.floor(elapsed / 3600);
            const m = Math.floor((elapsed % 3600) / 60);
            const s = elapsed % 60;
            const timeString = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;

            return (
              <TouchableOpacity
                key={taskId}
                onPress={() => navigation.navigate("TimerScreen", { taskId })}
                className="bg-slate-800 rounded-3xl p-4 flex-row items-center justify-between shadow-md"
              >
                <View className="flex-row items-center flex-1 mr-4">
                  <View
                    className="w-2 h-10 rounded-full mr-4"
                    style={{ backgroundColor: ACCENT }}
                  />
                  <View className="flex-1">
                    <Text
                      className="text-white font-semibold text-base"
                      numberOfLines={1}
                    >
                      {task.name}
                    </Text>
                    <Text className="text-slate-400 font-medium text-sm mt-1">
                      {timeString}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => pauseTimer(taskId, timer.date)}
                  className="w-12 h-12 rounded-full items-center justify-center"
                  style={{ backgroundColor: ACCENT }}
                >
                  <Pause color="#FFF" size={24} fill="#FFF" />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

export default ActiveTimers;
