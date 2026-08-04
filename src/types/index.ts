export type TaskType = "checkbox" | "timer" | "counter";
export type TaskCategory = string; // categoryId

export interface Category {
  id: string;
  name: string;
  color: string;
  emoji: string;
  isArchived?: boolean;
}

export interface Task {
  id: string;
  name: string;
  type: TaskType;
  category: TaskCategory;
  isRoutine: boolean;
  daysOfWeek?: number[]; // [0,1,2,3,4,5,6] (0=Sun, 1=Mon, ..., 6=Sat)
  date?: string; // YYYY-MM-DD for one-time tasks
  target?: number; // duration in seconds for timer, value for counter
  reminderTime?: string; // HH:MM format
  icon?: string;
  color?: string;
  createdAt: number;
}

export interface TaskLog {
  id: string; // `${taskId}-${YYYY-MM-DD}`
  taskId: string;
  date: string;
  completed: boolean; // For checkbox (is it checked), Timer (did it reach target), Counter (did it reach target)
  value: number; // elapsed time for timer, count for counter
  sessions?: { startTime: number; endTime: number }[]; // For timer tracking multiple sessions
}

export interface JournalTemplate {
  id: string;
  name: string;
  icon: string;
  description?: string;
  isDefault: boolean;
  content: string;
  createdAt?: number;
}

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  content: string;
  templateId?: string;
  mood?: string;
  createdAt: number;
  updatedAt: number;
}

export interface UserInfo {
  name: string;
  profilePic?: string;
}

export interface AppState {
  userInfo: UserInfo | null;
  categories: Category[];
  tasks: Record<string, Task[]>; // keyed by date YYYY-MM-DD or 'routine'
  logs: Record<string, TaskLog>; // keyed by log ID
  journals: Record<string, JournalEntry[]>; // keyed by date YYYY-MM-DD
  journalTemplates: JournalTemplate[];

  activeTimers: Record<string, { taskId: string; date: string; startTime: number }>; // keyed by taskId

  // Getters
  getTasksForDate: (date?: string) => Task[];
  getTaskById: (taskId: string) => Task | undefined;
  getTaskByDateAndId: (taskId: string, date: string) => Task | undefined;

  // Actions
  setUserInfo: (info: UserInfo) => void;

  // Category Actions
  addCategory: (category: Omit<Category, "id">) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  reorderCategories: (categories: Category[]) => void;

  // Task Actions
  addTask: (task: Omit<Task, "id" | "createdAt">) => void;
  updateTask: (taskId: string, updates: Partial<Task>, date?: string) => void;
  deleteTask: (taskId: string, date?: string) => void;

  logTaskProgress: (
    taskId: string,
    date: string,
    valueIncrement: number,
    completed?: boolean,
  ) => void;
  setTaskCompleted: (taskId: string, date: string, completed: boolean) => void;
  addTimerSession: (
    taskId: string,
    date: string,
    session: { startTime: number; endTime: number },
    completed?: boolean,
  ) => void;
  updateTimerSessions: (
    taskId: string,
    date: string,
    sessions: { startTime: number; endTime: number }[]
  ) => void;
  startTimer: (taskId: string, date: string) => void;
  pauseTimer: (taskId: string, date: string) => void;

  // Journal Actions
  addJournalEntry: (entry: Omit<JournalEntry, "id" | "createdAt" | "updatedAt">) => void;
  updateJournalEntry: (id: string, date: string, updates: Partial<JournalEntry>) => void;
  deleteJournalEntry: (id: string, date: string) => void;

  // Journal Template Actions
  addJournalTemplate: (template: Omit<JournalTemplate, "id" | "isDefault">) => void;
  updateJournalTemplate: (id: string, updates: Partial<JournalTemplate>) => void;
  deleteJournalTemplate: (id: string) => void;
  duplicateJournalTemplate: (id: string) => void;

  // Data Management
  importData: (data: string) => void;
}
