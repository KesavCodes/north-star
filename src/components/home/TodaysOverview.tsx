import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";
import { format } from "date-fns";
import { useStore } from "../../store/useStore";
import { Task } from "../../types";
import Svg, { Circle } from "react-native-svg";

const cardConfig = {
  discipline: {
    name: "Discipline",
    completedColor: "#2ECC71",
    pendingColor: "#f1f2f6",
    emoji: "🌱",
  },
  kindness: {
    name: "Kindness",
    completedColor: "#F39C12",
    pendingColor: "#f1f2f6",
    emoji: "❤️",
  },
};

const OverviewCards = ({
  type,
  taskData,
}: {
  type: "discipline" | "kindness";
  taskData: Task[];
}) => {
  const navigation = useNavigation<any>();
  const { logs } = useStore();
  const today = format(new Date(), "dd MMM, yyyy");
  const completedTasks = taskData.reduce((acc, curr) => {
    const logId = `${curr.id}-${today}`;
    if (logs[logId]?.completed) {
      return acc + 1;
    }
    return acc;
  }, 0);

  const percentage =
    taskData.length > 0 ? (completedTasks / taskData.length) * 100 : 0;
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate("DailyTracker", { category: type })}
      className="flex-row items-center justify-between flex-1 bg-white rounded-3xl p-5 shadow-sm border-2 mr-2"
      style={{
        borderTopColor: cardConfig[type].completedColor + "15", // slate-100
        borderLeftColor: "#f1f5f9",
        borderRightColor: cardConfig[type].completedColor + "25", // theme color with opacity
        borderBottomColor: cardConfig[type].completedColor + "15",
      }}
    >
      <View className="gap-2">
        <Text className="text-md font-semibold text-slate-800">
          {cardConfig[type].name}
        </Text>
        <Text className="text-xs">{cardConfig[type].emoji}</Text>
        <Text className="text-sm text-slate-500 font-medium">
          <Text className="text-md font-semibold text-slate-800">
            {completedTasks}
          </Text>{" "}
          / {taskData.length} tasks
        </Text>
      </View>
      <View className="">
        {/* Circular Progress */}
        <View className="items-center justify-center relative">
          <Svg width="40" height="40" viewBox="0 0 40 40">
            {/* Background Circle */}
            <Circle
              cx="20"
              cy="20"
              r={radius}
              stroke={cardConfig[type].pendingColor}
              strokeWidth="4"
              fill="transparent"
            />
            {/* Progress Circle */}
            <Circle
              cx="20"
              cy="20"
              r={radius}
              stroke={cardConfig[type].completedColor}
              strokeWidth="4"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 20 20)"
            />
          </Svg>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const TodaysOverview = () => {
  const { getTasksForDate } = useStore();
  const todayISO = new Date().toISOString().split("T")[0];
  // Filter tasks for today
  const activeTasks = getTasksForDate(todayISO);
  // Compute progress for Discipline
  const disciplineTasks = activeTasks.filter(
    (t) => t.category === "discipline",
  );
  const kindnessTasks = activeTasks.filter((t) => t.category === "kindness");
  return (
    <View className="mt-8">
      <Text className="text-lg font-bold text-slate-800 mb-4">
        Today's Overview
      </Text>
      <View className="flex-row space-x-4">
        {/* Discipline Card */}
        <OverviewCards type="discipline" taskData={disciplineTasks} />
        {/* Kindness Card */}
        <OverviewCards type="kindness" taskData={kindnessTasks} />
      </View>
    </View>
  );
};

export default TodaysOverview;
