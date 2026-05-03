import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Platform, StatusBar, ScrollView } from 'react-native';
import { useStore } from '../store/useStore';
import { ChevronLeft, Flame, Heart } from 'lucide-react-native';

export const StreaksScreen = ({ navigation }: any) => {
  const { tasks, logs } = useStore();
  
  const allTasks = Object.values(tasks).flat();

  // In a real app, streaks would be calculated by iterating backwards from today
  // For the sake of the UI implementation, we'll assume some derived state.
  const disciplineStreak = 12;
  const bestDisciplineStreak = 23;
  const kindnessStreak = 8;
  const bestKindnessStreak = 15;

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FA]" style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
      {/* Header */}
      <View className="flex-row justify-between items-center px-5 mt-4 mb-6">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
          <ChevronLeft color="#334155" size={24} />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-800">Streaks</Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        
        {/* Main Streaks */}
        <View className="flex-row space-x-4 mb-8">
          <View className="flex-1 bg-white rounded-3xl p-5 shadow-sm border border-slate-50 mr-2">
            <Text className="text-sm font-bold text-[#F39C12] mb-4">Discipline Streak</Text>
            <View className="flex-row items-center mb-2">
              <Flame color="#F39C12" size={28} fill="#F39C12" />
              <Text className="text-3xl font-bold text-slate-800 ml-2">12 <Text className="text-base text-slate-500 font-medium">days</Text></Text>
            </View>
            <Text className="text-xs text-slate-400">Best: {bestDisciplineStreak} days</Text>
          </View>
          
          <View className="flex-1 bg-white rounded-3xl p-5 shadow-sm border border-slate-50 ml-2">
            <Text className="text-sm font-bold text-[#E74C3C] mb-4">Kindness Streak</Text>
            <View className="flex-row items-center mb-2">
              <Heart color="#E74C3C" size={28} fill="#E74C3C" />
              <Text className="text-3xl font-bold text-slate-800 ml-2">8 <Text className="text-base text-slate-500 font-medium">days</Text></Text>
            </View>
            <Text className="text-xs text-slate-400">Best: {bestKindnessStreak} days</Text>
          </View>
        </View>

        {/* Task Streaks */}
        <Text className="text-sm font-bold text-slate-800 mb-4">Task Streaks</Text>
        <View className="bg-white rounded-3xl p-5 shadow-sm border border-slate-50 mb-12">
          
          {allTasks.map((task, index) => {
            // Dummy streak logic
            const currentStreak = Math.floor(Math.random() * 15);
            return (
              <View key={task.id}>
                <View className="flex-row justify-between items-center py-4">
                  <View className="flex-row items-center">
                    <View className="w-6 h-6 rounded-full items-center justify-center" style={{ backgroundColor: task.color || '#2ECC71' }}>
                       <Text className="text-white text-xs">✓</Text>
                    </View>
                    <Text className="text-base text-slate-700 ml-3">{task.name}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-sm text-slate-500 mr-2">{currentStreak} days</Text>
                    <Flame color={currentStreak > 5 ? "#F39C12" : "#CBD5E1"} size={16} fill={currentStreak > 5 ? "#F39C12" : "transparent"} />
                  </View>
                </View>
                {index < allTasks.length - 1 && <View className="h-[1px] bg-slate-100" />}
              </View>
            );
          })}
          
          {allTasks.length === 0 && <Text className="text-slate-400 text-center py-4">No active tasks.</Text>}

        </View>

      </ScrollView>
    </SafeAreaView>
  );
};
