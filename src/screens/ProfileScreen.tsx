import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  ScrollView,
  Alert,
} from "react-native";
import { useStore } from "../store/useStore";
import {
  Settings,
  ChevronRight,
  ListTodo,
  Folder,
  Bell,
  Moon,
  HardDriveDownload,
  Info,
  LogOut,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from 'react-native';

export const ProfileScreen = ({ navigation }: any) => {
  const { importData, userInfo } = useStore();

  const handleExport = async () => {
    try {
      const data = await AsyncStorage.getItem("north-star-storage");
      // In a real app, you would use expo-sharing to let user save this file
      Alert.alert("Export Successful", "Data exported to local storage.");
      console.log(data); // for testing
    } catch (e) {
      Alert.alert("Export Failed", "Could not export data.");
    }
  };

  const handleImport = () => {
    // In a real app, use expo-document-picker to select file
    Alert.alert(
      "Import Data",
      "This will overwrite current data. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Import",
          style: "destructive",
          onPress: () => {
            // mock import
            // importData(mockJsonString);
            Alert.alert("Import Successful", "Data restored.");
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView
      className="flex-1 bg-[#111827]"
      style={{
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
      }}
    >
      {/* Header */}
      <View className="flex-row justify-between items-center px-5 mt-4 mb-8">
        <View className="w-8" />
        <Text className="text-lg font-bold text-white">Profile</Text>
        <TouchableOpacity className="p-2 -mr-2">
          <Settings color="#FFF" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View className="flex-row items-center mb-10">
          <View className="w-16 h-16 rounded-full bg-[#2ECC71] items-center justify-center mr-4 overflow-hidden border border-slate-700">
            {userInfo?.profilePic ? (
               <Image source={{ uri: userInfo.profilePic }} className="w-full h-full" />
            ) : (
               <Text className="text-white text-2xl font-bold">{userInfo?.name?.charAt(0).toUpperCase() || 'U'}</Text>
            )}
          </View>
          <View>
            <Text className="text-2xl font-bold text-white">{userInfo?.name || 'User'}</Text>
            <Text className="text-slate-400 text-sm mt-1">
              Building a better version{"\n"}of myself every day.
            </Text>
          </View>
        </View>

        {/* Settings List */}
        <View className="bg-[#1E293B] rounded-3xl p-2 mb-12">
          <TouchableOpacity className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center">
              <ListTodo color="#94A3B8" size={20} />
              <Text className="text-white ml-4 text-base">My Tasks</Text>
            </View>
            <ChevronRight color="#475569" size={20} />
          </TouchableOpacity>
          <View className="h-[1px] bg-slate-800 ml-12" />

          <TouchableOpacity 
            onPress={() => navigation.navigate("ManageCategoriesScreen")}
            className="flex-row items-center justify-between p-4"
          >
            <View className="flex-row items-center">
              <Folder color="#94A3B8" size={20} />
              <Text className="text-white ml-4 text-base">Categories</Text>
            </View>
            <ChevronRight color="#475569" size={20} />
          </TouchableOpacity>
          <View className="h-[1px] bg-slate-800 ml-12" />

          <TouchableOpacity className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center">
              <Bell color="#94A3B8" size={20} />
              <Text className="text-white ml-4 text-base">Reminders</Text>
            </View>
            <ChevronRight color="#475569" size={20} />
          </TouchableOpacity>
          <View className="h-[1px] bg-slate-800 ml-12" />

          <TouchableOpacity className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center">
              <Moon color="#94A3B8" size={20} />
              <Text className="text-white ml-4 text-base">Theme</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-slate-400 mr-2">Dark</Text>
              <ChevronRight color="#475569" size={20} />
            </View>
          </TouchableOpacity>
          <View className="h-[1px] bg-slate-800 ml-12" />

          <TouchableOpacity
            onPress={() => {
              Alert.alert("Backup & Restore", "Choose an action", [
                { text: "Export", onPress: handleExport },
                { text: "Import", onPress: handleImport },
                { text: "Cancel", style: "cancel" },
              ]);
            }}
            className="flex-row items-center justify-between p-4"
          >
            <View className="flex-row items-center">
              <HardDriveDownload color="#94A3B8" size={20} />
              <Text className="text-white ml-4 text-base">
                Backup & Restore
              </Text>
            </View>
            <ChevronRight color="#475569" size={20} />
          </TouchableOpacity>
          <View className="h-[1px] bg-slate-800 ml-12" />

          <TouchableOpacity className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center">
              <Info color="#94A3B8" size={20} />
              <Text className="text-white ml-4 text-base">About</Text>
            </View>
            <ChevronRight color="#475569" size={20} />
          </TouchableOpacity>
          <View className="h-[1px] bg-slate-800 ml-12" />

          <TouchableOpacity className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center">
              <LogOut color="#EF4444" size={20} />
              <Text className="text-[#EF4444] ml-4 text-base">Logout</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
