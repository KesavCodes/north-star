import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Platform, StatusBar, ScrollView, Dimensions } from 'react-native';
import { useStore } from '../store/useStore';
import { ChevronLeft, TrendingUp } from 'lucide-react-native';
import { BarChart, LineChart } from 'react-native-gifted-charts';

const { width } = Dimensions.get('window');

export const AnalyticsScreen = ({ navigation }: any) => {
  const [tab, setTab] = useState<'Week' | 'Month' | 'Year'>('Week');
  
  // Dummy data for charts - in a real app, this would be computed from `logs`
  const barData = [
    { value: 2, label: 'Mon', frontColor: '#A855F7' },
    { value: 4, label: 'Tue', frontColor: '#A855F7' },
    { value: 3, label: 'Wed', frontColor: '#A855F7' },
    { value: 5, label: 'Thu', frontColor: '#A855F7' },
    { value: 2, label: 'Fri', frontColor: '#A855F7' },
    { value: 6, label: 'Sat', frontColor: '#A855F7' },
    { value: 1, label: 'Sun', frontColor: '#A855F7' },
  ];

  const lineData = [
    { value: 50, label: 'Mon' },
    { value: 65, label: 'Tue' },
    { value: 60, label: 'Wed' },
    { value: 75, label: 'Thu' },
    { value: 80, label: 'Fri' },
    { value: 85, label: 'Sat' },
    { value: 78, label: 'Sun' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FA]" style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
      {/* Header */}
      <View className="flex-row justify-between items-center px-5 mt-4 mb-6">
        <TouchableOpacity onPress={() => navigation.canGoBack() ? navigation.goBack() : null} className="p-2 -ml-2">
          {navigation.canGoBack() && <ChevronLeft color="#334155" size={24} />}
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-800">Insights</Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        
        {/* Tabs */}
        <View className="flex-row bg-white rounded-2xl p-1 mb-8 shadow-sm border border-slate-100">
          {['Week', 'Month', 'Year'].map((t) => (
            <TouchableOpacity 
              key={t}
              onPress={() => setTab(t as any)}
              className={`flex-1 py-3 items-center rounded-xl ${tab === t ? 'bg-slate-100' : 'bg-transparent'}`}
            >
              <Text className={`font-semibold ${tab === t ? 'text-slate-800' : 'text-slate-400'}`}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Productivity Time Chart */}
        <View className="bg-white rounded-3xl p-5 shadow-sm border border-slate-50 mb-8">
          <View className="flex-row justify-between items-start mb-6">
            <View>
              <Text className="text-sm font-bold text-slate-800">Productivity Time</Text>
              <Text className="text-xs text-slate-400 mt-1">This Week</Text>
            </View>
            <View className="flex-row items-center">
              <TrendingUp color="#2ECC71" size={14} />
              <Text className="text-xs font-bold text-[#2ECC71] ml-1">18% vs last week</Text>
            </View>
          </View>
          
          <Text className="text-3xl font-bold text-slate-800 mb-6">10<Text className="text-xl text-slate-500">h</Text> 45<Text className="text-xl text-slate-500">m</Text></Text>

          <View className="items-center -ml-4">
            <BarChart
              data={barData}
              barWidth={22}
              spacing={20}
              roundedTop
              roundedBottom
              xAxisThickness={0}
              yAxisThickness={0}
              yAxisTextStyle={{ color: '#94A3B8', fontSize: 10 }}
              noOfSections={4}
              maxValue={8}
              hideRules
              width={width - 120}
              initialSpacing={10}
            />
          </View>
        </View>

        {/* Habit Consistency Chart */}
        <View className="bg-white rounded-3xl p-5 shadow-sm border border-slate-50 mb-12">
          <View className="flex-row justify-between items-start mb-6">
            <View>
              <Text className="text-sm font-bold text-slate-800">Habit Consistency</Text>
              <Text className="text-xs text-slate-400 mt-1">This Week</Text>
            </View>
            <View className="flex-row items-center">
              <TrendingUp color="#2ECC71" size={14} />
              <Text className="text-xs font-bold text-[#2ECC71] ml-1">12% vs last week</Text>
            </View>
          </View>
          
          <Text className="text-3xl font-bold text-slate-800 mb-6">78<Text className="text-xl text-slate-500">%</Text></Text>

          <View className="items-center -ml-4">
            <LineChart
              data={lineData}
              thickness={4}
              color="#2ECC71"
              hideDataPoints
              xAxisThickness={0}
              yAxisThickness={0}
              yAxisTextStyle={{ color: '#94A3B8', fontSize: 10 }}
              noOfSections={4}
              maxValue={100}
              hideRules
              curved
              width={width - 120}
              initialSpacing={10}
              areaChart
              startFillColor="#2ECC71"
              startOpacity={0.2}
              endFillColor="#2ECC71"
              endOpacity={0.01}
            />
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};
