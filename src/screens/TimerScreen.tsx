import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  ScrollView,
  Modal,
  TextInput,
} from "react-native";
import { useStore } from "../store/useStore";
import { formatDuration } from "../utils/formatters";
import { format } from "date-fns";
import { ChevronLeft, MoreVertical, Play, Pause, Trash2, Plus, RotateCcw } from "lucide-react-native";
import Svg, { Circle } from "react-native-svg";

const HOURS = Array.from({ length: 24 }, (_, i) =>
  i.toString().padStart(2, "0"),
);
const MINUTES = Array.from({ length: 60 }, (_, i) =>
  i.toString().padStart(2, "0"),
);

export const TimerScreen = ({ route, navigation }: any) => {
  const { taskId } = route.params || {};
  const { getTaskById, logs, activeTimers, startTimer, pauseTimer, updateTimerSessions } =
    useStore();
  const todayISO = format(new Date(), "yyyy-MM-dd");

  const task = taskId ? getTaskById(taskId) : undefined;
  const logId = taskId ? `${taskId}-${todayISO}` : null;
  const existingLog = logId ? logs[logId] : null;

  const activeTimer = taskId ? activeTimers[taskId] : undefined;
  const isRunning = !!activeTimer;
  const sessionStartTime = activeTimer?.startTime || null;

  const [tick, setTick] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [pendingDeletes, setPendingDeletes] = useState<Set<number>>(new Set());
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [manualDurationMins, setManualDurationMins] = useState("15");
  const [startHour, setStartHour] = useState("00");
  const [startMinute, setStartMinute] = useState("00");
  const hoursRef = useRef<ScrollView>(null);
  const minutesRef = useRef<ScrollView>(null);
  const hoursPositions = useRef<Record<string, number>>({});
  const minutesPositions = useRef<Record<string, number>>({});

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning) {
      interval = setInterval(() => {
        setTick((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    if (isAddModalVisible) {
      const now = new Date();
      const currentH = now.getHours().toString().padStart(2, "0");
      const currentM = now.getMinutes().toString().padStart(2, "0");
      setStartHour(currentH);
      setStartMinute(currentM);

      setTimeout(() => {
        const hY = hoursPositions.current[currentH] || 0;
        hoursRef.current?.scrollTo({ y: hY, animated: false });
        const mY = minutesPositions.current[currentM] || 0;
        minutesRef.current?.scrollTo({ y: mY, animated: false });
      }, 150);
    }
  }, [isAddModalVisible]);

  const baseElapsed = existingLog?.value || 0;
  const currentSessionElapsed = activeTimer
    ? Math.floor((Date.now() - activeTimer.startTime) / 1000)
    : 0;
  const elapsedSeconds = baseElapsed + currentSessionElapsed;

  const target = task?.target || 7200; // default 2 hours
  const progress = Math.min((elapsedSeconds / target) * 100, 100);

  const toggleTimer = () => {
    if (!taskId) return;
    if (isRunning) {
      pauseTimer(taskId, todayISO);
    } else {
      startTimer(taskId, todayISO);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleSave = () => {
    if (!existingLog || !taskId) {
      setIsEditing(false);
      return;
    }
    const currentSessions = existingLog.sessions || [];
    const updatedSessions = currentSessions.filter(s => !pendingDeletes.has(s.startTime));
    
    updateTimerSessions(taskId, todayISO, updatedSessions);
    
    setPendingDeletes(new Set());
    setIsEditing(false);
  };

  const handleCancel = () => {
    setPendingDeletes(new Set());
    setIsEditing(false);
  };

  const toggleDelete = (startTime: number) => {
    setPendingDeletes(prev => {
      const next = new Set(prev);
      if (next.has(startTime)) next.delete(startTime);
      else next.add(startTime);
      return next;
    });
  };

  const handleAddManualSession = () => {
    const mins = parseInt(manualDurationMins) || 0;
    if (mins <= 0 || !taskId) return;
    
    const dateObj = new Date();
    dateObj.setHours(parseInt(startHour, 10));
    dateObj.setMinutes(parseInt(startMinute, 10));
    dateObj.setSeconds(0);
    dateObj.setMilliseconds(0);

    const startTime = dateObj.getTime();
    const endTime = startTime + (mins * 60 * 1000);
    
    const updatedSessions = [...(existingLog?.sessions || []), { startTime, endTime }];
    updateTimerSessions(taskId, todayISO, updatedSessions);
    setIsAddModalVisible(false);
    setManualDurationMins("15");
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
            {formatDuration(target)}
          </Text>
        </View>
        {isEditing ? (
          <View className="flex-row gap-4">
            <TouchableOpacity onPress={handleCancel}>
              <Text className="text-slate-400 text-sm">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave}>
              <Text className="text-[#2ECC71] text-sm font-bold">Save</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setIsEditing(true)}>
            <Text className="text-slate-400 text-sm">Edit</Text>
          </TouchableOpacity>
        )}
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
        {/* 
        <TouchableOpacity className="w-12 h-12 rounded-full border border-slate-700 items-center justify-center">
          <RotateCcw color="#94A3B8" size={20} />
        </TouchableOpacity> */}
      </View>

      {/* Sessions */}
      <Text className="text-white text-base font-semibold mt-5 ml-5">
        Today's Sessions
      </Text>
      <View className="flex-1 mb-14 pb-8">
        <ScrollView className="mt-3 px-5 flex-1">
          {isEditing && (
            <TouchableOpacity onPress={() => setIsAddModalVisible(true)} className="flex-row items-center justify-center py-4 mt-4 bg-slate-800 rounded-xl">
               <Plus color="#2ECC71" size={20} />
               <Text className="text-[#2ECC71] font-medium ml-2">Add Manual Session</Text>
            </TouchableOpacity>
          )}
          {isRunning && sessionStartTime && (
            <View className="flex-row justify-between items-center py-3 border-b border-slate-800">
              <Text className="text-slate-300 text-sm">
                {format(new Date(sessionStartTime), "h:mm a")} - Now
              </Text>
              <Text className="text-[#2ECC71] text-sm font-medium">Active</Text>
            </View>
          )}
          {existingLog?.sessions?.sort((a, b) => b.startTime - a.startTime).map((session, i) => {
            const duration = Math.floor(
              (session.endTime - session.startTime) / 1000,
            );
            const isDeleted = pendingDeletes.has(session.startTime);
            return (
              <View
                key={session.startTime}
                className={`flex-row justify-between items-center py-3 border-b border-slate-800 ${isDeleted ? 'opacity-40' : ''}`}
              >
                <View>
                  <Text className={`text-sm ${isDeleted ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                    {format(new Date(session.startTime), "h:mm a")} -{" "}
                    {format(new Date(session.endTime), "h:mm a")}
                  </Text>
                  <Text className={`text-sm mt-1 ${isDeleted ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                    {formatTime(duration)}
                  </Text>
                </View>
                {isEditing && (
                  <TouchableOpacity onPress={() => toggleDelete(session.startTime)} className="p-2">
                    {isDeleted ? <RotateCcw color="#94A3B8" size={20} /> : <Trash2 color="#EF4444" size={20} />}
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* Add Manual Session Modal */}
      <Modal visible={isAddModalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center px-5">
          <View className="bg-[#1E293B] w-full rounded-3xl p-6 shadow-xl border border-slate-700">
            <Text className="text-lg font-bold text-white mb-4">Add Manual Session</Text>
            
            <Text className="text-sm font-semibold text-slate-400 mb-2">Start Time</Text>
            <View className="flex-row justify-between bg-[#0F172A] rounded-2xl p-3 border border-slate-700 gap-1 mb-4 h-40">
              {/* Hours Column */}
              <View className="w-[49%] items-center">
                <Text className="text-slate-500 font-bold mb-2 text-[10px] uppercase tracking-widest">
                  Hours
                </Text>
                <ScrollView
                  ref={hoursRef}
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={false}
                  className="w-full"
                >
                  {HOURS.map((item) => {
                    const isSelected = item === startHour;
                    return (
                      <TouchableOpacity
                        key={item}
                        onLayout={(e) => { hoursPositions.current[item] = e.nativeEvent.layout.y; }}
                        onPress={() => setStartHour(item)}
                        className="h-10 justify-center items-center rounded-xl mb-1"
                        style={{ backgroundColor: isSelected ? "#2ECC71" : "transparent" }}
                      >
                        <Text className="text-lg" style={{ fontWeight: isSelected ? "bold" : "500", color: isSelected ? "#ffffff" : "#94A3B8" }}>
                          {item}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
              
              {/* Minutes Column */}
              <View className="w-[49%] items-center">
                <Text className="text-slate-500 font-bold mb-2 text-[10px] uppercase tracking-widest">
                  Minutes
                </Text>
                <ScrollView
                  ref={minutesRef}
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={false}
                  className="w-full"
                >
                  {MINUTES.map((item) => {
                    const isSelected = item === startMinute;
                    return (
                      <TouchableOpacity
                        key={item}
                        onLayout={(e) => { minutesPositions.current[item] = e.nativeEvent.layout.y; }}
                        onPress={() => setStartMinute(item)}
                        className="h-10 justify-center items-center rounded-xl mb-1"
                        style={{ backgroundColor: isSelected ? "#2ECC71" : "transparent" }}
                      >
                        <Text className="text-lg" style={{ fontWeight: isSelected ? "bold" : "500", color: isSelected ? "#ffffff" : "#94A3B8" }}>
                          {item}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>

            <Text className="text-sm font-semibold text-slate-400 mb-2">Duration (minutes)</Text>
            <TextInput
              value={manualDurationMins}
              onChangeText={setManualDurationMins}
              keyboardType="numeric"
              className="bg-[#0F172A] rounded-2xl p-4 text-base text-white border border-slate-700 mb-6"
            />
            <View className="flex-row justify-end gap-3">
              <TouchableOpacity onPress={() => setIsAddModalVisible(false)} className="px-6 py-3 rounded-xl bg-slate-800">
                <Text className="font-semibold text-slate-300">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddManualSession} className="px-6 py-3 rounded-xl bg-[#2ECC71]">
                <Text className="font-semibold text-white">Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
