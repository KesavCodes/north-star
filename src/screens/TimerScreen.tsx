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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ClockTimePicker } from "../components/ClockTimePicker";

export const TimerScreen = ({ route, navigation }: any) => {
  const insets = useSafeAreaInsets();
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

  const handleOpenAddModal = () => {
    const now = new Date();
    setStartHour(now.getHours().toString().padStart(2, "0"));
    setStartMinute(now.getMinutes().toString().padStart(2, "0"));
    setIsAddModalVisible(true);
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning) {
      interval = setInterval(() => {
        setTick((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

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
      <SafeAreaView className="flex-1 bg-[#F8F9FA] items-center justify-center">
        <Text className="text-slate-800 font-semibold text-base">Task not found</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mt-4 px-5 py-2.5 bg-slate-800 rounded-xl"
        >
          <Text className="text-white font-medium">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

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
        <Text className="text-lg font-bold text-slate-800">{task.name}</Text>
        <TouchableOpacity className="p-2 -mr-2">
          <MoreVertical color="#334155" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-5 mt-5"
        showsVerticalScrollIndicator={false}
      >
        {/* Daily Target Header */}
        <View className="flex-row justify-between items-center bg-white rounded-3xl px-5 py-3 border border-slate-100 shadow-xs mb-6">
          <View>
            <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              DAILY TARGET
            </Text>
            <Text className="text-slate-800 text-base font-bold mt-1">
              {formatDuration(target)}
            </Text>
          </View>
          {isEditing ? (
            <View className="flex-row gap-3">
              <TouchableOpacity onPress={handleCancel} className="px-3 py-1.5 rounded-full bg-slate-100">
                <Text className="text-slate-600 text-xs font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} className="px-4 py-1.5 rounded-full bg-teal-700">
                <Text className="text-white text-xs font-bold">Save</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setIsEditing(true)} className="px-4 py-1.5 rounded-full bg-slate-900">
              <Text className="text-white text-xs font-bold">Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Timer Circle */}
        <View className="items-center justify-center relative">
          <Svg
            width={radius * 2 + strokeWidth * 2}
            height={radius * 2 + strokeWidth * 2}
          >
            <Circle
              cx={radius + strokeWidth}
              cy={radius + strokeWidth}
              r={radius}
              stroke="#E2E8F0"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            <Circle
              cx={radius + strokeWidth}
              cy={radius + strokeWidth}
              r={radius}
              stroke={task.color || "#0F766E"}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${radius + strokeWidth} ${radius + strokeWidth})`}
            />
          </Svg>
          <View className="absolute items-center justify-center">
            <Text className="text-slate-400 text-xs font-bold tracking-wider uppercase mb-1">Today</Text>
            <Text className="text-4xl font-bold text-slate-800 tracking-widest">
              {formatTime(elapsedSeconds)}
            </Text>
            <Text className="text-slate-400 text-xs font-medium mt-1">Elapsed Time</Text>
          </View>
        </View>

        {/* Controls */}
        <View className="flex-row justify-center items-center mt-5">
          <TouchableOpacity
            onPress={toggleTimer}
            className="w-20 h-20 rounded-full items-center justify-center shadow-md"
            style={{ backgroundColor: task.color || "#0F766E" }}
          >
            {isRunning ? (
              <Pause color="#FFF" size={32} fill="#FFF" />
            ) : (
              <Play color="#FFF" size={32} fill="#FFF" className="ml-1" />
            )}
          </TouchableOpacity>
        </View>

        {/* Sessions */}
        <View className="mt-5 mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Today's Sessions
            </Text>
            <TouchableOpacity
              onPress={handleOpenAddModal}
              className="flex-row items-center bg-slate-100 px-3 py-1 rounded-full border border-slate-200/60"
            >
              <Plus color="#0F766E" size={14} />
              <Text className="text-xs font-bold text-teal-700 ml-1">
                Add Session
              </Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white rounded-3xl px-5 py-3 border border-slate-100 shadow-xs mb-16">
            {isRunning && sessionStartTime && (
              <View className="flex-row justify-between items-center py-3 border-b border-slate-100">
                <Text className="text-slate-700 font-medium text-sm">
                  {format(new Date(sessionStartTime), "h:mm a")} - Now
                </Text>
                <Text className="text-teal-600 font-bold text-xs bg-teal-50 px-3 py-1 rounded-full border border-teal-100">Active</Text>
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
                  className={`flex-row justify-between items-center py-3 border-b border-slate-100 ${isDeleted ? 'opacity-40' : ''}`}
                >
                  <View>
                    <Text className={`text-sm font-medium ${isDeleted ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                      {format(new Date(session.startTime), "h:mm a")} -{" "}
                      {format(new Date(session.endTime), "h:mm a")}
                    </Text>
                    <Text className={`text-xs mt-1 ${isDeleted ? 'text-slate-400 line-through' : 'text-slate-500'}`}>
                      {formatTime(duration)}
                    </Text>
                  </View>
                  {isEditing && (
                    <TouchableOpacity onPress={() => toggleDelete(session.startTime)} className="p-2">
                      {isDeleted ? <RotateCcw color="#94A3B8" size={18} /> : <Trash2 color="#EF4444" size={18} />}
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
            {(!existingLog?.sessions || existingLog.sessions.length === 0) && !isRunning && (
              <View className="py-4 items-center">
                <Text className="text-slate-400 text-xs mb-3">No sessions logged today.</Text>
                <TouchableOpacity
                  onPress={handleOpenAddModal}
                  className="flex-row items-center bg-teal-50 px-4 py-2 rounded-xl border border-teal-100"
                >
                  <Plus color="#0F766E" size={16} />
                  <Text className="text-teal-700 font-bold text-xs ml-1.5">Add Manual Session</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Add Manual Session Modal */}
      <Modal visible={isAddModalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/40 justify-center items-center px-5">
          <View className="bg-white w-full rounded-3xl p-6 shadow-xl border border-slate-100">
            <Text className="text-lg font-bold text-slate-800 mb-4">Add Manual Session</Text>

            <Text className="text-sm font-semibold text-slate-700 mb-2">Start Time</Text>
            <View className="mb-4">
              <ClockTimePicker
                title="Start Time"
                hours={startHour}
                minutes={startMinute}
                onTimeChange={(h, m) => {
                  setStartHour(h);
                  setStartMinute(m);
                }}
              />
            </View>

            <Text className="text-sm font-semibold text-slate-700 mb-2">Duration (minutes)</Text>
            <TextInput
              value={manualDurationMins}
              onChangeText={setManualDurationMins}
              keyboardType="numeric"
              className="bg-slate-50 rounded-2xl p-4 text-base text-slate-800 border border-slate-100 mb-6"
            />
            <View className="flex-row justify-end gap-3">
              <TouchableOpacity onPress={() => setIsAddModalVisible(false)} className="px-5 py-2.5 rounded-xl bg-slate-100">
                <Text className="font-semibold text-slate-600 text-sm">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddManualSession} className="px-5 py-2.5 rounded-xl bg-slate-900">
                <Text className="font-semibold text-white text-sm">Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
