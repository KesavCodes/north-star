import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import { useStore } from "../store/useStore";
import {
  X,
  Check,
  CheckSquare,
  Clock,
  Hash,
  ShieldCheck,
  Heart,
  ChevronRight,
  CalendarDays,
  Repeat,
} from "lucide-react-native";
import { TaskType, TaskCategory } from "../types";
import { format } from "date-fns";

export const AddTaskScreen = ({ navigation }: any) => {
  const { addTask } = useStore();

  const [taskType, setTaskType] = useState<TaskType>("checkbox");
  const [isRoutine, setIsRoutine] = useState(true);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<TaskCategory>("discipline");
  const [targetDurationHours, setTargetDurationHours] = useState("02");
  const [targetDurationMinutes, setTargetDurationMinutes] = useState("00");
  const [targetCount, setTargetCount] = useState("1");
  const [selectedColor, setSelectedColor] = useState("#2ECC71");

  const colors = [
    "#2ECC71",
    "#3498DB",
    "#9B59B6",
    "#E67E22",
    "#E74C3C",
    "#95A5A6",
  ];

  const handleSave = () => {
    if (!name.trim()) return;

    let target: number | undefined;
    if (taskType === "timer") {
      const h = parseInt(targetDurationHours) || 0;
      const m = parseInt(targetDurationMinutes) || 0;
      target = h * 3600 + m * 60;
    } else if (taskType === "counter") {
      target = parseInt(targetCount) || 1;
    }

    addTask({
      name,
      type: taskType,
      category,
      isRoutine,
      date: isRoutine ? undefined : format(new Date(), "yyyy-MM-dd"),
      target,
      color: selectedColor,
      icon: "star", // dummy icon for now
    });

    navigation.goBack();
  };

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
          <X color="#334155" size={24} />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-800">Add New Task</Text>
        <TouchableOpacity onPress={handleSave} className="p-2 -mr-2">
          <Check color="#334155" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-5 mt-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Frequency */}
        <Text className="text-sm font-semibold text-slate-800 mb-3">
          Frequency
        </Text>
        <View className="flex-row space-x-4 mb-6">
          <TouchableOpacity
            onPress={() => setIsRoutine(true)}
            className={`flex-1 flex-row items-center justify-center p-3 rounded-2xl border ${isRoutine ? "border-indigo-500 bg-indigo-50" : "border-slate-200 bg-white"}`}
          >
            <Repeat color={isRoutine ? "#6366F1" : "#94A3B8"} size={18} />
            <Text
              className={`ml-2 font-medium ${isRoutine ? "text-indigo-500" : "text-slate-500"}`}
            >
              Routine
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setIsRoutine(false)}
            className={`flex-1 flex-row items-center justify-center p-3 rounded-2xl border ${!isRoutine ? "border-teal-500 bg-teal-50" : "border-slate-200 bg-white"}`}
          >
            <CalendarDays
              color={!isRoutine ? "#14B8A6" : "#94A3B8"}
              size={18}
            />
            <Text
              className={`ml-2 font-medium ${!isRoutine ? "text-teal-500" : "text-slate-500"}`}
            >
              One-time
            </Text>
          </TouchableOpacity>
        </View>

        {/* Task Type */}
        <Text className="text-sm font-semibold text-slate-800 mb-3">
          Task Type
        </Text>
        <View className="flex-row justify-between space-x-3 mb-6">
          <TouchableOpacity
            onPress={() => setTaskType("checkbox")}
            className={`flex-1 flex-col items-center justify-center p-4 rounded-2xl border-2 ${taskType === "checkbox" ? "border-blue-500 bg-blue-50" : "border-slate-100 bg-white"}`}
          >
            <CheckSquare
              color={taskType === "checkbox" ? "#3B82F6" : "#94A3B8"}
              size={28}
            />
            <Text
              className={`text-xs mt-2 font-medium ${taskType === "checkbox" ? "text-blue-500" : "text-slate-400"}`}
            >
              Checkbox
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setTaskType("timer")}
            className={`flex-1 flex-col items-center justify-center p-4 rounded-2xl border-2 ${taskType === "timer" ? "border-purple-500 bg-purple-50" : "border-slate-100 bg-white"}`}
          >
            <Clock
              color={taskType === "timer" ? "#A855F7" : "#94A3B8"}
              size={28}
            />
            <Text
              className={`text-xs mt-2 font-medium ${taskType === "timer" ? "text-purple-500" : "text-slate-400"}`}
            >
              Timer
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setTaskType("counter")}
            className={`flex-1 flex-col items-center justify-center p-4 rounded-2xl border-2 ${taskType === "counter" ? "border-orange-500 bg-orange-50" : "border-slate-100 bg-white"}`}
          >
            <Hash
              color={taskType === "counter" ? "#F97316" : "#94A3B8"}
              size={28}
            />
            <Text
              className={`text-xs mt-2 font-medium ${taskType === "counter" ? "text-orange-500" : "text-slate-400"}`}
            >
              Counter
            </Text>
          </TouchableOpacity>
        </View>

        {/* Task Name */}
        <Text className="text-sm font-semibold text-slate-800 mb-3">
          Task Name
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Coding, Studying"
          className="bg-white rounded-2xl p-4 text-base text-slate-800 border border-slate-100 mb-6"
        />

        {/* Category */}
        <Text className="text-sm font-semibold text-slate-800 mb-3">
          Category
        </Text>
        <View className="flex-row space-x-4 mb-6">
          <TouchableOpacity
            onPress={() => setCategory("discipline")}
            className={`flex-1 flex-row items-center justify-center p-3 rounded-2xl border ${category === "discipline" ? "border-[#2ECC71] bg-[#E8F8F5]" : "border-slate-200 bg-white"}`}
          >
            <ShieldCheck
              color={category === "discipline" ? "#2ECC71" : "#94A3B8"}
              size={18}
            />
            <Text
              className={`ml-2 font-medium ${category === "discipline" ? "text-[#2ECC71]" : "text-slate-500"}`}
            >
              Discipline
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setCategory("kindness")}
            className={`flex-1 flex-row items-center justify-center p-3 rounded-2xl border ${category === "kindness" ? "border-[#F39C12] bg-[#FEF5E7]" : "border-slate-200 bg-white"}`}
          >
            <Heart
              color={category === "kindness" ? "#F39C12" : "#94A3B8"}
              size={18}
            />
            <Text
              className={`ml-2 font-medium ${category === "kindness" ? "text-[#F39C12]" : "text-slate-500"}`}
            >
              Kindness
            </Text>
          </TouchableOpacity>
        </View>

        {/* Daily Target */}
        {taskType !== "checkbox" && (
          <>
            <Text className="text-sm font-semibold text-slate-800 mb-3">
              Daily Target
            </Text>
            {taskType === "timer" ? (
              <View className="bg-white rounded-2xl p-4 border border-slate-100 mb-6 flex-row items-center">
                <Clock color="#94A3B8" size={20} />
                <TextInput
                  value={targetDurationHours}
                  onChangeText={setTargetDurationHours}
                  keyboardType="numeric"
                  maxLength={2}
                  className="text-lg font-bold text-slate-800 ml-3 w-8 text-center bg-slate-50 rounded-lg py-1"
                />
                <Text className="text-lg font-bold text-slate-800 mx-1">:</Text>
                <TextInput
                  value={targetDurationMinutes}
                  onChangeText={setTargetDurationMinutes}
                  keyboardType="numeric"
                  maxLength={2}
                  className="text-lg font-bold text-slate-800 w-8 text-center bg-slate-50 rounded-lg py-1"
                />
                <Text className="text-slate-400 ml-2 text-sm">hh:mm</Text>
              </View>
            ) : (
              <View className="bg-white rounded-2xl p-4 border border-slate-100 mb-6 flex-row items-center">
                <Hash color="#94A3B8" size={20} />
                <TextInput
                  value={targetCount}
                  onChangeText={setTargetCount}
                  keyboardType="numeric"
                  className="text-lg font-bold text-slate-800 ml-3 flex-1"
                />
              </View>
            )}
          </>
        )}

        {/* Icon & Color */}
        <Text className="text-sm font-semibold text-slate-800 mb-3">Color</Text>
        <View className="bg-white rounded-2xl p-4 border border-slate-100 mb-6 flex-row justify-between items-center">
          <View className="flex-row space-x-2">
            {colors.map((color) => (
              <TouchableOpacity
                key={color}
                onPress={() => setSelectedColor(color)}
                className={`w-8 h-8 rounded-full items-center justify-center`}
                style={{ backgroundColor: color }}
              >
                {selectedColor === color && <Check color="#FFF" size={16} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Reminder (Optional) */}
        <Text className="text-sm font-semibold text-slate-800 mb-3">
          Reminder (Optional)
        </Text>
        <TouchableOpacity className="bg-white rounded-2xl p-4 border border-slate-100 mb-12 flex-row justify-between items-center">
          <Text className="text-slate-400">Add reminder</Text>
          <ChevronRight color="#CBD5E1" size={20} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};
