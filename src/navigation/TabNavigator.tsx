import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Home,
  Calendar,
  PlusCircle,
  Book,
  User,
  CheckSquare,
  FolderPlus,
  X,
} from "lucide-react-native";
import { HomeScreen } from "../screens/HomeScreen";
import { JournalScreen } from "../screens/JournalScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { CalendarHeatmapScreen } from "../screens/CalendarHeatmapScreen";

const Tab = createBottomTabNavigator();

// Empty component for the "Add Task" tab which will be intercepted
const AddTaskPlaceholder = () => null;

export const TabNavigator = ({ navigation }: any) => {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const insets = useSafeAreaInsets();

  const bottomPadding = Math.max(insets.bottom, 8);
  const tabBarHeight = 58 + bottomPadding;

  return (
    <>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: true,
          tabBarActiveTintColor: "#0F766E",
          tabBarInactiveTintColor: "#94A3B8",
          tabBarStyle: {
            backgroundColor: "#FFFFFF",
            borderTopWidth: 1,
            borderTopColor: "#F1F5F9",
            elevation: 12,
            shadowColor: "#000",
            shadowOpacity: 0.08,
            shadowRadius: 10,
            height: tabBarHeight,
            paddingBottom: bottomPadding,
            paddingTop: 6,
          },
        }}
      >
        <Tab.Screen
          name="Today"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          }}
        />
        <Tab.Screen
          name="Journal"
          component={JournalScreen}
          options={{
            tabBarIcon: ({ color, size }) => <Book color={color} size={size} />,
          }}
        />
        <Tab.Screen
          name="AddTab"
          component={AddTaskPlaceholder}
          options={{
            tabBarLabel: "",
            tabBarIcon: ({ color }) => (
              <View className="bg-[#2ECC71] w-14 h-14 rounded-full items-center justify-center shadow-lg -mt-4">
                <PlusCircle color="#FFF" size={32} />
              </View>
            ),
          }}
          listeners={() => ({
            tabPress: (e) => {
              e.preventDefault();
              setShowAddMenu(true);
            },
          })}
        />
        <Tab.Screen
          name="Calendar"
          component={CalendarHeatmapScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Calendar color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
          }}
        />
      </Tab.Navigator>

      {/* Add Menu Bottom Sheet */}
      <Modal visible={showAddMenu} transparent animationType="fade">
        <View className="flex-1 justify-end bg-black/50">
          <TouchableOpacity
            className="flex-1"
            onPress={() => setShowAddMenu(false)}
            activeOpacity={1}
          />
          <View
            className="bg-white rounded-t-3xl p-6 shadow-xl"
            style={{ paddingBottom: Math.max(insets.bottom + 20, 36) }}
          >
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-lg font-bold text-slate-800">
                Create New
              </Text>
              <TouchableOpacity
                onPress={() => setShowAddMenu(false)}
                className="p-2 bg-slate-100 rounded-full"
              >
                <X color="#64748b" size={20} />
              </TouchableOpacity>
            </View>

            <View className="flex-row gap-4">
              <TouchableOpacity
                className="flex-1 bg-blue-50 border border-blue-100 p-4 rounded-2xl items-center gap-3"
                onPress={() => {
                  setShowAddMenu(false);
                  navigation.navigate("AddTaskScreen");
                }}
              >
                <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center">
                  <CheckSquare color="#3b82f6" size={24} />
                </View>
                <Text className="font-semibold text-blue-600">Task</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 bg-emerald-50 border border-emerald-100 p-4 rounded-2xl items-center gap-3"
                onPress={() => {
                  setShowAddMenu(false);
                  navigation.navigate("AddCategoryScreen");
                }}
              >
                <View className="w-12 h-12 rounded-full bg-emerald-100 items-center justify-center">
                  <FolderPlus color="#10b981" size={24} />
                </View>
                <Text className="font-semibold text-emerald-600">Category</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};
