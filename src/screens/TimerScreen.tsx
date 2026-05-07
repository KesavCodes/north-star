import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import { useStore } from "../store/useStore";
import { format } from "date-fns";
import {
  ChevronLeft,
  MoreVertical,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react-native";
import Svg, { Circle } from "react-native-svg";

export const TimerScreen = ({ route, navigation }: any) => {
  const { taskId } = route.params || {};
  const { getTaskById, logs, addTimerSession } = useStore();
  const todayISO = format(new Date(), "yyyy-MM-dd");

  const task = taskId ? getTaskById(taskId) : undefined;
  const logId = taskId ? `${taskId}-${todayISO}` : null;
  const existingLog = logId ? logs[logId] : null;

  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(existingLog?.value || 0);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

  const target = task?.target || 7200; // default 2 hours
  const progress = Math.min((elapsedSeconds / target) * 100, 100);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const toggleTimer = () => {
    if (isRunning) {
      // Pause
      setIsRunning(false);
      if (sessionStartTime && taskId) {
        addTimerSession(taskId, todayISO, {
          startTime: sessionStartTime,
          endTime: Date.now(),
        });
      }
      setSessionStartTime(null);
    } else {
      // Start
      setIsRunning(true);
      setSessionStartTime(Date.now());
    }
  };

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const radius = 120;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  if (!task) {
    return (
      <SafeAreaView className="flex-1 bg-[#1E293B] items-center justify-center">
        <Text className="text-white">Task not found</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mt-4 p-4"
        >
          <Text className="text-blue-400">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-[#111827]"
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
          <ChevronLeft color="#FFF" size={24} />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-white">{task.name}</Text>
        <TouchableOpacity className="p-2 -mr-2">
          <MoreVertical color="#FFF" size={24} />
        </TouchableOpacity>
      </View>

      <View className="px-5 mt-8 flex-row justify-between items-center">
        <View>
          <Text className="text-slate-400 text-xs tracking-wider">
            DAILY TARGET
          </Text>
          <Text className="text-white text-base font-medium mt-1">
            {formatTime(target)}
          </Text>
        </View>
        <TouchableOpacity>
          <Text className="text-slate-400 text-sm">Edit</Text>
        </TouchableOpacity>
      </View>

      {/* Timer Circle */}
      <View className="items-center justify-center mt-16 relative">
        <Svg
          width={radius * 2 + strokeWidth * 2}
          height={radius * 2 + strokeWidth * 2}
        >
          <Circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            stroke="#1F2937"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <Circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            stroke={task.color || "#2ECC71"}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${radius + strokeWidth} ${radius + strokeWidth})`}
          />
        </Svg>
        <View className="absolute items-center justify-center">
          <Text className="text-slate-400 text-sm mb-2">Today</Text>
          <Text className="text-5xl font-bold text-white tracking-widest">
            {formatTime(elapsedSeconds)}
          </Text>
          <Text className="text-slate-400 text-sm mt-2">Elapsed Time</Text>
        </View>
      </View>

      {/* Controls */}
      <View className="flex-row justify-center items-center mt-12 space-x-8">
        <TouchableOpacity
          onPress={toggleTimer}
          className="w-20 h-20 rounded-full items-center justify-center shadow-lg"
          style={{ backgroundColor: task.color || "#2ECC71" }}
        >
          {isRunning ? (
            <Pause color="#FFF" size={32} fill="#FFF" />
          ) : (
            <Play color="#FFF" size={32} fill="#FFF" className="ml-1" />
          )}
        </TouchableOpacity>

        <TouchableOpacity className="w-12 h-12 rounded-full border border-slate-700 items-center justify-center">
          <RotateCcw color="#94A3B8" size={20} />
        </TouchableOpacity>
      </View>

      {/* Sessions */}
      <View className="mt-16 px-5 flex-1">
        <Text className="text-white text-base font-semibold mb-6">
          Today's Sessions
        </Text>
        {existingLog?.sessions?.map((session, i) => {
          const duration = Math.floor(
            (session.endTime - session.startTime) / 1000,
          );
          return (
            <View
              key={i}
              className="flex-row justify-between items-center py-3 border-b border-slate-800"
            >
              <Text className="text-slate-300 text-sm">
                {format(new Date(session.startTime), "h:mm a")} -{" "}
                {format(new Date(session.endTime), "h:mm a")}
              </Text>
              <Text className="text-slate-300 text-sm">
                {formatTime(duration)}
              </Text>
            </View>
          );
        })}
        {isRunning && sessionStartTime && (
          <View className="flex-row justify-between items-center py-3 border-b border-slate-800">
            <Text className="text-slate-300 text-sm">
              {format(new Date(sessionStartTime), "h:mm a")} - Now
            </Text>
            <Text className="text-[#2ECC71] text-sm font-medium">Active</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};
