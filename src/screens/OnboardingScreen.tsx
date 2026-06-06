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
import { File } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useToast } from "../components/ToastProvider";
import {
  Camera,
  ChevronRight,
  Target,
  Flame,
  Heart,
} from "lucide-react-native";

export const OnboardingScreen = () => {
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
        const file = new File(fileUri);
        const fileContent = await file.text();
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
      className="flex-1 bg-[#111827]"
      style={{
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-6 pt-10"
          showsVerticalScrollIndicator={false}
        >
          <Text className="text-3xl font-bold text-white text-center mb-2">
            Welcome to North Star
          </Text>
          <Text className="text-slate-400 text-center text-base mb-10">
            Your personal guide to a better you.
          </Text>

          {/* Profile Picture */}
          <View className="items-center mb-10">
            <TouchableOpacity
              onPress={pickImage}
              className="w-28 h-28 rounded-full bg-[#1E293B] items-center justify-center border-2 border-dashed border-slate-600 relative overflow-hidden"
            >
              {imageUri ? (
                <Image source={{ uri: imageUri }} className="w-full h-full" />
              ) : (
                <>
                  <Camera color="#94A3B8" size={32} />
                  <Text className="text-slate-400 text-xs mt-2">Add Photo</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Name Input */}
          <Text className="text-white font-semibold mb-3 ml-1">
            What should we call you?
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor="#64748B"
            className="bg-[#1E293B] text-white rounded-2xl p-4 text-lg border border-slate-700 mb-10"
          />

          {/* Pointers */}
          <View className="space-y-6 mb-12 gap-6">
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-2xl bg-[#1E293B] items-center justify-center mr-4">
                <Target color="#3B82F6" size={24} />
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold text-base">
                  Track Habits & Goals
                </Text>
                <Text className="text-slate-400 text-sm mt-1">
                  Build discipline with daily routines and custom timers.
                </Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-2xl bg-[#1E293B] items-center justify-center mr-4">
                <Heart color="#F39C12" size={24} />
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold text-base">
                  Practice Kindness
                </Text>
                <Text className="text-slate-400 text-sm mt-1">
                  Remember to be kind to others and yourself.
                </Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-2xl bg-[#1E293B] items-center justify-center mr-4">
                <Flame color="#EF4444" size={24} />
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold text-base">
                  Maintain Streaks
                </Text>
                <Text className="text-slate-400 text-sm mt-1">
                  Visualize your progress and stay motivated every day.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View className="px-6 pb-8 pt-4 bg-[#111827]">
          <TouchableOpacity
            onPress={handleImport}
            className="w-full py-4 rounded-2xl items-center justify-center flex-row bg-slate-800 mb-4"
          >
            <Text className="font-bold text-lg text-white">Import Existing Data</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleGetStarted}
            disabled={!name.trim()}
            className={`w-full py-4 rounded-2xl items-center justify-center flex-row ${name.trim() ? "bg-[#2ECC71]" : "bg-slate-700"}`}
          >
            <Text
              className={`font-bold text-lg mr-2 ${name.trim() ? "text-white" : "text-slate-400"}`}
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
