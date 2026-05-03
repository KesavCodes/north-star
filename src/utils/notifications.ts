import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function scheduleDailyReminders() {
  let permissionStatus = 'undetermined';

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    permissionStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      permissionStatus = status;
    }
  } catch (error) {
    // In Expo SDK 53+, calling this in Expo Go on Android throws an error about remote push notifications.
    // We catch it so we can still attempt to schedule local notifications.
    console.warn("Notification permissions warning (expected in Expo Go):", error);
    permissionStatus = 'granted'; // Assume granted to proceed with local scheduling
  }

  if (permissionStatus !== 'granted') {
    console.log('Notification permissions not granted');
    return;
  }

  // Cancel all previously scheduled notifications first
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Morning reminder: Enter goals for the day
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Good Morning! ☀️",
      body: "Time to set your goals and habits for today.",
    },
    trigger: {
      hour: 8,
      minute: 0,
      repeats: true,
      type: Notifications.SchedulableTriggerInputTypes.DAILY
    },
  });

  // Evening update: 6:00 PM
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Evening Check-in",
      body: "How are you progressing with your tasks today?",
    },
    trigger: {
      hour: 18,
      minute: 0,
      repeats: true,
      type: Notifications.SchedulableTriggerInputTypes.DAILY
    },
  });

  // Night reflection: 9:00 PM
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Daily Reflection 🌙",
      body: "Take a moment to reflect on your day and log your journal.",
    },
    trigger: {
      hour: 21,
      minute: 0,
      repeats: true,
      type: Notifications.SchedulableTriggerInputTypes.DAILY
    },
  });
}
