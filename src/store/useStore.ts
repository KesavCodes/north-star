import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState } from "../types";
import { DEFAULT_JOURNAL_TEMPLATES } from "../constants/defaultJournalTemplates";

const generateId = () => Math.random().toString(36).substring(2, 9);
const getLogId = (taskId: string, date: string) => `${taskId}-${date}`;

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      userInfo: null,
      categories: [
        { id: "discipline", name: "Discipline", color: "#2ECC71", emoji: "💚" },
        { id: "kindness", name: "Kindness", color: "#F39C12", emoji: "❤️" }
      ],
      tasks: { routine: [] },
      logs: {},
      journals: {},
      journalTemplates: DEFAULT_JOURNAL_TEMPLATES,
      moodLogs: {},
      activeTimers: {},

      getTasksForDate: (date?: string) => {
        const routineTasks = get().tasks["routine"] || [];
        if (!date) return routineTasks;

        const dayOfWeek = new Date(`${date}T00:00:00`).getDay();
        const activeRoutineTasks = routineTasks.filter((task) => {
          if (!task.daysOfWeek || task.daysOfWeek.length === 0) return true;
          return task.daysOfWeek.includes(dayOfWeek);
        });

        const dateTasks = get().tasks[date] || [];
        return [...activeRoutineTasks, ...dateTasks];
      },

      getTaskById: (taskId: string) => {
        for (const key in get().tasks) {
          const task = get().tasks[key].find((t) => t.id === taskId);
          if (task) return task;
        }
        return undefined;
      },

      getTaskByDateAndId: (taskId: string, date?: string) => {
        if (!date) {
          const routineTask = get().tasks["routine"]?.find(
            (t) => t.id === taskId,
          );
          return routineTask;
        }
        const dateTask = get().tasks[date]?.find((t) => t.id === taskId);
        return dateTask;
      },

      setUserInfo: (info) =>
        set((state) => ({
          userInfo: info,
          firstUsedAt: state.firstUsedAt || Date.now(),
        })),

      addCategory: (categoryData) =>
        set((state) => ({
          categories: [
            ...state.categories,
            { ...categoryData, id: generateId() },
          ],
        })),

      updateCategory: (id, updates) =>
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),

      deleteCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        })),

      reorderCategories: (categories) =>
        set(() => ({
          categories,
        })),

      addTask: (taskData) =>
        set((state) => {
          const newTask = {
            ...taskData,
            id: generateId(),
            createdAt: Date.now(),
          };
          const key = taskData.isRoutine
            ? "routine"
            : taskData.date || "routine";
          const list = state.tasks[key] || [];

          if (newTask.reminderTime) {
            import("../utils/notifications").then(({ scheduleTaskReminder }) => {
              scheduleTaskReminder(newTask.id, newTask.name, newTask.reminderTime!, newTask.date);
            });
          }

          return {
            tasks: {
              ...state.tasks,
              [key]: [...list, newTask],
            },
          };
        }),

      updateTask: (taskId, updates, date) =>
        set((state) => {
          if (date && state.tasks[date]) {
            const list = state.tasks[date];
            const index = list.findIndex((t) => t.id === taskId);
            if (index !== -1) {
              const updatedList = [...list];
              updatedList[index] = { ...updatedList[index], ...updates };
              return {
                tasks: {
                  ...state.tasks,
                  [date]: updatedList,
                },
              };
            }
          }

          const newTasks = { ...state.tasks };
          for (const key in newTasks) {
            const index = newTasks[key].findIndex((t) => t.id === taskId);
            if (index !== -1) {
              newTasks[key][index] = { ...newTasks[key][index], ...updates };
              break;
            }
          }
          return { tasks: newTasks };
        }),

      deleteTask: (taskId, date) =>
        set((state) => {
          if (date && state.tasks[date]) {
            return {
              tasks: {
                ...state.tasks,
                [date]: state.tasks[date].filter((t) => t.id !== taskId),
              },
            };
          }

          const newTasks = { ...state.tasks };
          for (const key in newTasks) {
            newTasks[key] = newTasks[key].filter((t) => t.id !== taskId);
          }
          return { tasks: newTasks };
        }),

      logTaskProgress: (taskId, date, valueIncrement, completed) =>
        set((state) => {
          const logId = getLogId(taskId, date);
          const existingLog = state.logs[logId] || {
            id: logId,
            taskId,
            date,
            value: 0,
            completed: false,
          };

          const newValue = existingLog.value + valueIncrement;
          // If completed is explicitly passed, use it, otherwise keep existing
          const isCompleted =
            completed !== undefined ? completed : existingLog.completed;

          return {
            logs: {
              ...state.logs,
              [logId]: {
                ...existingLog,
                value: newValue,
                completed: isCompleted,
              },
            },
          };
        }),

      setTaskValue: (taskId, date, value, completed) =>
        set((state) => {
          const logId = getLogId(taskId, date);
          const existingLog = state.logs[logId] || {
            id: logId,
            taskId,
            date,
            value: 0,
            completed: false,
          };
          const targetTask = get().getTaskById(taskId);
          const target = targetTask?.target || 1;
          const isCompleted =
            completed !== undefined ? completed : value >= target;

          return {
            logs: {
              ...state.logs,
              [logId]: {
                ...existingLog,
                value: Math.max(value, 0),
                completed: isCompleted,
              },
            },
          };
        }),

      setTaskCompleted: (taskId, date, completed) =>
        set((state) => {
          const logId = getLogId(taskId, date);
          const existingLog = state.logs[logId] || {
            id: logId,
            taskId,
            date,
            value: 0,
            completed: false,
          };

          return {
            logs: {
              ...state.logs,
              [logId]: { ...existingLog, completed },
            },
          };
        }),

      addTimerSession: (taskId, date, session, completed) =>
        set((state) => {
          const logId = getLogId(taskId, date);
          const existingLog = state.logs[logId] || {
            id: logId,
            taskId,
            date,
            value: 0,
            completed: false,
            sessions: [],
          };

          const sessions = existingLog.sessions
            ? [...existingLog.sessions, session]
            : [session];
          const sessionDuration = Math.floor(
            (session.endTime - session.startTime) / 1000,
          ); // in seconds
          const isCompleted =
            completed !== undefined ? completed : existingLog.completed;

          return {
            logs: {
              ...state.logs,
              [logId]: {
                ...existingLog,
                sessions,
                value: existingLog.value + sessionDuration,
                completed: isCompleted,
              },
            },
          };
        }),

      startTimer: (taskId, date) =>
        set((state) => {
          const newTask = get().getTaskById(taskId);
          const taskName = newTask ? newTask.name : taskId;
          
          const newActiveTimers = {
            ...state.activeTimers,
            [taskId]: { taskId, date, startTime: Date.now() },
          };
          
          import("../utils/notifications").then(({ updateTimerNotification }) => {
             const activeKeys = Object.keys(newActiveTimers);
             const taskNames = activeKeys.map(k => get().getTaskById(k)?.name || k);
             updateTimerNotification(activeKeys.length, taskNames);
          });

          return { activeTimers: newActiveTimers };
        }),

      pauseTimer: (taskId, date) =>
        set((state) => {
          const timer = state.activeTimers[taskId];
          if (!timer) return state;

          const newActiveTimers = { ...state.activeTimers };
          delete newActiveTimers[taskId];

          import("../utils/notifications").then(({ updateTimerNotification }) => {
             const activeKeys = Object.keys(newActiveTimers);
             const taskNames = activeKeys.map(k => get().getTaskById(k)?.name || k);
             updateTimerNotification(activeKeys.length, taskNames);
          });

          // Also need to add the session to logs
          const logId = getLogId(taskId, date);
          const existingLog = state.logs[logId] || {
            id: logId,
            taskId,
            date,
            value: 0,
            completed: false,
            sessions: [],
          };
          const session = { startTime: timer.startTime, endTime: Date.now() };
          const sessions = existingLog.sessions
            ? [...existingLog.sessions, session]
            : [session];
          const sessionDuration = Math.floor(
            (session.endTime - session.startTime) / 1000,
          ); // in seconds

          const newValue = existingLog.value + sessionDuration;
          const task = get().getTaskById(taskId);
          const target = task?.target || 7200; // default 2 hours matching TimerScreen
          const isCompleted = existingLog.completed || (newValue >= target);

          return {
            activeTimers: newActiveTimers,
            logs: {
              ...state.logs,
              [logId]: {
                ...existingLog,
                sessions,
                value: newValue,
                completed: isCompleted,
              },
            },
          };
        }),

      updateTimerSessions: (taskId, date, sessions) =>
        set((state) => {
          const logId = getLogId(taskId, date);
          const existingLog = state.logs[logId] || {
            id: logId,
            taskId,
            date,
            value: 0,
            completed: false,
            sessions: [],
          };

          const newValue = sessions.reduce(
            (acc, s) => acc + Math.max(Math.floor((s.endTime - s.startTime) / 1000), 0),
            0
          );

          const task = get().getTaskById(taskId);
          const target = task?.target || 7200;

          return {
            logs: {
              ...state.logs,
              [logId]: {
                ...existingLog,
                sessions,
                value: newValue,
                completed: newValue >= target,
              },
            },
          };
        }),

      // Journal Actions
      addJournalEntry: (entryData) =>
        set((state) => {
          const now = Date.now();
          const newEntry = {
            ...entryData,
            id: generateId(),
            createdAt: now,
            updatedAt: now,
          };
          const list = state.journals[entryData.date] || [];
          return {
            journals: {
              ...state.journals,
              [entryData.date]: [newEntry, ...list],
            },
          };
        }),

      updateJournalEntry: (id, date, updates) =>
        set((state) => {
          const list = state.journals[date] || [];
          const updatedList = list.map((item) =>
            item.id === id
              ? { ...item, ...updates, updatedAt: Date.now() }
              : item,
          );
          return {
            journals: {
              ...state.journals,
              [date]: updatedList,
            },
          };
        }),

      deleteJournalEntry: (id, date) =>
        set((state) => {
          const list = state.journals[date] || [];
          return {
            journals: {
              ...state.journals,
              [date]: list.filter((item) => item.id !== id),
            },
          };
        }),

      // Journal Template Actions
      addJournalTemplate: (templateData) =>
        set((state) => ({
          journalTemplates: [
            ...state.journalTemplates,
            {
              ...templateData,
              id: generateId(),
              isDefault: false,
              createdAt: Date.now(),
            },
          ],
        })),

      updateJournalTemplate: (id, updates) =>
        set((state) => ({
          journalTemplates: state.journalTemplates.map((t) =>
            t.id === id && !t.isDefault ? { ...t, ...updates } : t,
          ),
        })),

      deleteJournalTemplate: (id) =>
        set((state) => ({
          journalTemplates: state.journalTemplates.filter(
            (t) => t.id !== id || t.isDefault,
          ),
        })),

      duplicateJournalTemplate: (id) =>
        set((state) => {
          const template = state.journalTemplates.find((t) => t.id === id);
          if (!template) return state;
          const copy = {
            ...template,
            id: generateId(),
            name: `${template.name} (Copy)`,
            isDefault: false,
            createdAt: Date.now(),
          };
          return {
            journalTemplates: [...state.journalTemplates, copy],
          };
        }),

      // Mood Actions
      addMoodLog: (logData) =>
        set((state) => {
          const now = Date.now();
          const newLog = {
            ...logData,
            id: generateId(),
            timestamp: now,
          };
          const list = state.moodLogs[logData.date] || [];
          return {
            moodLogs: {
              ...state.moodLogs,
              [logData.date]: [newLog, ...list],
            },
          };
        }),

      updateMoodLog: (id, date, updates) =>
        set((state) => {
          const list = state.moodLogs[date] || [];
          const updatedList = list.map((item) =>
            item.id === id ? { ...item, ...updates } : item,
          );
          return {
            moodLogs: {
              ...state.moodLogs,
              [date]: updatedList,
            },
          };
        }),

      deleteMoodLog: (id, date) =>
        set((state) => {
          const list = state.moodLogs[date] || [];
          return {
            moodLogs: {
              ...state.moodLogs,
              [date]: list.filter((item) => item.id !== id),
            },
          };
        }),

      importData: (dataStr: string) => {
        try {
          const data = JSON.parse(dataStr);
          if (data && data.state) {
            set(data.state);
          }
        } catch (e) {
          console.error("Failed to import data", e);
        }
      },
    }),
    {
      name: "north-star-storage-3",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
