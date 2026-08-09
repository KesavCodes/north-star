import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  ScrollView,
} from "react-native";
import { ChevronLeft, Star, Heart } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const AboutScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const features = [
    {
      title: "Task Tracking",
      description: "Manage your daily routines and one-time tasks seamlessly.",
    },
    {
      title: "Flexible Task Types",
      description: "Track progress using checkboxes, timers, and counters.",
    },
    {
      title: "Custom Categories",
      description:
        "Organize your life with personalized categories and emojis.",
    },
    {
      title: "Analytics & Heatmap",
      description: "Visualize your consistency and productivity over time.",
    },
    {
      title: "Journaling",
      description: "Reflect on your day with daily journal entries.",
    },
    {
      title: "Reminders",
      description: "Stay on top of your goals with local notifications.",
    },
    {
      title: "Privacy First",
      description: "All your data is stored locally on your device.",
    },
  ];

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
        <Text className="text-lg font-bold text-slate-800">About</Text>
        <View className="w-8" />
      </View>

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center mt-5">
          <View className="w-24 h-24 bg-white rounded-3xl items-center justify-center mb-4 shadow-md border border-slate-100">
            <Star color="#FCD34D" size={48} fill="#FCD34D" />
          </View>
          <Text className="text-3xl font-bold text-slate-800 mb-2">
            North Star
          </Text>
          <Text className="text-slate-500 text-base">Version 1.0.0</Text>
        </View>

        <View className="bg-white rounded-3xl p-5 mt-5 shadow-xs border border-slate-100">
          <Text className="text-slate-800 text-lg font-bold mb-4 text-center">
            Features
          </Text>
          {features.map((feature, index) => (
            <View key={index} className="mb-3">
              <Text className="text-slate-800 text-base font-semibold mb-1">
                {feature.title}
              </Text>
              <Text className="text-slate-500 text-sm leading-relaxed">
                {feature.description}
              </Text>
            </View>
          ))}
        </View>

        <View className="items-center mt-5 mb-20 flex-row justify-center gap-2">
          <Text className="text-slate-500 text-base">Made with</Text>
          <Heart color="#EF4444" size={26} fill="#EF4444" className="mx-1" />
          <Text className="text-slate-500 text-base">by KesavCodes</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
