import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useStore } from "../../store/useStore";
import { useToast } from "../ToastProvider";

interface Props {
  date: string; // YYYY-MM-DD
}

const FIELDS: {
  key: "dayInBrief" | "wentWell" | "couldImprove" | "gratefulFor";
  label: string;
  placeholder: string;
}[] = [
  {
    key: "dayInBrief",
    label: "Day in Brief",
    placeholder: "Summarise your day in a sentence or two…",
  },
  {
    key: "wentWell",
    label: "What Went Well",
    placeholder: "Wins, proud moments, good decisions…",
  },
  {
    key: "couldImprove",
    label: "Could Improve",
    placeholder: "Anything you'd do differently…",
  },
  {
    key: "gratefulFor",
    label: "Grateful For",
    placeholder: "People, moments, small things…",
  },
];

export const DayJournal = ({ date }: Props) => {
  const { journals, saveJournal } = useStore();
  const { showToast } = useToast();
  const existing = journals[date];

  const [values, setValues] = useState({
    dayInBrief: existing?.dayInBrief ?? "",
    wentWell: existing?.wentWell ?? "",
    couldImprove: existing?.couldImprove ?? "",
    gratefulFor: existing?.gratefulFor ?? "",
  });

  const handleChange = (key: keyof typeof values, text: string) =>
    setValues((prev) => ({ ...prev, [key]: text }));

  const handleSave = () => {
    saveJournal({ date, ...values });
    showToast({
      type: "success",
      title: "Journal Saved",
      body: "Your daily reflection has been saved successfully.",
    });
  };

  return (
    <ScrollView
      className="flex-1 px-5 mt-6"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {FIELDS.map(({ key, label, placeholder }) => (
        <View key={key} className="mb-5">
          <Text className="text-xs font-bold text-slate-500 tracking-wider mb-2">
            {label.toUpperCase()}
          </Text>
          <View className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-slate-50">
            <TextInput
              multiline
              placeholder={placeholder}
              placeholderTextColor="#CBD5E1"
              value={values[key]}
              onChangeText={(text) => handleChange(key, text)}
              className="text-sm text-slate-700 leading-relaxed"
              textAlignVertical="top"
              style={{ minHeight: 72 }}
            />
          </View>
        </View>
      ))}

      <TouchableOpacity
        onPress={handleSave}
        className="bg-[#2ECC71] rounded-2xl py-4 items-center justify-center mb-8 shadow-sm"
      >
        <Text className="text-white font-bold text-base">Save Reflection</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};
