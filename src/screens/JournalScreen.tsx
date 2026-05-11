import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
} from "react-native";
import { useStore } from "../store/useStore";
import { format } from "date-fns";
import { ChevronLeft, Calendar } from "lucide-react-native";

export const JournalScreen = ({ navigation }: any) => {
  const { journals, saveJournal } = useStore();
  const today = format(new Date(), "yyyy-MM-dd");
  const displayDate = format(new Date(), "dd MMM, yyyy");

  const existingEntry = journals[today];

  const [dayInBrief, setDayInBrief] = useState(existingEntry?.dayInBrief || "");
  const [wentWell, setWentWell] = useState(existingEntry?.wentWell || "");
  const [couldImprove, setCouldImprove] = useState(
    existingEntry?.couldImprove || "",
  );
  const [gratefulFor, setGratefulFor] = useState(
    existingEntry?.gratefulFor || "",
  );

  // Re-sync whenever another screen (e.g. DayJournal) saves to the store
  useEffect(() => {
    setDayInBrief(existingEntry?.dayInBrief || "");
    setWentWell(existingEntry?.wentWell || "");
    setCouldImprove(existingEntry?.couldImprove || "");
    setGratefulFor(existingEntry?.gratefulFor || "");
  }, [
    existingEntry?.dayInBrief,
    existingEntry?.wentWell,
    existingEntry?.couldImprove,
    existingEntry?.gratefulFor,
  ]);

  const handleSave = () => {
    saveJournal({
      date: today,
      dayInBrief,
      wentWell,
      couldImprove,
      gratefulFor,
    });
    // If we came from a stack push, go back. Otherwise (if tab), just show a success or do nothing.
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-[#F8F9FA]"
      style={{
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row justify-between items-center px-5 mt-4">
          <TouchableOpacity
            onPress={() =>
              navigation.canGoBack() ? navigation.goBack() : null
            }
            className="p-2 -ml-2"
          >
            {navigation.canGoBack() && (
              <ChevronLeft color="#334155" size={24} />
            )}
          </TouchableOpacity>
          <View className="items-center">
            <Text className="text-lg font-bold text-slate-800">
              Daily Reflection
            </Text>
            <Text className="text-xs text-slate-500">{displayDate}</Text>
          </View>
          <TouchableOpacity className="p-2 -mr-2">
            <Calendar color="#334155" size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1 px-5 mt-6 mb-20"
          showsVerticalScrollIndicator={false}
        >
          <Text className="text-sm font-semibold text-slate-800 mb-3">
            Day in Brief
          </Text>
          <TextInput
            multiline
            value={dayInBrief}
            onChangeText={setDayInBrief}
            placeholder="A short summary of today..."
            className="bg-white rounded-2xl p-4 text-base text-slate-800 border border-slate-100 min-h-[100px]"
            textAlignVertical="top"
          />
          <Text className="text-sm font-semibold text-slate-800 mb-3">
            What went well today?
          </Text>
          <TextInput
            multiline
            value={wentWell}
            onChangeText={setWentWell}
            placeholder="I stayed focused on my work..."
            className="bg-white rounded-2xl p-4 text-base text-slate-800 border border-slate-100 min-h-[100px]"
            textAlignVertical="top"
          />
          <Text className="text-sm font-semibold text-slate-800 mb-3">
            What could improve?
          </Text>
          <TextInput
            multiline
            value={couldImprove}
            onChangeText={setCouldImprove}
            placeholder="I spent some time on social media..."
            className="bg-white rounded-2xl p-4 text-base text-slate-800 border border-slate-100 min-h-[100px]"
            textAlignVertical="top"
          />
          <Text className="text-sm font-semibold text-slate-800 mb-3">
            What are you grateful for?
          </Text>
          <TextInput
            multiline
            value={gratefulFor}
            onChangeText={setGratefulFor}
            placeholder="Grateful for my family..."
            className="bg-white rounded-2xl p-4 text-base text-slate-800 border border-slate-100 min-h-[100px]"
            textAlignVertical="top"
          />
          <TouchableOpacity
            onPress={handleSave}
            className="bg-[#2ECC71] rounded-2xl py-4 items-center justify-center mb-8 shadow-sm"
          >
            <Text className="text-white font-bold text-base">
              Save Reflection
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
