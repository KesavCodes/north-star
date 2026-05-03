import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { useStore } from '../store/useStore';
import { format, parseISO } from 'date-fns';
import { ChevronLeft, CheckCircle2, Circle } from 'lucide-react-native';

export const DayDetailsScreen = ({ route, navigation }: any) => {
  const { date } = route.params || { date: format(new Date(), 'yyyy-MM-dd') };
  const { logs, getTasksForDate } = useStore();
  
  const displayDate = format(parseISO(date), 'dd MMM, yyyy');

  // Filter tasks that have logs on this date or were created before this date
  const dateTimestamp = parseISO(date).getTime();
  const activeTasks = getTasksForDate(date).filter(t => t.createdAt <= dateTimestamp + 86400000);

  const habits = activeTasks.filter(t => t.type === 'checkbox');
  const timers = activeTasks.filter(t => t.type === 'timer');
  const counters = activeTasks.filter(t => t.type === 'counter');

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FA]" style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
      {/* Header */}
      <View className="flex-row justify-between items-center px-5 mt-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
          <ChevronLeft color="#334155" size={24} />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-800">{displayDate}</Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1 px-5 mt-6" showsVerticalScrollIndicator={false}>
        
        {/* Summary Row */}
        <View className="flex-row justify-between mb-8 bg-white p-4 rounded-2xl shadow-sm border border-slate-50">
          <View className="items-center">
            <Text className="text-[10px] font-bold text-slate-400">Habits</Text>
            <Text className="text-sm font-semibold text-slate-800 mt-1">
              {habits.filter(t => logs[`${t.id}-${date}`]?.completed).length}/{habits.length}
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-[10px] font-bold text-slate-400">Timers</Text>
            <Text className="text-sm font-semibold text-slate-800 mt-1">
               {timers.filter(t => logs[`${t.id}-${date}`]?.completed).length}/{timers.length}
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-[10px] font-bold text-slate-400">Metrics</Text>
            <Text className="text-sm font-semibold text-slate-800 mt-1">
               {counters.filter(t => logs[`${t.id}-${date}`]?.completed).length}/{counters.length}
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-[10px] font-bold text-slate-400">Kindness</Text>
            <Text className="text-sm font-semibold text-purple-500 mt-1">
              {activeTasks.filter(t => t.category === 'kindness' && logs[`${t.id}-${date}`]?.completed).length}
            </Text>
          </View>
        </View>

        <Text className="text-sm font-bold text-slate-800 mb-4">Completed Tasks</Text>

        {/* Habits Section */}
        <View className="mb-6">
          <Text className="text-xs font-bold text-slate-500 tracking-wider mb-3">HABITS</Text>
          <View className="bg-white rounded-3xl p-5 shadow-sm border border-slate-50">
            {habits.map((task, index) => {
              const logId = `${task.id}-${date}`;
              const isCompleted = logs[logId]?.completed || false;
              
              return (
                <View key={task.id}>
                  <View className="flex-row items-center py-2 justify-between">
                    <View className="flex-row items-center">
                      <CheckCircle2 color={isCompleted ? "#2ECC71" : "#CBD5E1"} size={20} />
                      <Text className={`ml-3 text-sm ${isCompleted ? 'text-slate-700' : 'text-slate-400 line-through'}`}>
                        {task.name}
                      </Text>
                    </View>
                    {isCompleted && <View className="w-4 h-4 rounded-full bg-[#2ECC71]" />}
                  </View>
                </View>
              );
            })}
            {habits.length === 0 && <Text className="text-slate-400 text-xs">No habits tracked.</Text>}
          </View>
        </View>

        {/* Timers Section */}
        <View className="mb-6">
          <Text className="text-xs font-bold text-slate-500 tracking-wider mb-3">PRODUCTIVITY (TIMER)</Text>
          <View className="bg-white rounded-3xl p-5 shadow-sm border border-slate-50">
            {timers.map((task, index) => {
              const logId = `${task.id}-${date}`;
              const elapsed = logs[logId]?.value || 0;
              const target = task.target || 3600;
              const progress = Math.min((elapsed / target) * 100, 100);
              
              return (
                <View key={task.id} className="py-2 border-b border-slate-50">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm text-slate-700 font-medium">{task.name}</Text>
                    <Text className="text-xs text-slate-500">
                      {Math.floor(elapsed/60)}:{(elapsed%60).toString().padStart(2, '0')} / {Math.floor(target/60)}:00
                    </Text>
                  </View>
                  <View className="h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
                    <View className="h-full bg-[#2ECC71] rounded-full" style={{ width: `${progress}%` }} />
                  </View>
                </View>
              );
            })}
            {timers.length === 0 && <Text className="text-slate-400 text-xs">No timers tracked.</Text>}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};
