import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  ScrollView,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { useStore } from "../store/useStore";
import {
  ChevronRight,
  Folder,
  Bell,
  HardDriveDownload,
  Info,
  Edit,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "react-native";
import * as ImagePicker from "expo-image-picker";

export const ProfileScreen = ({ navigation }: any) => {
  const { userInfo, setUserInfo } = useStore();
  const [isNameModalVisible, setIsNameModalVisible] = useState(false);
  const [newName, setNewName] = useState("");

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      // allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && userInfo) {
      setUserInfo({ ...userInfo, profilePic: result.assets[0].uri });
    }
  };
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
      className="flex-1 bg-[#F8F9FA]"
      style={{
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
      }}
    >
      {/* Header */}
      <View className="flex-row justify-center items-center px-5 mt-4 mb-8">
        <Text className="text-lg font-bold text-slate-800">Profile</Text>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View className="flex-row items-center mb-10">
          <View className="relative mr-4">
            <TouchableOpacity
              className="w-16 h-16 rounded-full bg-[#2ECC71] items-center justify-center border border-black-200 overflow-hidden"
              onPress={pickImage}
            >
              {userInfo?.profilePic ? (
                <Image
                  source={{ uri: userInfo.profilePic }}
                  className="w-full h-full"
                />
              ) : (
                <Text className="text-white text-2xl font-bold">
                  {userInfo?.name?.charAt(0).toUpperCase() || "😎"}
                </Text>
              )}
            </TouchableOpacity>
            <View className="absolute top-1 right-1">
              <Edit color="black" size={12} fill="white" />
            </View>
          </View>
          <View>
            <TouchableOpacity 
              onPress={() => {
                setNewName(userInfo?.name || "");
                setIsNameModalVisible(true);
              }}
              className="flex-row items-center justify-start gap-2"
            >
              <Text className="text-2xl font-bold text-slate-800">
                {userInfo?.name || "User"}
              </Text>
              <Edit color="black" size={15} fill="white" />
            </TouchableOpacity>
            <Text className="text-slate-500 text-sm mt-1">
              Building a better version{"\n"}of myself every day.
            </Text>
          </View>
        </View>

        {/* Settings List */}
        <View className="bg-white rounded-3xl p-2 mb-12 shadow-sm border border-slate-50">
          {/* <TouchableOpacity className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center">
              <ListTodo color="#64748b" size={20} />
              <Text className="text-slate-800 ml-4 text-base">My Tasks</Text>
            </View>
            <ChevronRight color="#CBD5E1" size={20} />
          </TouchableOpacity>
          <View className="h-[1px] bg-slate-100 ml-12" /> */}

          <TouchableOpacity
            onPress={() => navigation.navigate("ManageCategoriesScreen")}
            className="flex-row items-center justify-between p-4"
          >
            <View className="flex-row items-center">
              <Folder color="#64748b" size={20} />
              <Text className="text-slate-800 ml-4 text-base">Categories</Text>
            </View>
            <ChevronRight color="#CBD5E1" size={20} />
          </TouchableOpacity>
          <View className="h-[1px] bg-slate-100 ml-12" />

          <TouchableOpacity
            onPress={() => navigation.navigate("RemindersScreen")}
            className="flex-row items-center justify-between p-4"
          >
            <View className="flex-row items-center">
              <Bell color="#64748b" size={20} />
              <Text className="text-slate-800 ml-4 text-base">Reminders</Text>
            </View>
            <ChevronRight color="#CBD5E1" size={20} />
          </TouchableOpacity>
          <View className="h-[1px] bg-slate-100 ml-12" />

          {/* <TouchableOpacity className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center">
              <Moon color="#64748b" size={20} />
              <Text className="text-slate-800 ml-4 text-base">Theme</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-slate-400 mr-2">Dark</Text>
              <ChevronRight color="#CBD5E1" size={20} />
            </View>
          </TouchableOpacity>
          <View className="h-[1px] bg-slate-100 ml-12" /> */}

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
              <HardDriveDownload color="#64748b" size={20} />
              <Text className="text-slate-800 ml-4 text-base">
                Backup & Restore
              </Text>
            </View>
            <ChevronRight color="#CBD5E1" size={20} />
          </TouchableOpacity>
          <View className="h-[1px] bg-slate-100 ml-12" />

          <TouchableOpacity
            onPress={() => navigation.navigate("AboutScreen")}
            className="flex-row items-center justify-between p-4"
          >
            <View className="flex-row items-center">
              <Info color="#64748b" size={20} />
              <Text className="text-slate-800 ml-4 text-base">About</Text>
            </View>
            <ChevronRight color="#CBD5E1" size={20} />
          </TouchableOpacity>
          <View className="h-[1px] bg-slate-100 ml-12" />

          {/* <TouchableOpacity className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center">
              <LogOut color="#EF4444" size={20} />
              <Text className="text-[#EF4444] ml-4 text-base">Logout</Text>
            </View>
          </TouchableOpacity> */}
        </View>
      </ScrollView>

      {/* Name Update Modal */}
      <Modal visible={isNameModalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center px-5">
          <View className="bg-white w-full rounded-3xl p-6 shadow-xl">
            <Text className="text-lg font-bold text-slate-800 mb-4">
              Update Name
            </Text>
            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder="Enter your name"
              className="bg-slate-50 rounded-2xl p-4 text-base text-slate-800 border border-slate-200 mb-6"
              autoFocus
            />
            <View className="flex-row justify-end space-x-3 gap-3">
              <TouchableOpacity
                onPress={() => setIsNameModalVisible(false)}
                className="px-6 py-3 rounded-xl bg-slate-100"
              >
                <Text className="font-semibold text-slate-600">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (newName.trim()) {
                    setUserInfo({ ...(userInfo || {}), name: newName.trim() });
                    setIsNameModalVisible(false);
                  }
                }}
                className={`px-6 py-3 rounded-xl ${newName.trim() ? "bg-[#2ECC71]" : "bg-slate-300"}`}
                disabled={!newName.trim()}
              >
                <Text className="font-semibold text-white">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
