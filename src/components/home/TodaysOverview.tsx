import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";
import { format } from "date-fns";
import { useStore } from "../../store/useStore";
import { Task, Category } from "../../types";
import Svg, { Circle } from "react-native-svg";
import { LayoutGrid } from "lucide-react-native";

const OverviewCard = ({
  category,
  taskData,
}: {
  category: Category;
  taskData: Task[];
}) => {
  const navigation = useNavigation<any>();
  const { logs } = useStore();
  const today = format(new Date(), "yyyy-MM-dd");
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
      onPress={() =>
        navigation.navigate("DailyTracker", { category: category.id })
      }
      className="flex-row items-center justify-between bg-white rounded-3xl p-4 shadow-sm border-2 mb-3"
      style={{
        width: "49%",
        borderTopColor: category.color + "15",
        borderLeftColor: "#f1f5f9",
        borderRightColor: category.color + "25",
        borderBottomColor: category.color + "15",
      }}
    >
      <View className="gap-1 flex-1">
        <Text
          className="text-sm font-semibold text-slate-800"
          numberOfLines={1}
        >
          {category.name}
        </Text>
        <Text className="text-xs">{category.emoji}</Text>
        <Text className="text-xs text-slate-500 font-medium">
          <Text className="text-sm font-semibold text-slate-800">
            {completedTasks}
          </Text>{" "}
          / {taskData.length}
        </Text>
      </View>
      <View className="ml-1">
        <View className="items-center justify-center relative">
          <Svg width="36" height="36" viewBox="0 0 40 40">
            <Circle
              cx="20"
              cy="20"
              r={radius}
              stroke="#f1f2f6"
              strokeWidth="4"
              fill="transparent"
            />
            <Circle
              cx="20"
              cy="20"
              r={radius}
              stroke={category.color}
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

const ShowAllCard = () => {
  const navigation = useNavigation<any>();
  return (
    <TouchableOpacity
      onPress={() => navigation.navigate("DailyTracker", { category: "all" })}
      className="flex-row items-center justify-center bg-white rounded-3xl p-4 shadow-sm border-2 mb-3 border-slate-100"
      style={{
        width: "49%",
      }}
    >
      <View className="items-center justify-center gap-2">
        <View className="w-10 h-10 rounded-full bg-slate-200 items-center justify-center">
          <LayoutGrid color="#64748b" size={20} />
        </View>
        <Text className="text-sm font-semibold text-slate-600">Show All</Text>
      </View>
    </TouchableOpacity>
  );
};

const TodaysOverview = () => {
  const { getTasksForDate, categories } = useStore();
  const todayISO = format(new Date(), "yyyy-MM-dd");
  const activeTasks = getTasksForDate(todayISO);

  const activeCategories = categories.filter((c) => !c.isArchived);
  const displayCategories =
    activeCategories.length > 4 ? activeCategories.slice(0, 3) : activeCategories;
  const showAllButton = activeCategories.length > 4;

  return (
    <View className="mt-8">
      <Text className="text-lg font-bold text-slate-800 mb-4">
        Today's Overview
      </Text>
      <View className="flex-row flex-wrap justify-between">
        {displayCategories.map((category) => {
          const categoryTasks = activeTasks.filter(
            (t) => t.category === category.id,
          );
          return (
            <OverviewCard
              key={category.id}
              category={category}
              taskData={categoryTasks}
            />
          );
        })}
        {showAllButton && <ShowAllCard />}
      </View>
    </View>
  );
};

export default TodaysOverview;
