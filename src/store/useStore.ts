import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState } from "../types";

const generateId = () => Math.random().toString(36).substring(2, 9);
const getLogId = (taskId: string, date: string) => `${taskId}-${date}`;

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      userInfo: null,
      tasks: { routine: [] },
      logs: {},
      journals: {},

      getTasksForDate: (date?: string) => {
        const routineTasks = get().tasks["routine"] || [];
        if (!date) return routineTasks;
        const dateTasks = get().tasks[date] || [];
        return [...routineTasks, ...dateTasks];
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

      setUserInfo: (info) => set({ userInfo: info }),

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
          return {
            tasks: {
              ...state.tasks,
              [key]: [...list, newTask],
            },
          };
        }),

      updateTask: (taskId, updates) =>
        set((state) => {
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

      deleteTask: (taskId) =>
        set((state) => {
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

      addTimerSession: (taskId, date, session) =>
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

          return {
            logs: {
              ...state.logs,
              [logId]: {
                ...existingLog,
                sessions,
                value: existingLog.value + sessionDuration,
              },
            },
          };
        }),

      saveJournal: (entry) =>
        set((state) => ({
          journals: {
            ...state.journals,
            [entry.date]: entry,
          },
        })),

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
      name: "north-star-storage-2",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
