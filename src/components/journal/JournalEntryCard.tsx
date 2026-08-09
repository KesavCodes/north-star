import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { JournalEntry } from "../../types";
import { format } from "date-fns";
import { BookOpen, Clock, Trash2, ChevronRight } from "lucide-react-native";

interface JournalEntryCardProps {
  entry: JournalEntry;
  onPress: () => void;
  onDelete: () => void;
}

export const JournalEntryCard: React.FC<JournalEntryCardProps> = ({
  entry,
  onPress,
  onDelete,
}) => {
  const timeStr = format(new Date(entry.createdAt), "hh:mm a");

  // Generate a clean text preview snippet from Markdown content
  const previewSnippet = (entry.content || "")
    .replace(/^#+\s+/gm, "") // remove heading symbols
    .replace(/[*_~`]/g, "") // remove formatting symbols
    .trim()
    .slice(0, 100);

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-3xl px-5 py-3 mb-2 shadow-sm border border-slate-100 flex-col justify-between"
    >
      {/* Card Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center flex-1 mr-2">
          <View className="w-10 h-10 rounded-2xl bg-indigo-50 items-center justify-center mr-3 border border-indigo-100">
            <Text className="text-base">{entry.mood || "📝"}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-slate-800" numberOfLines={1}>
              {entry.title || "Journal Entry"}
            </Text>
            <View className="flex-row items-center mt-0.5">
              <Clock color="#94A3B8" size={12} />
              <Text className="text-xs text-slate-400 font-medium ml-1">
                {timeStr}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={onDelete}
          className="p-2 bg-red-50 rounded-full"
        >
          <Trash2 color="#EF4444" size={16} />
        </TouchableOpacity>
      </View>

      {/* Snippet Preview */}
      {previewSnippet ? (
        <Text
          className="text-xs text-slate-500 font-normal leading-5 mb-3 bg-slate-50 p-3 rounded-2xl"
          numberOfLines={3}
        >
          {previewSnippet}
        </Text>
      ) : (
        <Text className="text-xs text-slate-400 italic mb-3">
          No content snippet available.
        </Text>
      )}

      {/* Footer Action Link */}
      <View className="flex-row items-center justify-between pt-2 border-t border-slate-50">
        <Text className="text-xs font-semibold text-indigo-600">
          Read / Edit Entry
        </Text>
        <ChevronRight color="#6366F1" size={16} />
      </View>
    </TouchableOpacity>
  );
};
