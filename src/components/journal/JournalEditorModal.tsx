import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { JournalEntry, JournalTemplate } from "../../types";
import { useStore } from "../../store/useStore";
import { useToast } from "../ToastProvider";
import { TemplateSelectorModal } from "./TemplateSelectorModal";
import { X, Check, LayoutTemplate } from "lucide-react-native";
import { DEFAULT_JOURNAL_TEMPLATES } from '../../constants/defaultJournalTemplates';
interface JournalEditorModalProps {
  visible: boolean;
  entry?: JournalEntry | null; // null when creating new entry
  date: string; // YYYY-MM-DD
  onClose: () => void;
}

export const JournalEditorModal: React.FC<JournalEditorModalProps> = ({
  visible,
  entry,
  date,
  onClose,
}) => {
  const { addJournalEntry, updateJournalEntry } = useStore();
  const { showToast } = useToast();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<string | undefined>(undefined);
  const [templateId, setTemplateId] = useState<string | undefined>(undefined);
  const [templateModalVisible, setTemplateModalVisible] = useState(false);

  const moods = [
    { emoji: "😄", label: "Great" },
    { emoji: "🙂", label: "Good" },
    { emoji: "😐", label: "Okay" },
    { emoji: "🙁", label: "Bad" },
    { emoji: "😭", label: "Awful" },
  ];

  const defaultContent = DEFAULT_JOURNAL_TEMPLATES.find((template: JournalTemplate) => template.id === "tpl-daily-reflection");

  useEffect(() => {
    if (visible) {
      if (entry) {
        setTitle(entry.title || "Journal Entry");
        setContent(entry.content || "");
        setMood(entry.mood);
        setTemplateId(entry.templateId);
      } else {
        setTitle(defaultContent?.name || "Daily Reflection");
        setContent(defaultContent?.content || `Daily Reflection\n\n- Day in Brief:\n\n- What Went Well:\n\n- Grateful For:\n`);
        setMood(undefined);
        setTemplateId(defaultContent?.id);
      }
    }
  }, [visible, entry]);

  const handleToggleMood = (selectedEmoji: string) => {
    if (mood === selectedEmoji) {
      setMood(undefined);
    } else {
      setMood(selectedEmoji);
    }
  };

  const handleSave = () => {
    const trimmedTitle = title.trim() || "Journal Entry";
    const trimmedContent = content.trim();

    if (!trimmedContent) {
      showToast({
        title: "Empty Content",
        body: "Please enter some text for your journal entry.",
        type: "error",
      });
      return;
    }

    if (entry) {
      updateJournalEntry(entry.id, date, {
        title: trimmedTitle,
        content: trimmedContent,
        mood,
        templateId,
      });
      showToast({
        title: "Entry Updated",
        body: "Your journal entry has been saved.",
        type: "success",
      });
    } else {
      addJournalEntry({
        date,
        title: trimmedTitle,
        content: trimmedContent,
        mood,
        templateId,
      });
      showToast({
        title: "Entry Saved",
        body: "New journal entry created.",
        type: "success",
      });
    }

    onClose();
  };

  const applyTemplate = (template: JournalTemplate) => {
    const plainContent = template.content
      .replace(/^#+\s+/gm, "")
      .replace(/\*\*/g, "");

    setTemplateId(template.id);
    setTitle(template.name);
    setContent(plainContent);
    showToast({
      title: "Template Applied",
      body: `Applied "${template.name}" structure.`,
      type: "success",
    });
  };

  const handleSelectTemplate = (template: JournalTemplate) => {
    if (content && content.trim() !== "") {
      Alert.alert(
        "Replace Journal Content?",
        "Applying a new template will overwrite your existing text. Are you sure you want to proceed?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Replace Text",
            style: "destructive",
            onPress: () => applyTemplate(template),
          },
        ],
      );
    } else {
      applyTemplate(template);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView className="flex-1 bg-[#F8F9FA]">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          {/* Simple Header */}
          <View className="flex-row items-center justify-between px-5 pt-3 pb-3 border-b border-slate-100 bg-white">
            <TouchableOpacity onPress={onClose} className="p-2 -ml-2">
              <X color="#334155" size={24} />
            </TouchableOpacity>

            <Text className="text-base font-bold text-slate-800">
              {entry ? "Edit Journal Entry" : "New Journal Entry"}
            </Text>

            <TouchableOpacity
              onPress={handleSave}
              className="bg-indigo-600 px-4 py-2 rounded-xl flex-row items-center"
            >
              <Check color="#FFFFFF" size={16} />
              <Text className="text-white font-bold text-xs ml-1">Save</Text>
            </TouchableOpacity>
          </View>

          {/* Form Controls & Basic Text Input */}
          <ScrollView
            className="flex-1 px-5 pt-4"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Title Input & Templates Button */}
            <View className="flex-row items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-xs mb-3">
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Entry Title..."
                className="text-lg font-bold text-slate-800 flex-1 mr-3"
              />
              <TouchableOpacity
                onPress={() => setTemplateModalVisible(true)}
                className="bg-slate-100 px-3 py-1.5 rounded-xl flex-row items-center"
              >
                <LayoutTemplate color="#64748B" size={14} />
                <Text className="text-xs font-semibold text-slate-600 ml-1.5">
                  Templates
                </Text>
              </TouchableOpacity>
            </View>

            {/* Mood Selector (5-Column Grid, Optional & Deselectable) */}
            <View className="bg-white p-3.5 rounded-2xl border border-slate-100 mb-3">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-xs font-semibold text-slate-400">
                  Mood Tracking (Optional)
                </Text>
                {mood && (
                  <TouchableOpacity onPress={() => setMood(undefined)}>
                    <Text className="text-xs font-semibold text-indigo-600">
                      Clear
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              <View className="flex-row items-center justify-between">
                {moods.map((m) => {
                  const isSelected = mood === m.emoji;
                  return (
                    <TouchableOpacity
                      key={m.emoji}
                      onPress={() => handleToggleMood(m.emoji)}
                      className={`flex-1 items-center py-2 px-1 rounded-xl mx-0.5 border ${isSelected
                        ? "bg-indigo-50 border-indigo-500"
                        : "bg-slate-50 border-slate-100"
                        }`}
                    >
                      <Text className="text-xl mb-0.5">{m.emoji}</Text>
                      <Text
                        className={`text-[10px] font-semibold ${isSelected ? "text-indigo-600" : "text-slate-500"
                          }`}
                      >
                        {m.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Basic Clean Text Area */}
            <View className="bg-white p-4 rounded-2xl border border-slate-100 min-h-[360px] shadow-xs mb-8">
              <TextInput
                value={content}
                onChangeText={setContent}
                multiline
                textAlignVertical="top"
                placeholder="Write your journal entry here..."
                placeholderTextColor="#CBD5E1"
                className="flex-1 text-base text-slate-800 font-normal leading-6 min-h-[340px]"
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Template Selector Modal */}
      <TemplateSelectorModal
        visible={templateModalVisible}
        onClose={() => setTemplateModalVisible(false)}
        onSelectTemplate={handleSelectTemplate}
      />
    </Modal>
  );
};
