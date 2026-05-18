import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  SafeAreaView,
} from "react-native";
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { format } from "date-fns";
import { useStore } from "../../store/useStore";
import { Task, Category } from "../../types";
import Svg, { Circle } from "react-native-svg";
import {
  LayoutGrid,
  ArrowUp,
  ArrowDown,
  X,
  ArrowUpDown,
} from "lucide-react-native";

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
  const { getTasksForDate, categories, reorderCategories } = useStore();
  const todayISO = format(new Date(), "yyyy-MM-dd");
  const activeTasks = getTasksForDate(todayISO);
  const [isReorderModalVisible, setIsReorderModalVisible] = useState(false);

  const activeCategories = categories.filter((c) => !c.isArchived);
  const displayCategories =
    activeCategories.length > 4
      ? activeCategories.slice(0, 3)
      : activeCategories;
  const showAllButton = activeCategories.length > 4;

  const moveCategory = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index > 0) {
      const currentCat = activeCategories[index];
      const prevCat = activeCategories[index - 1];

      const newCategories = [...categories];
      const currIdx = newCategories.findIndex((c) => c.id === currentCat.id);
      const prevIdx = newCategories.findIndex((c) => c.id === prevCat.id);

      newCategories[currIdx] = prevCat;
      newCategories[prevIdx] = currentCat;

      reorderCategories(newCategories);
    } else if (direction === "down" && index < activeCategories.length - 1) {
      const currentCat = activeCategories[index];
      const nextCat = activeCategories[index + 1];

      const newCategories = [...categories];
      const currIdx = newCategories.findIndex((c) => c.id === currentCat.id);
      const nextIdx = newCategories.findIndex((c) => c.id === nextCat.id);

      newCategories[currIdx] = nextCat;
      newCategories[nextIdx] = currentCat;

      reorderCategories(newCategories);
    }
  };

  return (
    <View className="mt-8">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-bold text-slate-800">
          Today's Overview
        </Text>
        <TouchableOpacity
          onPress={() => setIsReorderModalVisible(true)}
          className="flex-row items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-full"
        >
          <ArrowUpDown size={14} color="#64748b" />
          <Text className="text-xs font-semibold text-slate-600">Reorder</Text>
        </TouchableOpacity>
      </View>
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

      <Modal
        visible={isReorderModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsReorderModalVisible(false)}
      >
        <SafeAreaView className="flex-1 bg-[#F8F9FA]">
          <View className="flex-row justify-between items-center p-5 border-b border-slate-200 bg-white">
            <Text className="text-lg font-bold text-slate-800">
              Reorder Categories
            </Text>
            <TouchableOpacity
              onPress={() => setIsReorderModalVisible(false)}
              className="p-2 -mr-2"
            >
              <X size={24} color="#64748b" />
            </TouchableOpacity>
          </View>
          <ScrollView className="flex-1 p-5">
            <Text className="text-sm text-slate-500 mb-2">
              Use the arrows to change the order of your categories. The first 3
              active categories will be shown on the home screen.
            </Text>
            <Text className="text-xs text-slate-400 mb-4 italic">
              Note: Archived categories are not shown here.
            </Text>
            <View className="bg-white rounded-2xl overflow-hidden border border-slate-200">
              {activeCategories.map((category, index) => (
                <View
                  key={category.id}
                  className={`flex-row items-center justify-between p-4 ${
                    index !== activeCategories.length - 1
                      ? "border-b border-slate-100"
                      : ""
                  }`}
                >
                  <View className="flex-row items-center flex-1">
                    <Text className="text-xl mr-3">{category.emoji}</Text>
                    <Text className="text-base font-medium text-slate-800 flex-1">
                      {category.name}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <TouchableOpacity
                      onPress={() => moveCategory(index, "up")}
                      disabled={index === 0}
                      className={`p-2 rounded-full ${index === 0 ? "bg-transparent" : "bg-slate-100"}`}
                    >
                      <ArrowUp
                        size={20}
                        color={index === 0 ? "#cbd5e1" : "#475569"}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => moveCategory(index, "down")}
                      disabled={index === activeCategories.length - 1}
                      className={`p-2 rounded-full ${index === activeCategories.length - 1 ? "bg-transparent" : "bg-slate-100"}`}
                    >
                      <ArrowDown
                        size={20}
                        color={
                          index === activeCategories.length - 1
                            ? "#cbd5e1"
                            : "#475569"
                        }
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

export default TodaysOverview;
