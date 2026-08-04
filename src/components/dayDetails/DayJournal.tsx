import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useStore } from "../../store/useStore";
import { useToast } from "../ToastProvider";
import { JournalEntryCard } from "../journal/JournalEntryCard";
import { JournalEditorModal } from "../journal/JournalEditorModal";
import { JournalEntry } from "../../types";
import { BookOpen, Plus } from "lucide-react-native";

interface Props {
  date: string; // YYYY-MM-DD
}

export const DayJournal = ({ date }: Props) => {
  const { journals, deleteJournalEntry } = useStore();
  const { showToast } = useToast();
  const [editorVisible, setEditorVisible] = useState(false);
  const [activeEntry, setActiveEntry] = useState<JournalEntry | null>(null);

  const dayEntries = journals[date] || [];

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
            deleteJournalEntry(entry.id, date);
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

  return (
    <ScrollView
      className="flex-1 px-5 mt-6"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-sm font-bold text-slate-500 tracking-wider">
          JOURNAL ENTRIES ({dayEntries.length})
        </Text>
        <TouchableOpacity
          onPress={handleOpenNewEntry}
          className="flex-row items-center bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100"
        >
          <Plus color="#6366F1" size={14} />
          <Text className="text-xs font-semibold text-indigo-600 ml-1">
            New Entry
          </Text>
        </TouchableOpacity>
      </View>

      {dayEntries.length > 0 ? (
        <View className="gap-2">
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
        <View className="bg-white rounded-3xl p-6 border border-dashed border-slate-200 items-center justify-center shadow-sm my-2">
          <View className="w-12 h-12 bg-indigo-50 rounded-full items-center justify-center mb-3">
            <BookOpen color="#6366F1" size={24} />
          </View>
          <Text className="text-slate-800 font-bold text-base mb-1">
            No Entries Recorded for this Date
          </Text>
          <Text className="text-slate-400 font-medium text-xs text-center leading-5 mb-4">
            Log reflections, daily gratitude, or notes for this date.
          </Text>
          <TouchableOpacity
            onPress={handleOpenNewEntry}
            className="bg-slate-900 px-4 py-2.5 rounded-2xl flex-row items-center"
          >
            <Plus color="#FFFFFF" size={14} />
            <Text className="text-white font-semibold text-xs ml-1.5">
              Add Journal Entry
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Editor Modal */}
      <JournalEditorModal
        visible={editorVisible}
        entry={activeEntry}
        date={date}
        onClose={() => setEditorVisible(false)}
      />
    </ScrollView>
  );
};
