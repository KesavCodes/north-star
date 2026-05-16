import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  ScrollView,
  Alert,
} from "react-native";
import { ChevronLeft, Plus, Trash2 } from "lucide-react-native";
import { useStore } from "../store/useStore";
import { useToast } from "../components/ToastProvider";

export const ManageCategoriesScreen = ({ navigation }: any) => {
  const { categories, deleteCategory, tasks } = useStore();
  const { showToast } = useToast();

  const handleDelete = (categoryId: string, categoryName: string) => {
    // Check if category is in use
    let isInUse = false;
    for (const dateKey in tasks) {
      if (tasks[dateKey].some((t) => t.category === categoryId)) {
        isInUse = true;
        break;
      }
    }

    if (isInUse) {
      showToast({
        title: "Category in use",
        body: `Cannot delete "${categoryName}" because it has associated tasks.`,
        type: "error",
      });
      return;
    }

    Alert.alert(
      "Delete Category",
      `Are you sure you want to delete "${categoryName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteCategory(categoryId);
            showToast({
              title: "Category Deleted",
              body: `Successfully deleted ${categoryName}.`,
              type: "success",
            });
          },
        },
      ],
    );
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
          <ChevronLeft color="#334155" size={24} />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-800">
          Manage Categories
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("AddCategoryScreen")}
          className="p-2 -mr-2"
        >
          <Plus color="#334155" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-5 mt-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-white rounded-3xl p-2 shadow-sm border border-slate-50">
          {categories.map((category, index) => (
            <View key={category.id}>
              <View className="flex-row items-center justify-between p-4">
                <View className="flex-row items-center flex-1">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: category.color + "20" }}
                  >
                    <Text className="text-lg">{category.emoji}</Text>
                  </View>
                  <Text className="text-base font-semibold text-slate-800">
                    {category.name}
                  </Text>
                </View>

                {/* Prevent deleting default categories for safety, or let user delete if not in use? 
                    Let's allow deleting any category as long as it's not in use. */}
                <TouchableOpacity
                  onPress={() => handleDelete(category.id, category.name)}
                  className="p-2 bg-red-50 rounded-full"
                >
                  <Trash2 color="#EF4444" size={18} />
                </TouchableOpacity>
              </View>
              {index < categories.length - 1 && (
                <View className="h-[1px] bg-slate-100 mx-4" />
              )}
            </View>
          ))}
          {categories.length === 0 && (
            <Text className="text-slate-400 text-center py-6">
              No categories found.
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
