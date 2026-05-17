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
  date?: string; // YYYY-MM-DD for one-time tasks
  target?: number; // duration in seconds for timer, value for counter
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

export interface JournalEntry {
  date: string; // YYYY-MM-DD
  dayInBrief: string;
  wentWell: string;
  couldImprove: string;
  gratefulFor: string;
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
  journals: Record<string, JournalEntry>; // keyed by date YYYY-MM-DD

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

  // Task Actions
  addTask: (task: Omit<Task, "id" | "createdAt">) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;

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
  startTimer: (taskId: string, date: string) => void;
  pauseTimer: (taskId: string, date: string) => void;

  saveJournal: (entry: JournalEntry) => void;

  // Data Management
  importData: (data: string) => void;
}
