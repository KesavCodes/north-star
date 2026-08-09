import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  Image,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { useStore } from "../store/useStore";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { useToast } from "../components/ToastProvider";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Camera,
  ChevronRight,
  Target,
  Flame,
  Smile,
  ShieldCheck,
} from "lucide-react-native";

export const OnboardingScreen = () => {
  const insets = useSafeAreaInsets();
  const { setUserInfo, importData } = useStore();
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleGetStarted = () => {
    if (name.trim()) {
      setUserInfo({
        name: name.trim(),
        profilePic: imageUri || undefined,
      });
      showToast({
        title: "Welcome aboard!",
        body: `Hi ${name.trim()}, your journey starts here.`,
        type: "success",
      });
    } else {
      showToast({
        title: "Name is required",
        body: "Please enter your name to proceed.",
        type: "warning",
      });
    }
  };

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync();
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const fileUri = result.assets[0].uri;
        const fileContent = await FileSystem.readAsStringAsync(fileUri);
        importData(fileContent);
        showToast({
          title: "Import Successful",
          body: "Your data has been restored successfully.",
          type: "success",
        });
      }
    } catch (e) {
      showToast({
        title: "Import Failed",
        body: "Could not read the backup file.",
        type: "error",
      });
      console.error(e);
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-[#F8F9FA]"
      style={{
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
        paddingBottom: Math.max(insets.bottom, 16),
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-6 pt-6"
          showsVerticalScrollIndicator={false}
        >
          <Text className="text-3xl font-bold text-slate-800 text-center mb-2">
            Welcome to North Star
          </Text>
          <Text className="text-slate-500 text-center text-base mb-5">
            Your personal guide to a better you.
          </Text>

          {/* Profile Picture */}
          <View className="items-center mb-5">
            <TouchableOpacity
              onPress={pickImage}
              className="w-28 h-28 rounded-full bg-white items-center justify-center border-2 border-dashed border-slate-300 relative overflow-hidden shadow-xs"
            >
              {imageUri ? (
                <Image source={{ uri: imageUri }} className="w-full h-full" />
              ) : (
                <>
                  <Camera color="#64748B" size={32} />
                  <Text className="text-slate-500 text-xs font-medium mt-1">Add Photo</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Name Input */}
          <Text className="text-slate-800 font-semibold mb-3 ml-1">
            What should we call you?
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor="#94A3B8"
            className="bg-white text-slate-800 rounded-2xl p-4 text-base border border-slate-100 mb-5 shadow-xs"
          />

          {/* Pointers */}
          <View className="space-y-4 mb-10 gap-2">
            <View className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs flex-row items-center">
              <View className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 items-center justify-center mr-4">
                <Target color="#3B82F6" size={24} />
              </View>
              <View className="flex-1">
                <Text className="text-slate-800 font-bold text-base">
                  Habits, Timers & Counters
                </Text>
                <Text className="text-slate-500 text-sm mt-0.5">
                  Track daily routines, focus timers, and numeric goals.
                </Text>
              </View>
            </View>

            <View className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs flex-row items-center">
              <View className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 items-center justify-center mr-4">
                <Smile color="#0F766E" size={24} />
              </View>
              <View className="flex-1">
                <Text className="text-slate-800 font-bold text-base">
                  Mood & Journaling
                </Text>
                <Text className="text-slate-500 text-sm mt-0.5">
                  Log your daily emotional state and write private reflections.
                </Text>
              </View>
            </View>

            <View className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs flex-row items-center">
              <View className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 items-center justify-center mr-4">
                <Flame color="#F59E0B" size={24} />
              </View>
              <View className="flex-1">
                <Text className="text-slate-800 font-bold text-base">
                  Streaks & Heatmaps
                </Text>
                <Text className="text-slate-500 text-sm mt-0.5">
                  Maintain consistency streaks and visualize monthly progress.
                </Text>
              </View>
            </View>

            <View className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs flex-row items-center">
              <View className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 items-center justify-center mr-4">
                <ShieldCheck color="#8B5CF6" size={24} />
              </View>
              <View className="flex-1">
                <Text className="text-slate-800 font-bold text-base">
                  100% Offline & Private
                </Text>
                <Text className="text-slate-500 text-sm mt-0.5">
                  Your data stays on your device with easy backup import/export.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View className="px-6 pt-4 pb-2 bg-[#F8F9FA]">
          <TouchableOpacity
            onPress={handleImport}
            className="w-full py-3.5 rounded-2xl items-center justify-center flex-row bg-white border border-slate-200 shadow-xs mb-3"
          >
            <Text className="font-bold text-base text-slate-700">Import Existing Data</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleGetStarted}
            disabled={!name.trim()}
            className={`w-full py-4 rounded-2xl items-center justify-center flex-row ${name.trim() ? "bg-slate-900 shadow-xs" : "bg-slate-200"}`}
          >
            <Text
              className={`font-bold text-base mr-2 ${name.trim() ? "text-white" : "text-slate-400"}`}
            >
              Get Started
            </Text>
            <ChevronRight color={name.trim() ? "#FFF" : "#94A3B8"} size={20} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
