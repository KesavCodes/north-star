import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import { useStore } from "../store/useStore";
import { format, addDays, subDays } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Plus,
  Heart,
  Clock,
  Edit2,
} from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MoodLogModal } from "../components/mood/MoodLogModal";
import { MoodLog } from "../types";

export const MoodLogScreen = ({ navigation }: any) => {
  const { moodLogs } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const selectedDateStr = format(currentDate, "yyyy-MM-dd");
  const displayDate = format(currentDate, "dd MMM, yyyy");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [activeMoodLog, setActiveMoodLog] = useState<MoodLog | null>(null);

  const dayLogs = moodLogs[selectedDateStr] || [];
  const hasLogs = dayLogs.length > 0;

  const handleOpenNewMood = () => {
    setActiveMoodLog(null);
    setModalVisible(true);
  };

  const handleOpenEditMood = (log: MoodLog) => {
    setActiveMoodLog(log);
    setModalVisible(true);
  };

  const canGoBack = React.useMemo(() => {
    try {
      return Boolean(
        navigation &&
        typeof navigation.canGoBack === "function" &&
        navigation.canGoBack(),
      );
    } catch {
      return false;
    }
  }, [navigation]);

  return (
    <SafeAreaView
      className="flex-1 bg-[#F8F9FA]"
      style={{
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
      }}
    >
      {/* Top Navigation Header */}
      <View className="flex-row justify-between items-center px-5 mt-4 mb-3">
        {canGoBack ? (
          <TouchableOpacity
            onPress={() => {
              try {
                if (navigation?.canGoBack?.()) {
                  navigation.goBack();
                }
              } catch (e) {
                console.warn("Navigation goBack failed", e);
              }
            }}
            className="p-2 -ml-2"
          >
            <ChevronLeft color="#334155" size={24} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 32 }} />
        )}

        <Text className="text-lg font-bold text-slate-800">Mood Tracker</Text>

        <TouchableOpacity
          onPress={handleOpenNewMood}
          className="bg-slate-900 w-9 h-9 rounded-full items-center justify-center shadow-sm"
        >
          <Plus color="#FFFFFF" size={18} />
        </TouchableOpacity>
      </View>

      {/* Date Selector Row */}
      <View className="flex-row items-center justify-between px-5 py-2 mb-2">
        <TouchableOpacity
          onPress={() => setCurrentDate(subDays(currentDate, 1))}
          className="p-2 bg-white rounded-xl border border-slate-100 shadow-xs"
        >
          <ChevronLeft color="#64748B" size={18} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          className="flex-row items-center bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-xs"
        >
          <Calendar size={14} color="#0F766E" />
          <Text className="text-sm font-bold text-slate-800 ml-2">
            {displayDate}
          </Text>
          {hasLogs && (
            <View className="w-2 h-2 rounded-full bg-teal-500 ml-2" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setCurrentDate(addDays(currentDate, 1))}
          className="p-2 bg-white rounded-xl border border-slate-100 shadow-xs"
        >
          <ChevronRight color="#64748B" size={18} />
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={currentDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setCurrentDate(selectedDate);
          }}
        />
      )}

      {/* Daily Mood List Scroll Area */}
      <ScrollView
        className="flex-1 px-5 pt-3"
        showsVerticalScrollIndicator={false}
      >
        {hasLogs ? (
          <View className="pb-10">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {dayLogs.length} {dayLogs.length === 1 ? "Entry" : "Entries"}{" "}
                Logged
              </Text>
              <TouchableOpacity
                onPress={handleOpenNewMood}
                className="flex-row items-center"
              >
                <Plus color="#0F766E" size={14} />
                <Text className="text-xs font-bold text-teal-700 ml-1">
                  Add Mood
                </Text>
              </TouchableOpacity>
            </View>

            {dayLogs.map((log) => {
              const timeStr = format(new Date(log.timestamp), "hh:mm a");
              const themeInfo = getMoodTheme(log.mood);

              return (
                <TouchableOpacity
                  key={log.id}
                  onPress={() => handleOpenEditMood(log)}
                  className="bg-white rounded-3xl p-5 mb-4 border border-slate-100 shadow-sm flex-col justify-between"
                >
                  {/* Card Header: Avatar, Feeling & Time */}
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center flex-1 mr-2">
                      <View
                        className={`w-12 h-12 rounded-2xl items-center justify-center mr-3.5 border ${themeInfo.avatarBg}`}
                      >
                        <Text className="text-2xl">{log.mood}</Text>
                      </View>

                      <View className="flex-1">
                        <View className="flex-row items-center">
                          <Text className="text-base font-bold text-slate-800 mr-2">
                            Feeling {themeInfo.label}
                          </Text>
                        </View>

                        <View className="flex-row items-center mt-1">
                          <Clock color="#94A3B8" size={12} />
                          <Text className="text-xs text-slate-400 font-medium ml-1">
                            {timeStr}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                      <Edit2 color="#64748B" size={14} />
                    </View>
                  </View>

                  {/* Tags */}
                  {log.tags && log.tags.length > 0 && (
                    <View className="flex-row flex-wrap gap-1.5 mt-1 mb-1">
                      {log.tags.map((tag) => (
                        <View
                          key={tag}
                          className="bg-slate-50 px-3 py-1 rounded-xl border border-slate-100"
                        >
                          <Text className="text-[11px] font-semibold text-slate-600">
                            {tag}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Note with Colored Left Accent Border */}
                  {log.note ? (
                    <View
                      className={`bg-slate-50/80 p-3.5 rounded-r-2xl border-l-4 ${themeInfo.accentBorder} mt-2.5`}
                    >
                      <Text className="text-xs text-slate-700 leading-5 font-medium italic">
                        "{log.note}"
                      </Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          /* Empty State */
          <View className="bg-white rounded-3xl p-8 items-center justify-center border border-slate-100 shadow-xs my-6">
            <View className="w-16 h-16 bg-teal-50 rounded-full items-center justify-center mb-4 border border-teal-100">
              <Heart color="#0F766E" size={32} />
            </View>
            <Text className="text-slate-800 font-bold text-base mb-1">
              No Moods Logged Yet
            </Text>
            <Text className="text-slate-400 font-medium text-xs text-center leading-5 mb-6 max-w-[240px]">
              Keep track of your emotions and daily context throughout the day.
            </Text>

            <TouchableOpacity
              onPress={handleOpenNewMood}
              className="bg-slate-900 px-6 py-3 rounded-2xl flex-row items-center shadow-xs"
            >
              <Plus color="#FFFFFF" size={16} />
              <Text className="text-white font-semibold text-xs ml-2">
                Log Your Mood
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Mood Log Modal */}
      <MoodLogModal
        visible={modalVisible}
        moodLog={activeMoodLog}
        date={selectedDateStr}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const getMoodTheme = (emoji: string) => {
  switch (emoji) {
    case "😄":
      return {
        label: "Great",
        scoreText: "5/5",
        avatarBg: "bg-emerald-50 border-emerald-200/80",
        badgeBg: "bg-emerald-100/80 text-emerald-800 border-emerald-200/80",
        accentBorder: "border-l-emerald-500",
      };
    case "🙂":
      return {
        label: "Good",
        scoreText: "4/5",
        avatarBg: "bg-blue-50 border-blue-200/80",
        badgeBg: "bg-blue-100/80 text-blue-800 border-blue-200/80",
        accentBorder: "border-l-blue-500",
      };
    case "😐":
      return {
        label: "Okay",
        scoreText: "3/5",
        avatarBg: "bg-slate-100 border-slate-200/80",
        badgeBg: "bg-slate-200/80 text-slate-800 border-slate-300/80",
        accentBorder: "border-l-slate-400",
      };
    case "🙁":
      return {
        label: "Bad",
        scoreText: "2/5",
        avatarBg: "bg-amber-50 border-amber-200/80",
        badgeBg: "bg-amber-100/80 text-amber-800 border-amber-200/80",
        accentBorder: "border-l-amber-500",
      };
    case "😭":
      return {
        label: "Awful",
        scoreText: "1/5",
        avatarBg: "bg-rose-50 border-rose-200/80",
        badgeBg: "bg-rose-100/80 text-rose-800 border-rose-200/80",
        accentBorder: "border-l-rose-500",
      };
    default:
      return {
        label: "Good",
        scoreText: "4/5",
        avatarBg: "bg-teal-50 border-teal-200/80",
        badgeBg: "bg-teal-100/80 text-teal-800 border-teal-200/80",
        accentBorder: "border-l-teal-500",
      };
  }
};
