import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { MoodLog } from "../../types";
import { useStore } from "../../store/useStore";
import { useToast } from "../ToastProvider";
import { theme } from "../../constants/theme";
import { X, Check, Trash2, Heart } from "lucide-react-native";

interface MoodLogModalProps {
  visible: boolean;
  moodLog?: MoodLog | null; // null when creating new
  date: string; // YYYY-MM-DD
  onClose: () => void;
}

const MOOD_OPTIONS: {
  emoji: "😄" | "🙂" | "😐" | "🙁" | "😭";
  label: string;
  score: number;
}[] = [
  { emoji: "😄", label: "Great", score: 5 },
  { emoji: "🙂", label: "Good", score: 4 },
  { emoji: "😐", label: "Okay", score: 3 },
  { emoji: "🙁", label: "Bad", score: 2 },
  { emoji: "😭", label: "Awful", score: 1 },
];

const AVAILABLE_TAGS = [
  "Work",
  "Exercise",
  "Sleep",
  "Family",
  "Health",
  "Social",
  "Rest",
  "Mindfulness",
  "Hobbies",
  "Diet",
];

export const MoodLogModal: React.FC<MoodLogModalProps> = ({
  visible,
  moodLog,
  date,
  onClose,
}) => {
  const { addMoodLog, updateMoodLog, deleteMoodLog } = useStore();
  const { showToast } = useToast();

  const [selectedEmoji, setSelectedEmoji] = useState<
    "😄" | "🙂" | "😐" | "🙁" | "😭"
  >("😄");
  const [selectedScore, setSelectedScore] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (visible) {
      if (moodLog) {
        setSelectedEmoji(moodLog.mood);
        setSelectedScore(moodLog.score || 5);
        setSelectedTags(moodLog.tags || []);
        setNote(moodLog.note || "");
      } else {
        setSelectedEmoji("😄");
        setSelectedScore(5);
        setSelectedTags([]);
        setNote("");
      }
    }
  }, [visible, moodLog]);

  const handleSelectMood = (
    emoji: "😄" | "🙂" | "😐" | "🙁" | "😭",
    score: number,
  ) => {
    setSelectedEmoji(emoji);
    setSelectedScore(score);
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSave = () => {
    if (moodLog) {
      updateMoodLog(moodLog.id, date, {
        mood: selectedEmoji,
        score: selectedScore,
        tags: selectedTags,
        note: note.trim(),
      });
      showToast({
        title: "Mood Updated",
        body: "Your mood log has been updated.",
        type: "success",
      });
    } else {
      addMoodLog({
        date,
        mood: selectedEmoji,
        score: selectedScore,
        tags: selectedTags,
        note: note.trim(),
      });
      showToast({
        title: "Mood Saved",
        body: "Recorded your mood for today.",
        type: "success",
      });
    }

    onClose();
  };

  const handleDelete = () => {
    if (moodLog) {
      deleteMoodLog(moodLog.id, date);
      showToast({
        title: "Mood Deleted",
        body: "Mood entry removed.",
        type: "success",
      });
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/60 justify-end">
        <View className="bg-white rounded-t-3xl p-6 h-[85%] flex-col">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
              <View className="w-9 h-9 rounded-full bg-teal-50 items-center justify-center mr-2.5">
                <Heart color="#0F766E" size={18} />
              </View>
              <Text className="text-lg font-bold text-slate-800">
                {moodLog ? "Edit Mood Log" : "Log How You Feel"}
              </Text>
            </View>

            <TouchableOpacity onPress={onClose} className="p-2 -mr-2">
              <X color="#94A3B8" size={22} />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Emotion 5-Pill Selector */}
            <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Select Emotion
            </Text>
            <View className="flex-row items-center justify-between mb-6">
              {MOOD_OPTIONS.map((item) => {
                const isSelected = selectedEmoji === item.emoji;
                return (
                  <TouchableOpacity
                    key={item.emoji}
                    onPress={() => handleSelectMood(item.emoji, item.score)}
                    className={`flex-1 items-center py-3 px-1 rounded-2xl mx-0.5 border ${
                      isSelected
                        ? "bg-teal-50 border-teal-600 shadow-xs"
                        : "bg-slate-50 border-slate-100"
                    }`}
                  >
                    <Text className="text-2xl mb-1">{item.emoji}</Text>
                    <Text
                      className={`text-[11px] font-bold ${
                        isSelected ? "text-teal-800" : "text-slate-500"
                      }`}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Life Area Tags */}
            <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Activities & Context (Optional)
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-6">
              {AVAILABLE_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <TouchableOpacity
                    key={tag}
                    onPress={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full border ${
                      isSelected
                        ? "bg-slate-800 border-slate-800"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        isSelected ? "text-white" : "text-slate-600"
                      }`}
                    >
                      {isSelected ? `✓ ${tag}` : tag}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Optional Note */}
            <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Note (Optional)
            </Text>
            <View className="bg-slate-50 rounded-2xl p-3 border border-slate-100 mb-6">
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="What's on your mind?"
                placeholderTextColor="#CBD5E1"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                className="text-sm text-slate-700 leading-5 min-h-[70px]"
              />
            </View>
          </ScrollView>

          {/* Action Footer */}
          <View className="flex-row items-center space-x-2 gap-2 pt-3 border-t border-slate-100">
            {moodLog && (
              <TouchableOpacity
                onPress={handleDelete}
                className="bg-red-50 p-3.5 rounded-2xl border border-red-100 items-center justify-center"
              >
                <Trash2 color="#EF4444" size={18} />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleSave}
              className="flex-1 bg-slate-900 rounded-2xl py-3.5 flex-row items-center justify-center shadow-sm"
            >
              <Check color="#10B981" size={18} />
              <Text className="text-white font-bold text-base ml-2">
                Save Mood Log
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
