import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { useStore, DEFAULT_MOOD_TAGS } from "../store/useStore";
import {
  ChevronLeft,
  Tag,
  Plus,
  Trash2,
  Search,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const ManageMoodTagsScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const {
    moodTags = DEFAULT_MOOD_TAGS,
    addMoodTag,
    deleteMoodTag,
  } = useStore();

  const [newTagInput, setNewTagInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Instant O(1) sort by stored count descending, then alphabetically
  const sortedTags = useMemo(() => {
    return [...moodTags].sort((a, b) => {
      const countDiff = b.count - a.count;
      if (countDiff !== 0) return countDiff;
      return a.name.localeCompare(b.name);
    });
  }, [moodTags]);

  const handleAddTag = () => {
    const trimmed = newTagInput.trim();
    if (!trimmed) return;

    if (
      moodTags.some(
        (t) => t.name.toLowerCase() === trimmed.toLowerCase(),
      )
    ) {
      Alert.alert("Tag Exists", `"${trimmed}" is already on your tags list.`);
      return;
    }

    addMoodTag(trimmed);
    setNewTagInput("");
  };

  const handleDeleteTag = (id: string, name: string) => {
    Alert.alert(
      "Delete Tag",
      `Are you sure you want to delete "${name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMoodTag(id),
        },
      ],
    );
  };

  const query = searchQuery.trim().toLowerCase();

  const filteredTags = useMemo(() => {
    if (!query) return sortedTags;
    return sortedTags.filter((t) => t.name.toLowerCase().includes(query));
  }, [sortedTags, query]);

  return (
    <SafeAreaView
      className="flex-1 bg-[#F8F9FA]"
      style={{
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
        paddingBottom: Math.max(insets.bottom, 16),
      }}
    >
      {/* Header matching ManageCategoriesScreen */}
      <View className="flex-row justify-between items-center px-5 mt-6 mb-2">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="p-2 -ml-2"
        >
          <ChevronLeft color="#334155" size={24} />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-800">
          Manage Mood Tags
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1 px-5 mt-2"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Add New Tag Card */}
        <View className="bg-white rounded-3xl p-5 mb-3 shadow-xs border border-slate-100">
          <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Create Mood Tag
          </Text>
          <View className="flex-row items-center gap-2">
            <View className="flex-1 flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5">
              <TextInput
                value={newTagInput}
                onChangeText={setNewTagInput}
                placeholder="e.g. Gaming, Reading, Travel..."
                placeholderTextColor="#94A3B8"
                onSubmitEditing={handleAddTag}
                returnKeyType="done"
                className="flex-1 text-sm text-slate-800 p-0 font-medium ml-1"
              />
            </View>
            <TouchableOpacity
              onPress={handleAddTag}
              className="bg-teal-700 px-4 py-2.5 rounded-2xl flex-row items-center justify-center shadow-xs active:bg-teal-800"
            >
              <Plus color="#FFFFFF" size={18} />
              <Text className="text-white font-bold text-sm ml-1">Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-white border border-slate-200 rounded-2xl px-3.5 py-2.5 mb-5 shadow-xs">
          <Search color="#94A3B8" size={14} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search tags..."
            placeholderTextColor="#94A3B8"
            className="flex-1 text-sm text-slate-800 p-0 font-medium ml-2"
          />
        </View>

        {/* Unified Tags Section */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              All Mood Tags ({filteredTags.length})
            </Text>
          </View>

          {filteredTags.length > 0 ? (
            <View className="space-y-2 gap-1.5">
              {filteredTags.map((tagObj) => (
                <View
                  key={tagObj.id || tagObj.name}
                  className="flex-row items-center justify-between bg-white px-4 py-3 rounded-2xl border border-slate-100 shadow-xs"
                >
                  <View className="flex-row items-center flex-1 mr-2">
                    <View className="w-8 h-8 rounded-xl bg-teal-50 items-center justify-center mr-3">
                      <Tag color="#0F766E" size={16} />
                    </View>
                    <Text className="text-base font-semibold text-slate-800">
                      {tagObj.name}
                    </Text>
                  </View>

                  <View className="flex-row items-center">
                    <View className="bg-slate-100 px-2.5 py-1 rounded-full mr-3">
                      <Text className="text-xs font-bold text-slate-500">
                        {tagObj.count} {tagObj.count === 1 ? "log" : "logs"}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteTag(tagObj.id, tagObj.name)}
                      className="w-8 h-8 rounded-full bg-red-50 items-center justify-center"
                    >
                      <Trash2 color="#EF4444" size={16} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className="bg-white rounded-2xl p-5 border border-slate-100 items-center">
              <Text className="text-slate-400 text-sm font-medium">
                {searchQuery
                  ? "No tags match your search."
                  : "No tags available. Add one above!"}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
