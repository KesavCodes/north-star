import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  ScrollView,
} from "react-native";
import { X, Check } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStore } from "../store/useStore";
import { useToast } from "../components/ToastProvider";

export const AddCategoryScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { categories, addCategory } = useStore();
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("");
  const [selectedColor, setSelectedColor] = useState("#2ECC71");

  const colors = [
    "#2ECC71", // Green
    "#3498DB", // Blue
    "#9B59B6", // Purple
    "#E67E22", // Orange
    "#E74C3C", // Red
    "#F1C40F", // Yellow
    "#1ABC9C", // Teal
    "#95A5A6", // Gray
  ];

  const handleSave = () => {
    const trimmedName = name.trim();
    const trimmedEmoji = emoji.trim();

    if (!trimmedName) {
      showToast({
        title: "Missing Name",
        body: "Please enter a name for the category.",
        type: "error",
      });
      return;
    }

    if (!trimmedEmoji) {
      showToast({
        title: "Missing Emoji",
        body: "Please enter an emoji.",
        type: "error",
      });
      return;
    }

    const isDuplicate = categories.some(
      (c) => c.name.trim().toLowerCase() === trimmedName.toLowerCase(),
    );

    if (isDuplicate) {
      showToast({
        title: "Category Already Exists",
        body: `A category named "${trimmedName}" already exists.`,
        type: "error",
      });
      return;
    }

    addCategory({
      name: trimmedName,
      emoji: trimmedEmoji,
      color: selectedColor,
    });

    showToast({
      title: "Category Added",
      body: `Successfully created ${trimmedName}.`,
      type: "success",
    });

    navigation.goBack();
  };

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
          <X color="#334155" size={24} />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-800 w-1/2 text-center">
          Add Category
        </Text>
        <TouchableOpacity onPress={handleSave} className="p-2 -mr-2">
          <Check color="#334155" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-5 mt-5"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-sm font-semibold text-slate-800 mb-3">
          Category Name
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Fitness, Learning"
          className="bg-white rounded-2xl p-4 text-base text-slate-800 border border-slate-100 mb-5"

        />

        <Text className="text-sm font-semibold text-slate-800 mb-3">
          Emoji Icon
        </Text>
        <TextInput
          value={emoji}
          onChangeText={(text) => {
            // Filter out non-emoji characters
            // This regex keeps pictographic emojis, zero-width joiners, skin tones, and flag indicators
            const emojiOnly = text.replace(
              /[^\p{Extended_Pictographic}\p{Emoji_Presentation}\u200D\uFE0F\u{1F1E6}-\u{1F1FF}\u{1F3FB}-\u{1F3FF}]/gu,
              "",
            );

            if (!emojiOnly) {
              setEmoji("");
              return;
            }

            try {
              // Use Intl.Segmenter to safely extract exactly one visual character (grapheme)
              // This properly handles complex emojis (like flags, families) that consist of multiple Unicode points
              const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
              const segments = Array.from(segmenter.segment(emojiOnly));
              // Always keep only the first visual emoji
              if (segments.length > 0) {
                setEmoji(segments[0].segment);
              }
            } catch (error) {
              // Fallback for older JS engines
              setEmoji(emojiOnly.slice(0, 10));
            }
          }}
          keyboardType="twitter"
          placeholder="e.g. 🎨"
          className="bg-white rounded-2xl p-4 text-base border border-slate-100 mb-5"
        />

        <Text className="text-sm font-semibold text-slate-800 mb-3">Color</Text>
        <View className="bg-white rounded-2xl px-4 py-3 border border-slate-100 mb-5 flex-row justify-between items-center">
          <View className="flex-row space-x-2 gap-1">
            {colors.map((color) => (
              <TouchableOpacity
                key={color}
                onPress={() => setSelectedColor(color)}
                className={`w-8 h-8 rounded-full items-center justify-center`}
                style={{ backgroundColor: color }}
              >
                {selectedColor === color && <Check color="#FFF" size={16} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
