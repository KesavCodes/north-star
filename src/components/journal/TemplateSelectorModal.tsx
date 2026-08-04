import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import { JournalTemplate } from "../../types";
import { useStore } from "../../store/useStore";
import { useToast } from "../ToastProvider";
import { X, Copy, Plus, Check } from "lucide-react-native";

interface TemplateSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectTemplate: (template: JournalTemplate) => void;
}

export const TemplateSelectorModal: React.FC<TemplateSelectorModalProps> = ({
  visible,
  onClose,
  onSelectTemplate,
}) => {
  const { journalTemplates, duplicateJournalTemplate } = useStore();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<"default" | "custom">("default");

  const defaultTemplates = journalTemplates.filter((t) => t.isDefault);
  const customTemplates = journalTemplates.filter((t) => !t.isDefault);

  const handleDuplicate = (id: string, name: string) => {
    duplicateJournalTemplate(id);
    showToast({
      title: "Template Copied",
      body: `Created an editable copy of "${name}". You can now customize it!`,
      type: "success",
    });
    setActiveTab("custom");
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/60 justify-end">
        <View className="bg-white rounded-t-3xl p-6 h-[80%] flex-col">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-4">
            <View>
              <Text className="text-lg font-bold text-slate-800">
                Choose Journal Template
              </Text>
              <Text className="text-xs text-slate-400">
                Select a structure for your reflection
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-2 -mr-2">
              <X color="#94A3B8" size={22} />
            </TouchableOpacity>
          </View>

          {/* Segmented Tab Switcher */}
          <View className="flex-row bg-slate-100 rounded-2xl p-1 mb-5">
            <TouchableOpacity
              onPress={() => setActiveTab("default")}
              className={`flex-1 py-2 rounded-xl items-center ${activeTab === "default" ? "bg-white shadow-xs" : ""
                }`}
            >
              <Text
                className={`text-xs font-bold ${activeTab === "default" ? "text-slate-800" : "text-slate-500"
                  }`}
              >
                Presets ({defaultTemplates.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab("custom")}
              className={`flex-1 py-2 rounded-xl items-center ${activeTab === "custom" ? "bg-white shadow-xs" : ""
                }`}
            >
              <Text
                className={`text-xs font-bold ${activeTab === "custom" ? "text-slate-800" : "text-slate-500"
                  }`}
              >
                My Templates ({customTemplates.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Template List */}
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {activeTab === "default" ? (
              <View className="gap-3 pb-8">
                {defaultTemplates.map((template) => (
                  <View
                    key={template.id}
                    className="bg-slate-50 rounded-2xl p-4 border border-slate-100"
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center flex-1 mr-2">
                        <Text className="text-xl mr-3">{template.icon}</Text>
                        <View className="flex-1">
                          <Text className="text-base font-bold text-slate-800">
                            {template.name}
                          </Text>
                          {template.description && <Text className="text-xs text-slate-400">
                            {template.description}
                          </Text>}
                        </View>
                      </View>
                      <View className="bg-indigo-100 px-2 py-0.5 rounded-full">
                        <Text className="text-[10px] font-bold text-indigo-700">
                          Preset
                        </Text>
                      </View>
                    </View>

                    {/* Action Buttons */}
                    <View className="flex-row items-center space-x-2 gap-[2%] mt-3 pt-3 border-t border-slate-200/50">
                      <TouchableOpacity
                        onPress={() => {
                          onSelectTemplate(template);
                          onClose();
                        }}
                        className="w-[49%] bg-slate-800 py-2.5 rounded-xl flex-row items-center justify-center"
                      >
                        <Check color="#FFFFFF" size={16} />
                        <Text className="text-white font-semibold text-xs ml-1.5">
                          Use Template
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleDuplicate(template.id, template.name)}
                        className="w-[49%] bg-white border border-slate-200 px-3 py-2.5 rounded-xl flex-row items-center justify-center"
                      >
                        <Copy color="#64748B" size={14} />
                        <Text className="text-slate-600 font-semibold text-xs ml-1.5">
                          Make a Copy to Edit
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View className="gap-3 pb-8">
                {customTemplates.map((template) => (
                  <View
                    key={template.id}
                    className="bg-white rounded-2xl p-4 border border-indigo-100 shadow-sm"
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center flex-1 mr-2">
                        <Text className="text-xl mr-3">{template.icon || "✍️"}</Text>
                        <View className="flex-1">
                          <Text className="text-base font-bold text-slate-800">
                            {template.name}
                          </Text>
                          <Text className="text-xs text-slate-400">
                            {template.description || "Custom user template"}
                          </Text>
                        </View>
                      </View>
                      <View className="bg-emerald-100 px-2 py-0.5 rounded-full">
                        <Text className="text-[10px] font-bold text-emerald-700">
                          Custom
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row items-center space-x-2 gap-2 mt-3 pt-3 border-t border-slate-100">
                      <TouchableOpacity
                        onPress={() => {
                          onSelectTemplate(template);
                          onClose();
                        }}
                        className="flex-1 bg-slate-800 py-2.5 rounded-xl flex-row items-center justify-center"
                      >
                        <Check color="#FFFFFF" size={16} />
                        <Text className="text-white font-semibold text-xs ml-1.5">
                          Use Template
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}

                {customTemplates.length === 0 && (
                  <View className="items-center py-8 bg-slate-50 rounded-2xl p-4">
                    <Text className="text-slate-400 font-medium text-xs text-center mb-3">
                      You haven't created any custom templates yet. Duplicate a preset template to edit and customize it!
                    </Text>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
