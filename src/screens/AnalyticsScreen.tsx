import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  ScrollView,
} from "react-native";
import { useStore } from "../store/useStore";
import { ChevronLeft } from "lucide-react-native";
import {
  ChartCard,
  ChartDataPoint,
  ChartType,
  FilterOption,
} from "../components/ChartCard";
import {
  format,
  subDays,
  subMonths,
  subYears,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  eachDayOfInterval,
  eachMonthOfInterval,
} from "date-fns";

// ─── helpers ───────────────────────────────────────────────────────────────

type TabType = "Week" | "Month" | "Year";

/** Returns date range [start, end] for the given tab.
 *  Week  → Sunday of the current week … Saturday of the current week
 *  Month → 1st … last day of the current month
 *  Year  → Jan 1 … Dec 31 of the current year
 */
function getRange(tab: TabType): { start: Date; end: Date } {
  const today = new Date();
  if (tab === "Week") {
    return {
      start: startOfWeek(today, { weekStartsOn: 0 }), // Sunday
      end: endOfWeek(today, { weekStartsOn: 0 }), // Saturday
    };
  } else if (tab === "Month") {
    return { start: startOfMonth(today), end: endOfMonth(today) };
  } else {
    return { start: startOfYear(today), end: endOfYear(today) };
  }
}

/** Returns the previous equivalent calendar period for trend comparison */
function getPrevRange(tab: TabType): { start: Date; end: Date } {
  const today = new Date();
  if (tab === "Week") {
    const lastWeek = subDays(today, 7);
    return {
      start: startOfWeek(lastWeek, { weekStartsOn: 0 }),
      end: endOfWeek(lastWeek, { weekStartsOn: 0 }),
    };
  } else if (tab === "Month") {
    const lastMonth = subMonths(today, 1);
    return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
  } else {
    const lastYear = subYears(today, 1);
    return { start: startOfYear(lastYear), end: endOfYear(lastYear) };
  }
}

function fmtDate(d: Date) {
  return format(d, "yyyy-MM-dd");
}

function fmtLabel(d: Date, tab: TabType) {
  if (tab === "Week") return format(d, "EEE"); // Mon, Tue…
  if (tab === "Month") return format(d, "d"); // day of month
  return format(d, "MMM"); // Jan, Feb…
}

/** Group an array of YYYY-MM-DD dates into buckets matching tab granularity */
function buildBuckets(tab: TabType): { key: string; label: string }[] {
  const { start, end } = getRange(tab);
  if (tab === "Week") {
    return eachDayOfInterval({ start, end }).map((d) => ({
      key: fmtDate(d),
      label: fmtLabel(d, tab),
    }));
  }
  if (tab === "Month") {
    // Weekly buckets labelled by start date (Sunday-start weeks)
    return eachDayOfInterval({ start, end }).map((d) => ({
      key: fmtDate(d),
      label: fmtLabel(d, tab),
    }));
  }
  // Year → monthly buckets
  return eachMonthOfInterval({ start, end }).map((d) => ({
    key: fmtDate(d),
    label: fmtLabel(d, tab),
  }));
}

/** Returns the bucket key a log date falls into for grouping */
function bucketKey(logDate: string, tab: TabType): string {
  const d = new Date(logDate + "T00:00:00");
  if (tab === "Week") return logDate;
  if (tab === "Month") {
    // Return Sunday of that week
    return fmtDate(startOfWeek(d, { weekStartsOn: 0 }));
  }
  // Year → first day of month
  return fmtDate(startOfMonth(d));
}

function trendPercent(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

// ─── screen ────────────────────────────────────────────────────────────────

export const AnalyticsScreen = ({ navigation }: any) => {
  const [tab, setTab] = useState<TabType>("Week");
  const [chartType, setChartType] = useState<ChartType>("bar");
  const { logs, tasks, getTaskById } = useStore();

  // Flat list of all tasks
  const allTasks = useMemo(() => Object.values(tasks).flat(), [tasks]);

  const timerTasks = useMemo(
    () => allTasks.filter((t) => t.type === "timer"),
    [allTasks],
  );
  const checkboxTasks = useMemo(
    () => allTasks.filter((t) => t.type === "checkbox"),
    [allTasks],
  );
  const counterTasks = useMemo(
    () => allTasks.filter((t) => t.type === "counter"),
    [allTasks],
  );

  // ── per-chart task filter state ──
  const [timerFilter, setTimerFilter] = useState<string>("all");
  const [habitFilter, setHabitFilter] = useState<string>("all");
  const [counterFilter, setCounterFilter] = useState<string>("all");

  // ── filter option builders ──
  const makeFilterOptions = (taskList: typeof allTasks): FilterOption[] => [
    { id: "all", label: "All" },
    ...taskList.map((t) => ({ id: t.id, label: t.name })),
  ];

  const timerFilterOpts = useMemo(
    () => makeFilterOptions(timerTasks),
    [timerTasks],
  );
  const habitFilterOpts = useMemo(
    () => makeFilterOptions(checkboxTasks),
    [checkboxTasks],
  );
  const counterFilterOpts = useMemo(
    () => makeFilterOptions(counterTasks),
    [counterTasks],
  );

  // ── range + buckets ──
  const { start, end } = getRange(tab);
  const { start: prevStart, end: prevEnd } = getPrevRange(tab);

  const dateSubtitle = useMemo(() => {
    if (tab === "Week") return `This Week • ${format(start, "w'st Week'")}`;
    if (tab === "Month") return `This Month • ${format(start, "MMM yyyy")}`;
    return `This Year • ${format(start, "yyyy")}`;
  }, [tab, start]);
  const buckets = buildBuckets(tab);
  // console.log(start, end, buckets);

  // Logs filtered to current range
  const logsInRange = useMemo(() => {
    const s = fmtDate(start);
    const e = fmtDate(end);
    return Object.values(logs).filter((l) => l.date >= s && l.date <= e);
  }, [logs, tab]);

  const logsInPrevRange = useMemo(() => {
    const s = fmtDate(prevStart);
    const e = fmtDate(prevEnd);
    return Object.values(logs).filter((l) => l.date >= s && l.date <= e);
  }, [logs, tab]);

  // ── CHART 1: Productive Time (timer tasks, value in seconds) ──
  const timerChartData = useMemo<ChartDataPoint[]>(() => {
    const relevantLogs = logsInRange.filter((l) => {
      const task = getTaskById(l.taskId);
      if (!task || task.type !== "timer") return false;
      if (timerFilter !== "all" && l.taskId !== timerFilter) return false;
      return true;
    });

    const bucket: Record<string, number> = {};
    relevantLogs.forEach((l) => {
      const key = bucketKey(l.date, tab);
      bucket[key] = (bucket[key] || 0) + l.value / 3600; // hours
    });

    return buckets.map((b) => ({
      value: Math.round(bucket[b.key] || 0),
      label: b.label,
      frontColor: "#A855F7",
    }));
  }, [logsInRange, timerFilter, tab, buckets]);

  const timerTotal = useMemo(
    () => timerChartData.reduce((s, d) => s + d.value, 0),
    [timerChartData],
  );
  const timerPrevTotal = useMemo(() => {
    return logsInPrevRange
      .filter((l) => {
        const task = getTaskById(l.taskId);
        if (!task || task.type !== "timer") return false;
        if (timerFilter !== "all" && l.taskId !== timerFilter) return false;
        return true;
      })
      .reduce((s, l) => s + Math.round(l.value || 0) / 3600, 0);
  }, [logsInPrevRange, timerFilter]);

  const timerTrendPct = trendPercent(timerTotal, timerPrevTotal);
  const timerMaxValue = Math.max(...timerChartData.map((d) => d.value), 2);

  function formatHoursLabel(hours: number): string {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  }

  // ── CHART 2: Habit Consistency (checkbox tasks, % completed) ──
  const habitChartData = useMemo<ChartDataPoint[]>(() => {
    const relevantLogs = logsInRange.filter((l) => {
      const task = getTaskById(l.taskId);
      if (!task || task.type !== "checkbox") return false;
      if (habitFilter !== "all" && l.taskId !== habitFilter) return false;
      return true;
    });

    // Per bucket: count completed / total
    const completedBucket: Record<string, number> = {};
    const totalBucket: Record<string, number> = {};

    // We need to count all expected logs (tasks active in range) not just ones that exist
    // Simpler: from existing logs only
    relevantLogs.forEach((l) => {
      const key = bucketKey(l.date, tab);
      totalBucket[key] = (totalBucket[key] || 0) + 1;
      if (l.completed) completedBucket[key] = (completedBucket[key] || 0) + 1;
    });

    return buckets.map((b) => {
      const total = totalBucket[b.key] || 0;
      const done = completedBucket[b.key] || 0;
      return {
        value: total > 0 ? Math.round((done / total) * 100) : 0,
        label: b.label,
        frontColor: "#2ECC71",
      };
    });
  }, [logsInRange, habitFilter, tab, buckets]);

  const habitAvg = useMemo(() => {
    const vals = habitChartData.filter((d) => d.value > 0);
    if (vals.length === 0) return 0;
    return Math.round(vals.reduce((s, d) => s + d.value, 0) / vals.length);
  }, [habitChartData]);

  const habitPrevAvg = useMemo(() => {
    const relevantLogs = logsInPrevRange.filter((l) => {
      const task = getTaskById(l.taskId);
      if (!task || task.type !== "checkbox") return false;
      if (habitFilter !== "all" && l.taskId !== habitFilter) return false;
      return true;
    });
    const total = relevantLogs.length;
    const done = relevantLogs.filter((l) => l.completed).length;
    return total > 0 ? Math.round((done / total) * 100) : 0;
  }, [logsInPrevRange, habitFilter]);

  const habitTrendPct = trendPercent(habitAvg, habitPrevAvg);

  // ── CHART 3: Metric Count (counter tasks, raw value) ──
  const counterChartData = useMemo<ChartDataPoint[]>(() => {
    const relevantLogs = logsInRange.filter((l) => {
      const task = getTaskById(l.taskId);
      if (!task || task.type !== "counter") return false;
      if (counterFilter !== "all" && l.taskId !== counterFilter) return false;
      return true;
    });

    const bucket: Record<string, number> = {};
    relevantLogs.forEach((l) => {
      const key = bucketKey(l.date, tab);
      bucket[key] = (bucket[key] || 0) + l.value;
    });

    return buckets.map((b) => ({
      value: bucket[b.key] || 0,
      label: b.label,
      frontColor: "#F59E0B",
    }));
  }, [logsInRange, counterFilter, tab, buckets]);

  const counterTotal = useMemo(
    () => counterChartData.reduce((s, d) => s + d.value, 0),
    [counterChartData],
  );
  const counterPrevTotal = useMemo(() => {
    return logsInPrevRange
      .filter((l) => {
        const task = getTaskById(l.taskId);
        if (!task || task.type !== "counter") return false;
        if (counterFilter !== "all" && l.taskId !== counterFilter) return false;
        return true;
      })
      .reduce((s, l) => s + l.value, 0);
  }, [logsInPrevRange, counterFilter]);

  const counterTrendPct = trendPercent(counterTotal, counterPrevTotal);
  const counterMaxValue = Math.max(...counterChartData.map((d) => d.value), 10);

  // ── render ──
  return (
    <SafeAreaView
      className="flex-1 bg-[#F8F9FA]"
      style={{
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
      }}
    >
      {/* Header */}
      {(() => {
        let canGoBack = false;
        try {
          canGoBack = Boolean(navigation && typeof navigation.canGoBack === "function" && navigation.canGoBack());
        } catch {
          canGoBack = false;
        }

        return (
          <View className="flex-row justify-between items-center px-5 mt-4 mb-6">
            {canGoBack ? (
              <TouchableOpacity
                onPress={() => {
                  try {
                    if (navigation?.canGoBack?.()) {
                      navigation.goBack();
                    }
                  } catch (e) {
                    console.warn("Navigation goBack failed", e);
                  }
                }}
                className="p-2 -ml-2"
              >
                <ChevronLeft color="#334155" size={24} />
              </TouchableOpacity>
            ) : (
              <View className="w-8" />
            )}
            <Text className="text-lg font-bold text-slate-800">Insights</Text>
            <View className="w-8" />
          </View>
        );
      })()}

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Chart type toggle */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: "#fff",
            borderRadius: 14,
            padding: 4,
            marginBottom: 10,
            alignSelf: "flex-end",
            borderWidth: 1,
            borderColor: "#F1F5F9",
          }}
        >
          {(["bar", "line"] as ChartType[]).map((ct) => (
            <TouchableOpacity
              key={ct}
              onPress={() => setChartType(ct)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 6,
                borderRadius: 10,
                backgroundColor: chartType === ct ? "#1E293B" : "transparent",
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: chartType === ct ? "#fff" : "#94A3B8",
                  textTransform: "capitalize",
                }}
              >
                {ct}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tabs */}
        <View className="flex-row bg-white rounded-2xl p-1 mb-6 shadow-sm border border-slate-100">
          {(["Week", "Month", "Year"] as TabType[]).map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              style={{
                flex: 1,
                paddingVertical: 10,
                alignItems: "center",
                borderRadius: 12,
                backgroundColor: tab === t ? "#F1F5F9" : "transparent",
              }}
            >
              <Text
                style={{
                  fontWeight: "600",
                  color: tab === t ? "#1E293B" : "#94A3B8",
                }}
              >
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Productive Time */}
        <ChartCard
          title="Productive Time"
          subtitle={dateSubtitle}
          summaryValue={timerTotal === 0 ? "—" : formatHoursLabel(timerTotal)}
          trend={
            timerTotal > 0 || timerPrevTotal > 0
              ? {
                  percent: timerTrendPct,
                  label: `vs last ${tab.toLowerCase()}`,
                }
              : undefined
          }
          chartType={chartType}
          data={timerChartData}
          maxValue={Math.ceil(timerMaxValue)}
          accentColor="#A855F7"
          filterOptions={
            timerFilterOpts.length > 1 ? timerFilterOpts : undefined
          }
          selectedFilter={timerFilter}
          onFilterChange={(id) => setTimerFilter(id)}
          type="timer"
        />

        {/* Habit Consistency */}
        <ChartCard
          title="Habit Consistency"
          subtitle={dateSubtitle}
          summaryValue={habitAvg === 0 ? "—" : `${habitAvg}%`}
          trend={
            habitAvg > 0 || habitPrevAvg > 0
              ? {
                  percent: habitTrendPct,
                  label: `vs last ${tab.toLowerCase()}`,
                }
              : undefined
          }
          chartType={chartType}
          data={habitChartData}
          maxValue={100}
          accentColor="#2ECC71"
          filterOptions={
            habitFilterOpts.length > 1 ? habitFilterOpts : undefined
          }
          selectedFilter={habitFilter}
          onFilterChange={(id) => setHabitFilter(id)}
          type="percentage"
        />

        {/* Metric Count */}
        <ChartCard
          title="Metric Count"
          subtitle={dateSubtitle}
          summaryValue={counterTotal === 0 ? "—" : `${counterTotal}`}
          trend={
            counterTotal > 0 || counterPrevTotal > 0
              ? {
                  percent: counterTrendPct,
                  label: `vs last ${tab.toLowerCase()}`,
                }
              : undefined
          }
          chartType={chartType}
          data={counterChartData}
          maxValue={Math.ceil(counterMaxValue)}
          accentColor="#F59E0B"
          filterOptions={
            counterFilterOpts.length > 1 ? counterFilterOpts : undefined
          }
          selectedFilter={counterFilter}
          onFilterChange={(id) => setCounterFilter(id)}
          type="counter"
        />

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
};
