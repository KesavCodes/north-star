import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { TabNavigator } from "./TabNavigator";
import { DailyTrackerScreen } from "../screens/DailyTrackerScreen";
import { AddTaskScreen } from "../screens/AddTaskScreen";
import { TimerScreen } from "../screens/TimerScreen";
import { CalendarHeatmapScreen } from "../screens/CalendarHeatmapScreen";
import { DayDetailsScreen } from "../screens/DayDetailsScreen";
import { StreaksScreen } from "../screens/StreaksScreen";
import { OnboardingScreen } from "../screens/OnboardingScreen";
import { NotificationsScreen } from "../screens/NotificationsScreen";
import { AddCategoryScreen } from "../screens/AddCategoryScreen";
import { ManageCategoriesScreen } from "../screens/ManageCategoriesScreen";
import { RemindersScreen } from "../screens/RemindersScreen";
import { useStore } from "../store/useStore";

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  const { userInfo } = useStore();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!userInfo?.name ? (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={TabNavigator} />
          <Stack.Screen name="AddTaskScreen" component={AddTaskScreen} />
          <Stack.Screen
            name="AddCategoryScreen"
            component={AddCategoryScreen}
          />
          <Stack.Screen
            name="ManageCategoriesScreen"
            component={ManageCategoriesScreen}
          />
          <Stack.Screen name="TimerScreen" component={TimerScreen} />
          <Stack.Screen name="DailyTracker" component={DailyTrackerScreen} />
          <Stack.Screen
            name="CalendarHeatmap"
            component={CalendarHeatmapScreen}
          />
          <Stack.Screen name="DayDetails" component={DayDetailsScreen} />
          <Stack.Screen name="Streaks" component={StreaksScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="RemindersScreen" component={RemindersScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};
