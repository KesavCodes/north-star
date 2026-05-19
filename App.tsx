import "./global.css";
import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { ToastProvider } from "./src/components/ToastProvider";
import { scheduleDailyReminders } from "./src/utils/notifications";

export default function App() {
  useEffect(() => {
    scheduleDailyReminders();
  }, []);

  return (
    <SafeAreaProvider>
      <ToastProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </ToastProvider>
    </SafeAreaProvider>
  );
}
