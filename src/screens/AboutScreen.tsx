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
import {
  ChevronLeft,
  Star,
  Heart,
  Target,
  Clock,
  Smile,
  BookOpen,
  Flame,
  FolderPlus,
  Bell,
  ShieldCheck,
  Compass,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const AboutScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const features = [
    {
      title: "Habits, Focus Timers & Counters",
      description:
        "Track your routines your way. Use checkable habits for daily routines, countdown timers for deep work sessions, and numeric counters for goals like drinking 8 glasses of water.",
      icon: Target,
      iconColor: "#3B82F6",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-100",
    },
    {
      title: "Interactive Focus Sessions",
      description:
        "Start a timer when you sit down to focus or study. North Star tracks your exact focus time in real time with live system notifications, logging every completed session.",
      icon: Clock,
      iconColor: "#0F766E",
      bgColor: "bg-teal-50",
      borderColor: "border-teal-100",
    },
    {
      title: "Mood & Energy Check-ins",
      description:
        "Check in with yourself throughout the day. Log how you feel with intuitive mood emojis, track your energy levels, and add reflection notes to notice emotional patterns.",
      icon: Smile,
      iconColor: "#F59E0B",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-100",
    },
    {
      title: "Private Daily Journal",
      description:
        "Keep a personal diary of your thoughts, wins, and reflections. Browse past dates to read or edit your journal entries whenever you like.",
      icon: BookOpen,
      iconColor: "#EC4899",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-100",
    },
    {
      title: "Streaks & Consistency Heatmaps",
      description:
        "Build long-term momentum. Track your active and best completion streaks for every task, and view your monthly progress on a contribution heatmap.",
      icon: Flame,
      iconColor: "#EF4444",
      bgColor: "bg-rose-50",
      borderColor: "border-rose-100",
    },
    {
      title: "Custom Categories & Emojis",
      description:
        "Organize your life into categories like Health, Learning, or Work. Customize each area with vibrant color palettes and expressive emojis.",
      icon: FolderPlus,
      iconColor: "#10B981",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-100",
    },
    {
      title: "Smart Local Reminders",
      description:
        "Set personalized reminder notifications for your daily routines so you never forget important tasks during your busy schedule.",
      icon: Bell,
      iconColor: "#8B5CF6",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-100",
    },
    {
      title: "100% Offline & Data Control",
      description:
        "Your privacy comes first. All your data stays strictly on your device with zero cloud tracking. Easily export or import a full JSON backup file anytime.",
      icon: ShieldCheck,
      iconColor: "#6366F1",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-100",
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
        <Text className="text-lg font-bold text-slate-800">About North Star</Text>
        <View className="w-8" />
      </View>

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
      >
        {/* App Banner */}
        <View className="items-center mt-5">
          <View className="w-24 h-24 bg-white rounded-3xl items-center justify-center mb-3 shadow-xs border border-slate-100">
            <Star color="#FCD34D" size={48} fill="#FCD34D" />
          </View>
          <Text className="text-3xl font-bold text-slate-800 mb-1">
            North Star
          </Text>
          <Text className="text-slate-500 text-sm font-semibold mb-2">Version 1.0.0</Text>
        </View>

        <View className="items-center mb-5 flex-row justify-center gap-1.5">
          <Text className="text-slate-400 text-base font-medium">Made with</Text>
          <Heart color="#EF4444" size={16} fill="#EF4444" />
          <Text className="text-slate-400 text-base font-medium">by Kesav</Text>
        </View>
        {/* Intro Mission Card */}
        <View className="bg-white rounded-3xl p-4 mb-5 shadow-xs border border-slate-100">
          <View className="flex-row items-center gap-2 mb-2 justify-center">
            <Compass color="#0F766E" size={20} />
            <Text className="text-slate-800 text-lg font-bold">
              Your Personal Compass
            </Text>
          </View>
          <Text className="text-slate-600 text-sm leading-relaxed text-justify">
            North Star is designed to help you cultivate discipline, stay focused, and maintain daily awareness. Track daily habits, manage focus sessions, log emotional well-being, and write daily journal reflections - all in one clean, privacy-focused app.
          </Text>
        </View>

        {/* Features List */}
        <View className="mb-6">
          <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 ml-1">
            Core Features
          </Text>
          <View className="space-y-3 gap-3">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <View
                  key={index}
                  className="bg-white rounded-3xl p-4 shadow-xs border border-slate-100 flex-row items-start"
                >
                  <View className={`w-10 h-10 rounded-2xl ${feature.bgColor} border ${feature.borderColor} items-center justify-center mr-3.5 mt-0.5`}>
                    <IconComponent color={feature.iconColor} size={20} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-slate-800 text-base font-bold mb-1">
                      {feature.title}
                    </Text>
                    <Text className="text-slate-500 text-xs leading-relaxed">
                      {feature.description}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
