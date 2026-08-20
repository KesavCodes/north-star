import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import { MoodLog } from "../../types";
import { useStore, DEFAULT_MOOD_TAGS } from "../../store/useStore";
import { useToast } from "../ToastProvider";
import { X, Check, Trash2, Heart, Plus, Search } from "lucide-react-native";

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

export const MoodLogModal: React.FC<MoodLogModalProps> = ({
  visible,
  moodLog,
  date,
  onClose,
}) => {
  const {
    addMoodLog,
    updateMoodLog,
    deleteMoodLog,
    moodTags = DEFAULT_MOOD_TAGS,
    addMoodTag,
  } = useStore();
  const { showToast } = useToast();

  const [selectedEmoji, setSelectedEmoji] = useState<
    "😄" | "🙂" | "😐" | "🙁" | "😭"
  >("😄");
  const [selectedScore, setSelectedScore] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [tagSearchQuery, setTagSearchQuery] = useState("");

  // Combine moodTags from store and any tags present in current log, sorted by stored O(1) count
  const sortedAllTags = useMemo(() => {
    const activeTagMap = new Map<string, { name: string; count: number }>();

    moodTags.forEach((t) => {
      activeTagMap.set(t.name.toLowerCase(), { name: t.name, count: t.count });
    });

    // Ensure tags from existing log or selected tags are present
    [...(moodLog?.tags || []), ...selectedTags].forEach((name) => {
      if (!activeTagMap.has(name.toLowerCase())) {
        activeTagMap.set(name.toLowerCase(), { name, count: 0 });
      }
    });

    const list = Array.from(activeTagMap.values());
    return list.sort((a, b) => {
      const countDiff = b.count - a.count;
      if (countDiff !== 0) return countDiff;
      return a.name.localeCompare(b.name);
    });
  }, [moodTags, moodLog, selectedTags]);

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
      setTagSearchQuery("");
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

  const handleCreateCustomTag = () => {
    const trimmed = tagSearchQuery.trim();
    if (!trimmed) return;

    if (!selectedTags.includes(trimmed)) {
      setSelectedTags([...selectedTags, trimmed]);
    }
    // Save to Zustand store
    addMoodTag(trimmed);
    setTagSearchQuery("");
  };

  const queryTrimmed = tagSearchQuery.trim().toLowerCase();
  const isSearching = queryTrimmed.length > 0;

  // Filter tags: if NOT searching, show top 10 most used tags. If searching, filter across all.
  const displayedTags = useMemo(() => {
    if (!isSearching) {
      return sortedAllTags.slice(0, 10);
    }
    return sortedAllTags.filter((tagObj) =>
      tagObj.name.toLowerCase().includes(queryTrimmed),
    );
  }, [sortedAllTags, queryTrimmed, isSearching]);

  const exactMatchExists = sortedAllTags.some(
    (t) => t.name.toLowerCase() === queryTrimmed,
  );
  const showCreateOption = isSearching && !exactMatchExists;

  const handleSave = () => {
    // Ensure all selected tags exist in store
    selectedTags.forEach((tag) => {
      addMoodTag(tag);
    });

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
          <View className="flex-row justify-between items-center mb-4 pb-2 border-b border-slate-100">
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

            {/* Life Area Tags Header */}
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Activities & Context ({selectedTags.length})
              </Text>
              {!isSearching && (
                <Text className="text-[11px] font-medium text-slate-400">
                  Showing Top 10 Most Used
                </Text>
              )}
            </View>

            {/* Selected Tags Chips */}
            {selectedTags.length > 0 && (
              <View className="flex-row flex-wrap gap-2 mb-3">
                {selectedTags.map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    onPress={() => toggleTag(tag)}
                    className="flex-row items-center bg-slate-800 px-3 py-1.5 rounded-full"
                  >
                    <Text className="text-xs font-semibold text-white mr-1.5">
                      ✓ {tag}
                    </Text>
                    <X color="#FFFFFF" size={12} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Search & Custom Tag Input */}
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 mb-3">
              <Search color="#94A3B8" size={16} className="mr-2" />
              <TextInput
                value={tagSearchQuery}
                onChangeText={setTagSearchQuery}
                placeholder="Search tags or create new..."
                placeholderTextColor="#94A3B8"
                onSubmitEditing={handleCreateCustomTag}
                returnKeyType="done"
                className="flex-1 text-sm text-slate-800 p-0 font-medium"
              />
              {tagSearchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setTagSearchQuery("")}
                  className="p-1"
                >
                  <X color="#94A3B8" size={16} />
                </TouchableOpacity>
              )}
            </View>

            {/* Tags Selection & Add Button */}
            <View className="flex-row flex-wrap gap-2 mb-6">
              {showCreateOption && (
                <TouchableOpacity
                  onPress={handleCreateCustomTag}
                  className="flex-row items-center bg-teal-50 border border-teal-300 px-3.5 py-1.5 rounded-full"
                >
                  <Plus color="#0F766E" size={14} className="mr-1" />
                  <Text className="text-xs font-bold text-teal-800">
                    Add "{tagSearchQuery.trim()}"
                  </Text>
                </TouchableOpacity>
              )}

              {displayedTags.map((tagObj) => {
                const isSelected = selectedTags.includes(tagObj.name);
                if (isSelected) return null;

                return (
                  <TouchableOpacity
                    key={tagObj.name}
                    onPress={() => toggleTag(tagObj.name)}
                    className="px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200 flex-row items-center"
                  >
                    <Text className="text-xs font-semibold text-slate-600">
                      + {tagObj.name}
                    </Text>
                    {tagObj.count > 0 && (
                      <Text className="text-[10px] font-bold text-slate-400 ml-1">
                        ({tagObj.count})
                      </Text>
                    )}
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
