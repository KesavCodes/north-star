import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function scheduleDailyReminders() {
  let permissionStatus = "undetermined";

  try {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    permissionStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      permissionStatus = status;
    }
  } catch (error) {
    // In Expo SDK 53+, calling this in Expo Go on Android throws an error about remote push notifications.
    // We catch it so we can still attempt to schedule local notifications.
    console.warn(
      "Notification permissions warning (expected in Expo Go):",
      error,
    );
    permissionStatus = "granted"; // Assume granted to proceed with local scheduling
  }

  if (permissionStatus !== "granted") {
    console.log("Notification permissions not granted");
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
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
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
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
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
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
    },
  });
}

const TIMER_NOTIFICATION_ID = "active-timer-notification";

export const updateTimerNotification = async (
  activeCount: number,
  taskNames: string[],
) => {
  if (activeCount === 0) {
    try {
      await Notifications.cancelScheduledNotificationAsync(
        TIMER_NOTIFICATION_ID,
      );
      await Notifications.dismissNotificationAsync(TIMER_NOTIFICATION_ID);
    } catch (e) {
      // ignore
    }
    return;
  }

  const title = `${activeCount} Timer${activeCount > 1 ? "s" : ""} Active`;
  const body = taskNames.join(", ");

  try {
    await Notifications.scheduleNotificationAsync({
      identifier: TIMER_NOTIFICATION_ID,
      content: {
        title,
        body,
        sticky: true,
        autoDismiss: false,
      },
      trigger: null,
    });
  } catch (error) {
    console.warn("Failed to schedule timer notification", error);
  }
};

export async function scheduleTaskReminder(taskId: string, taskName: string, time: string, date?: string) {
  const [hourStr, minuteStr] = time.split(":");
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  try {
    if (date) {
      // One-time task
      const [year, month, day] = date.split("-").map(Number);
      const triggerDate = new Date(year, month - 1, day, hour, minute);
      
      // Only schedule if it's in the future
      if (triggerDate.getTime() > Date.now()) {
        await Notifications.scheduleNotificationAsync({
          identifier: `task-reminder-${taskId}`,
          content: {
            title: "Task Reminder",
            body: `It's time to work on: ${taskName}`,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: triggerDate,
          },
        });
      }
    } else {
      // Routine task (Daily)
      await Notifications.scheduleNotificationAsync({
        identifier: `task-reminder-${taskId}`,
        content: {
          title: "Routine Reminder",
          body: `It's time for your routine: ${taskName}`,
        },
        trigger: {
          hour,
          minute,
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
        },
      });
    }
  } catch (error) {
    console.warn("Failed to schedule task reminder notification", error);
  }
}

export async function cancelTaskReminder(taskId: string) {
  try {
    await Notifications.cancelScheduledNotificationAsync(`task-reminder-${taskId}`);
  } catch (error) {
    console.warn("Failed to cancel task reminder notification", error);
  }
}
