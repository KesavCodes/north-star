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
import TimePickerDropdown from "../components/addTask/TimePickerDropdown";
import { useToast } from "../components/ToastProvider";

export const AddTaskScreen = ({ navigation }: any) => {
  const { addTask } = useStore();
  const { showToast } = useToast();

  const [taskType, setTaskType] = useState<TaskType>("checkbox");
  const [isRoutine, setIsRoutine] = useState(true);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<TaskCategory>("discipline");
  const [targetDurationHours, setTargetDurationHours] = useState("02");
  const [targetDurationMinutes, setTargetDurationMinutes] = useState("00");
  const [targetCount, setTargetCount] = useState("1");
  const [selectedColor, setSelectedColor] = useState("#2ECC71");
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderHours, setReminderHours] = useState(
    new Date().getHours().toString().padStart(2, "0")
  );
  const [reminderMinutes, setReminderMinutes] = useState(
    new Date().getMinutes().toString().padStart(2, "0")
  );

  const colors = [
    "#2ECC71",
    "#3498DB",
    "#9B59B6",
    "#E67E22",
    "#E74C3C",
    "#95A5A6",
  ];

  const handleSave = () => {
    if (!name.trim()) {
      showToast({
        title: "Missing Name",
        body: "Please enter a name for the task.",
        type: "error",
      });
      return;
    }

    let target: number | undefined;
    if (taskType === "timer") {
      const h = parseInt(targetDurationHours) || 0;
      const m = parseInt(targetDurationMinutes) || 0;
      target = h * 3600 + m * 60;
      if (target <= 0) {
        showToast({
          title: "Invalid Duration",
          body: "Please set a target duration greater than 0.",
          type: "error",
        });
        return;
      }
    } else if (taskType === "counter") {
      target = parseInt(targetCount, 10);
      if (!target || isNaN(target) || target <= 0) {
        showToast({
          title: "Invalid Target Count",
          body: "Please enter a valid positive number for the counter target.",
          type: "error",
        });
        return;
      }
    }

    addTask({
      name,
      type: taskType,
      category,
      isRoutine,
      date: isRoutine ? undefined : format(new Date(), "yyyy-MM-dd"),
      target,
      reminderTime: reminderEnabled ? `${reminderHours}:${reminderMinutes}` : undefined,
      color: selectedColor,
      icon: "star", // dummy icon for now
    });

    showToast({
      title: "Task Added",
      body: `Successfully added ${name}.`,
      type: "success",
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
        <View className="flex-row space-x-4 mb-6 gap-2">
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
        <View className="flex-row justify-between space-x-3 mb-6 gap-2">
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

        {/* Daily Target */}
        {taskType !== "checkbox" && (
          <>
            <Text className="text-sm font-semibold text-slate-800 mb-3">
              Daily Target
            </Text>
            {taskType === "timer" ? (
              <View className="mb-6">
                <TimePickerDropdown
                  hours={targetDurationHours}
                  minutes={targetDurationMinutes}
                  onHoursChange={setTargetDurationHours}
                  onMinutesChange={setTargetDurationMinutes}
                />
              </View>
            ) : (
              <View className="bg-white rounded-2xl border border-slate-100 mb-6 flex-row items-center p-2">
                <Hash color="#94A3B8" size={22} />
                <TextInput
                  value={targetCount}
                  onChangeText={(val) => setTargetCount(val.replace(/[^0-9]/g, ""))}
                  keyboardType="number-pad"
                  className="text-lg font-bold text-slate-800 flex-1 ml-2"
                  placeholder="e.g. 5"
                />
              </View>
            )}
          </>
        )}

        {/* Category */}
        <Text className="text-sm font-semibold text-slate-800 mb-3">
          Category
        </Text>
        <View className="flex-row flex-wrap gap-2 mb-6">
          {useStore((state) => state.categories)
            .filter((c) => !c.isArchived)
            .map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setCategory(cat.id)}
                className="flex-row items-center justify-center px-4 py-3 rounded-2xl border"
                style={{
                  borderColor: category === cat.id ? cat.color : "#e2e8f0",
                  backgroundColor:
                    category === cat.id ? cat.color + "15" : "#fff",
                }}
              >
                <Text className="text-lg mr-2">{cat.emoji}</Text>
                <Text
                  className={`font-medium`}
                  style={{ color: category === cat.id ? cat.color : "#64748b" }}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
        </View>

        {/* Icon & Color */}
        <Text className="text-sm font-semibold text-slate-800 mb-3">Color</Text>
        <View className="bg-white rounded-2xl p-4 border border-slate-100 mb-6 flex-row justify-between items-center">
          <View className="flex-row space-x-2 gap-1">
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
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-sm font-semibold text-slate-800">
            Reminder (Optional)
          </Text>
          {reminderEnabled && (
            <TouchableOpacity onPress={() => setReminderEnabled(false)}>
              <Text className="text-red-500 font-medium">Remove</Text>
            </TouchableOpacity>
          )}
        </View>

        {reminderEnabled ? (
          <View className="mb-12">
            <TimePickerDropdown
              title="Set Reminder Time"
              hours={reminderHours}
              minutes={reminderMinutes}
              onHoursChange={setReminderHours}
              onMinutesChange={setReminderMinutes}
            />
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => setReminderEnabled(true)}
            className="bg-white rounded-2xl p-4 border border-slate-100 mb-12 flex-row justify-between items-center"
          >
            <Text className="text-slate-400">Add reminder</Text>
            <ChevronRight color="#CBD5E1" size={20} />
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
