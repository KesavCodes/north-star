import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  Home,
  BarChart2,
  PlusCircle,
  Book,
  User,
  CheckSquare,
  FolderPlus,
  X,
} from "lucide-react-native";
import { HomeScreen } from "../screens/HomeScreen";
import { JournalScreen } from "../screens/JournalScreen";
import { AnalyticsScreen } from "../screens/AnalyticsScreen";
import { ProfileScreen } from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator();

// Empty component for the "Add Task" tab which will be intercepted
const AddTaskPlaceholder = () => null;

export const TabNavigator = ({ navigation }: any) => {
  const [showAddMenu, setShowAddMenu] = useState(false);
  return (
    <>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: true,
          tabBarActiveTintColor: "#2ECC71",
          tabBarInactiveTintColor: "#95A5A6",
          tabBarStyle: {
            backgroundColor: "#FFFFFF",
            borderTopWidth: 0,
            elevation: 10,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 10,
            height: 70,
            paddingBottom: 15,
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
          name="Analytics"
          component={AnalyticsScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <BarChart2 color={color} size={size} />
            ),
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
          name="Journal"
          component={JournalScreen}
          options={{
            tabBarIcon: ({ color, size }) => <Book color={color} size={size} />,
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
          <View className="bg-white rounded-t-3xl p-6 pb-12 shadow-xl">
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
