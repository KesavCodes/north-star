import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import {
  Edit,
  Archive,
  RotateCcw,
  Trash2,
  Repeat,
  X,
  ChevronRight,
} from "lucide-react-native";
import { Task } from "../types";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface TaskOptionsModalProps {
  visible: boolean;
  task: Task | null;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onToggleArchive?: (task: Task) => void;
  onDelete: (task: Task) => void;
  onManageRoutine?: () => void;
}

export const TaskOptionsModal: React.FC<TaskOptionsModalProps> = ({
  visible,
  task,
  onClose,
  onEdit,
  onToggleArchive,
  onDelete,
  onManageRoutine,
}) => {
  const insets = useSafeAreaInsets();
  if (!task) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/50 justify-end">
          <TouchableWithoutFeedback>
            <View
              className="bg-white w-full rounded-t-[32px] px-6 pt-3 shadow-2xl border-t border-slate-100"
              style={{ paddingBottom: Math.max(insets.bottom, 24) }}
            >
              {/* Drag Handle Indicator */}
              <View className="w-12 h-1.5 bg-slate-200 rounded-full self-center mb-4 mt-1" />

              {/* Task Header */}
              <View className="flex-row justify-between items-center pb-2 border-b border-slate-100 mb-2">
                <View className="flex-1 mr-3">
                  <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                    {task.isRoutine ? "Recurring Task Options" : "Task Options"}
                  </Text>
                  <Text
                    className="text-lg font-bold text-slate-800"
                    numberOfLines={1}
                  >
                    {task.name}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
                >
                  <X color="#64748B" size={16} />
                </TouchableOpacity>
              </View>

              {/* Bottom Sheet Actions */}
              <View className="space-y-1 gap-1">
                {/* Edit Task Option */}
                <TouchableOpacity
                  onPress={() => {
                    onClose();
                    onEdit(task);
                  }}
                  className="flex-row items-center justify-between py-2 px-3 rounded-2xl active:bg-slate-50"
                >
                  <View className="flex-row items-center flex-1">
                    <View className="w-10 h-10 rounded-2xl bg-indigo-50 items-center justify-center mr-3.5">
                      <Edit color="#6366F1" size={18} />
                    </View>
                    <Text className="text-slate-800 font-semibold text-base">
                      Edit Task
                    </Text>
                  </View>
                  <ChevronRight color="#CBD5E1" size={18} />
                </TouchableOpacity>

                {/* Manage Routine Option (if recurring) */}
                {task.isRoutine && onManageRoutine && (
                  <TouchableOpacity
                    onPress={() => {
                      onClose();
                      onManageRoutine();
                    }}
                    className="flex-row items-center justify-between py-2 px-3 rounded-2xl active:bg-slate-50"
                  >
                    <View className="flex-row items-center flex-1">
                      <View className="w-10 h-10 rounded-2xl bg-teal-50 items-center justify-center mr-3.5">
                        <Repeat color="#0F766E" size={18} />
                      </View>
                      <Text className="text-slate-800 font-semibold text-base">
                        Manage Recurring Tasks
                      </Text>
                    </View>
                    <ChevronRight color="#CBD5E1" size={18} />
                  </TouchableOpacity>
                )}

                {/* Archive / Unarchive Option */}
                {onToggleArchive && (
                  <TouchableOpacity
                    onPress={() => {
                      onClose();
                      onToggleArchive(task);
                    }}
                    className="flex-row items-center justify-between py-2 px-3 rounded-2xl active:bg-slate-50"
                  >
                    <View className="flex-row items-center flex-1">
                      <View className="w-10 h-10 rounded-2xl bg-amber-50 items-center justify-center mr-3.5">
                        {task.isArchived ? (
                          <RotateCcw color="#D97706" size={18} />
                        ) : (
                          <Archive color="#D97706" size={18} />
                        )}
                      </View>
                      <Text className="text-slate-800 font-semibold text-base flex-1">
                        {task.isArchived ? "Unarchive Task" : "Archive Task"}
                      </Text>
                    </View>
                    <ChevronRight color="#CBD5E1" size={18} />
                  </TouchableOpacity>
                )}

                {/* Delete Task Option */}
                <TouchableOpacity
                  onPress={() => {
                    onClose();
                    onDelete(task);
                  }}
                  className="flex-row items-center justify-between py-2 px-3 rounded-2xl active:bg-red-50"
                >
                  <View className="flex-row items-center flex-1">
                    <View className="w-10 h-10 rounded-2xl bg-red-50 items-center justify-center mr-3.5">
                      <Trash2 color="#EF4444" size={18} />
                    </View>
                    <Text className="text-red-600 font-semibold text-base">
                      Delete Task
                    </Text>
                  </View>
                  <ChevronRight color="#FCA5A5" size={18} />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
