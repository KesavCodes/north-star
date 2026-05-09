# North Star Codebase Overview

Welcome to the North Star codebase! This document provides a high-level overview of the application's architecture, features, data models, and how everything connects together. 

## 1. Features and Screens

The app is built using **React Native** and uses **React Navigation** for routing. The navigation is split into two main parts: the `RootNavigator` and the `TabNavigator`.

### The Navigation Flow

**RootNavigator (`src/navigation/RootNavigator.tsx`)**
This is the top-level container for all screens. It checks if the user has a name set (`userInfo?.name`).
- **If no name is set**: It shows the `OnboardingScreen` where the user introduces themselves.
- **If a name is set**: It grants access to the rest of the app, primarily funneling the user into the `MainTabs` (`TabNavigator`).

From the `RootNavigator`, you can also navigate to full-screen pages that shouldn't have the bottom tab bar visible:
- **`AddTaskScreen`**: A form to create a new task/habit.
- **`TimerScreen`**: A dedicated screen to run a timer for "timer" type tasks.
- **`DailyTrackerScreen`**: A view to track tasks for a specific day.
- **`CalendarHeatmapScreen`**: A visual heatmap representation of task completions over time (like GitHub contributions).
- **`DayDetailsScreen`**: A screen to see the breakdown of what happened on a specific past day.
- **`StreaksScreen`**: Displays the user's current and longest streaks for their habits.

**TabNavigator (`src/navigation/TabNavigator.tsx`)**
This represents the bottom tab bar you see on the main screens.
- **Today (`HomeScreen`)**: The main dashboard showing tasks for the current day.
- **Analytics (`AnalyticsScreen`)**: Charts and statistics about the user's progress.
- **AddTab (+ button)**: A special tab that intercepts the press and opens the `AddTaskScreen` from the `RootNavigator`.
- **Journal (`JournalScreen`)**: A daily reflection diary where users can write what went well and what they are grateful for.
- **Profile (`ProfileScreen`)**: User settings and profile management.

---

## 2. Data Storage

The app's data is managed entirely locally on the user's device. We don't use an external backend or database.

- **State Management**: We use **Zustand** (`src/store/useStore.ts`) to manage the global state of the app. It acts as our single source of truth.
- **Persistence**: We use `zustand/middleware/persist` combined with **AsyncStorage** (`@react-native-async-storage/async-storage`). This means every time the Zustand state changes, it is automatically serialized to JSON and saved to the phone's local storage (under the key `north-star-storage-2`). When the app boots up, it reloads this data into memory.

---

## 3. Data Models and Relationships

The core data models are defined in `src/types/index.ts`. 

### The Core Concept: Task vs. TaskLog

Understanding the difference between a **Task** and a **TaskLog** is the most important part of this codebase.

#### **Task** (The Blueprint)
A `Task` is the *definition* or *blueprint* of a habit or a to-do item. 
- It stores properties like `name`, `type` (checkbox, timer, counter), `category`, and `icon`.
- It can be a **routine** (happens every day, `isRoutine: true`) or a **one-time** task (assigned to a specific `date`).
- Tasks are stored in a dictionary grouped by their date or "routine": `tasks: Record<string, Task[]>`.

#### **TaskLog** (The Execution)
A `TaskLog` represents the *progress* or *completion* of a specific `Task` on a specific `date`.
- If I have a daily routine task "Read 10 pages", I only have **one** `Task` definition.
- But if I do it every day for a week, I will have **seven** `TaskLog` entries.
- The `TaskLog` tracks: `completed` (boolean), `value` (e.g., how many pages read or seconds elapsed), and `sessions` (for pausing/resuming timers).
- Logs are stored in a dictionary: `logs: Record<string, TaskLog>`.

**The Relationship:**
A `TaskLog` is linked to a `Task` via the `taskId`. Furthermore, the unique `id` of a `TaskLog` is always a combination of the task ID and the date: `${taskId}-${YYYY-MM-DD}`. This makes it very easy to look up "Did I complete Task X on Date Y?" without needing a complex database query.

### Other Data
- **JournalEntry**: Stores the daily journal text. Keyed by the date `YYYY-MM-DD`.
- **UserInfo**: Stores the user's name and profile picture.

---

## 4. The Data Lifecycle (CRUD)

Here is exactly when data is created, updated, or deleted through the Zustand store actions:

### Tasks Lifecycle
- **Create (`addTask`)**: Called from the `AddTaskScreen` when a user fills out the form. It generates a random ID and places the task into the `tasks['routine']` array (if daily) or `tasks['YYYY-MM-DD']` array (if a one-off).
- **Update (`updateTask`)**: Used when a user edits an existing task's properties (like changing its name or icon). It finds the task by ID and merges the new properties.
- **Delete (`deleteTask`)**: Called when a user decides to delete a habit. *Note: Currently, deleting a task does not automatically delete its historical `TaskLogs`.*

### TaskLogs Lifecycle
TaskLogs are generated "lazily" or "on the fly". We do not pre-create blank logs for every day. A log is only created the moment the user interacts with a task for that specific day.
- **Create/Update (`setTaskCompleted`)**: Called when a user taps a checkbox. If no log exists for today, it creates one and sets `completed: true/false`. If it exists, it updates the status.
- **Create/Update (`logTaskProgress`)**: Called when a user increments a counter (+1). It creates the log if it doesn't exist and adds to the `value`.
- **Create/Update (`addTimerSession`)**: Called when a user stops/pauses a timer. It logs the start and end time block and adds to the total elapsed time.
- **Delete**: There is no explicit action to delete a log. They are meant to be a permanent historical record of activity.

### Journal Lifecycle
- **Create/Update (`saveJournal`)**: Called from the `JournalScreen`. Because journals are keyed by the date (`YYYY-MM-DD`), saving a journal for today either creates it (if it's the first time) or simply overwrites the previous entry for that day.

---

## 5. UI & Global Components

- **Toast System**: We have a custom global toast notification system built with `react-native-reanimated` and context.
  - **`ToastProvider` (`src/components/ToastProvider.tsx`)**: Wraps the root of the app in `App.tsx` and manages the queue of active toasts. It overlays them on top of all other screens using absolute positioning.
  - **`Toast` (`src/components/Toast.tsx`)**: The individual UI element that slides and fades in. Supports types like `success`, `error`, `warning`, and `info`.
  - **Usage**: Any screen or component can call `const { showToast } = useToast();` to trigger a toast notification.
