import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar,
  Alert,
} from "react-native";
import { useStore } from "../store/useStore";
import { format, addDays, subDays } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Plus,
  BookOpen,
} from "lucide-react-native";
import { useToast } from "../components/ToastProvider";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useResetScrollOnFocus } from "../hooks/useResetScrollOnFocus";
import { JournalEntryCard } from "../components/journal/JournalEntryCard";
import { JournalEditorModal } from "../components/journal/JournalEditorModal";
import { JournalEntry } from "../types";

export const JournalScreen = ({ navigation }: any) => {
  const { journals, deleteJournalEntry } = useStore();
  const { showToast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const selectedDateStr = format(currentDate, "yyyy-MM-dd");
  const displayDate = format(currentDate, "dd MMM, yyyy");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [editorVisible, setEditorVisible] = useState(false);
  const [activeEntry, setActiveEntry] = useState<JournalEntry | null>(null);

  const scrollRef = useResetScrollOnFocus<ScrollView>();

  const dayEntries = journals[selectedDateStr] || [];
  const hasEntries = dayEntries.length > 0;

  const handleOpenNewEntry = () => {
    setActiveEntry(null);
    setEditorVisible(true);
  };

  const handleOpenEditEntry = (entry: JournalEntry) => {
    setActiveEntry(entry);
    setEditorVisible(true);
  };

  const handleDeleteEntry = (entry: JournalEntry) => {
    Alert.alert(
      "Delete Journal Entry",
      `Are you sure you want to delete "${entry.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteJournalEntry(entry.id, selectedDateStr);
            showToast({
              title: "Entry Deleted",
              body: "Journal entry removed.",
              type: "success",
            });
          },
        },
      ],
    );
  };

  const canGoBack = React.useMemo(() => {
    try {
      return Boolean(navigation && typeof navigation.canGoBack === "function" && navigation.canGoBack());
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
      {/* Top Header */}
      <View className="flex-row justify-between items-center px-5 mt-6">
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

        {/* Date Selector Pill */}
        <View className="flex-row items-center bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
          <TouchableOpacity
            onPress={() => setCurrentDate(subDays(currentDate, 1))}
            className="p-1"
          >
            <ChevronLeft size={16} color="#64748b" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="flex-row items-center mx-2"
          >
            <Calendar size={12} color="#64748b" />
            <Text className="text-sm font-semibold text-slate-800 ml-2">
              {displayDate}
            </Text>
            {/* {hasEntries && (
              <View className="w-2 h-2 rounded-full bg-teal-500 ml-1.5" />
            )} */}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setCurrentDate(addDays(currentDate, 1))}
            className="p-1"
          >
            <ChevronRight size={16} color="#64748b" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleOpenNewEntry} className="p-2 -mr-2">
          <Plus color="#334155" size={24} />
        </TouchableOpacity>
      </View>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={currentDate}
          mode="date"
          onChange={(event: any, selectedDate?: Date) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setCurrentDate(selectedDate);
            }
          }}
        />
      )}

      {/* Main Journal Entries List for Day */}
      <ScrollView
        ref={scrollRef}
        className="flex-1 px-5 mt-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-bold text-slate-800">
            Journal Entries
          </Text>
          <Text className="text-xs font-semibold text-slate-400">
            {dayEntries.length} {dayEntries.length === 1 ? "Entry" : "Entries"}
          </Text>
        </View>

        {dayEntries.length > 0 ? (
          <View>
            {dayEntries.map((entry) => (
              <JournalEntryCard
                key={entry.id}
                entry={entry}
                onPress={() => handleOpenEditEntry(entry)}
                onDelete={() => handleDeleteEntry(entry)}
              />
            ))}
          </View>
        ) : (
          <View className="bg-white rounded-3xl p-8 border border-dashed border-slate-200 items-center justify-center shadow-sm">
            <View className="w-14 h-14 bg-indigo-50 rounded-full items-center justify-center mb-3">
              <BookOpen color="#6366F1" size={28} />
            </View>
            <Text className="text-slate-800 font-bold text-base mb-1">
              No Journal Entries Yet
            </Text>
            <Text className="text-slate-400 font-medium text-xs text-center leading-5 mb-5 max-w-[240px]">
              Reflect on your day, log your gratitude, or start a new journal entry.
            </Text>

            <TouchableOpacity
              onPress={handleOpenNewEntry}
              className="bg-slate-900 px-5 py-3 rounded-2xl flex-row items-center shadow-sm"
            >
              <Plus color="#FFFFFF" size={16} />
              <Text className="text-white font-semibold text-xs ml-2">
                Add New Journal Entry
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Editor Modal */}
      <JournalEditorModal
        visible={editorVisible}
        entry={activeEntry}
        date={selectedDateStr}
        onClose={() => setEditorVisible(false)}
      />
    </SafeAreaView>
  );
};
