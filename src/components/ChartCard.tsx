import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { TrendingUp, TrendingDown, Minus, HdIcon } from "lucide-react-native";
import { BarChart, LineChart } from "react-native-gifted-charts";

const { width } = Dimensions.get("window");

export type ChartType = "bar" | "line";

export interface ChartDataPoint {
  value: number;
  label: string;
  frontColor?: string; // bar chart
}

export interface FilterOption {
  id: string; // 'all' | taskId
  label: string;
}

interface TrendInfo {
  percent: number; // positive = up, negative = down, 0 = flat
  label: string; // e.g. "vs last week"
}

interface ChartCardProps {
  title: string;
  subtitle?: string;
  summaryValue: string; // e.g. "10h 45m" or "78%"
  trend?: TrendInfo;
  chartType: ChartType;
  data: ChartDataPoint[];
  maxValue?: number;
  accentColor?: string;
  /** If provided, renders a filter pill row above the chart */
  filterOptions?: FilterOption[];
  selectedFilter?: string;
  onFilterChange?: (id: string) => void;
  type: "timer" | "percentage" | "counter";
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle = "This Week",
  summaryValue,
  trend,
  chartType,
  data,
  maxValue,
  accentColor = "#A855F7",
  filterOptions,
  selectedFilter,
  onFilterChange,
  type,
}) => {
  const chartWidth = width;

  const trendColor =
    !trend || trend.percent === 0
      ? "#94A3B8"
      : trend.percent > 0
        ? "#2ECC71"
        : "#EF4444";

  const TrendIcon =
    !trend || trend.percent === 0
      ? Minus
      : trend.percent > 0
        ? TrendingUp
        : TrendingDown;

  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 24,
        padding: 20,
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
        borderWidth: 1,
        borderColor: "#F8FAFC",
        marginBottom: 20,
      }}
    >
      {/* Header row */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 16,
        }}
      >
        <View>
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#1E293B" }}>
            {title}
          </Text>
          <Text style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>
            {subtitle}
          </Text>
        </View>

        {trend && (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TrendIcon color={trendColor} size={14} />
            <Text
              style={{
                fontSize: 11,
                fontWeight: "700",
                color: trendColor,
                marginLeft: 3,
              }}
            >
              {Math.abs(trend.percent)}% {trend.label}
            </Text>
          </View>
        )}
      </View>

      {/* Summary value */}
      <Text
        style={{
          fontSize: 28,
          fontWeight: "800",
          color: "#1E293B",
          marginBottom: filterOptions ? 12 : 20,
        }}
      >
        {summaryValue}
      </Text>

      {/* Filter pills */}
      {filterOptions && filterOptions.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 16 }}
          contentContainerStyle={{ gap: 8 }}
        >
          {filterOptions.map((opt) => {
            const active = selectedFilter === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                onPress={() => onFilterChange?.(opt.id)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                  borderRadius: 20,
                  backgroundColor: active ? accentColor : "#F1F5F9",
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "600",
                    color: active ? "#fff" : "#64748B",
                  }}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Chart */}
      <View style={{ marginLeft: -16, overflow: "scroll" }}>
        {data.length === 0 ? (
          <View
            style={{
              height: 100,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#CBD5E1", fontSize: 12 }}>
              No data for this period
            </Text>
          </View>
        ) : chartType === "bar" ? (
          <BarChart
            data={data}
            roundedTop
            roundedBottom
            xAxisThickness={0}
            yAxisThickness={0}
            yAxisTextStyle={{ color: "#94A3B8", fontSize: 10 }}
            yAxisLabelSuffix={
              type === "timer" ? "h" : type === "percentage" ? "%" : ""
            }
            noOfSections={4}
            maxValue={maxValue}
            barWidth={5}
            width={width - 40}
            initialSpacing={10}
            frontColor={accentColor}
          />
        ) : (
          <LineChart
            data={data}
            thickness={3}
            color={accentColor}
            hideDataPoints
            xAxisThickness={0}
            yAxisThickness={0}
            yAxisLabelSuffix={
              type === "timer" ? "h" : type === "percentage" ? "%" : ""
            }
            yAxisTextStyle={{ color: "#94A3B8", fontSize: 10 }}
            noOfSections={4}
            maxValue={maxValue}
            curved
            width={chartWidth}
            initialSpacing={10}
            areaChart
            startFillColor={accentColor}
            startOpacity={0.18}
            endFillColor={accentColor}
            endOpacity={0.01}
          />
        )}
      </View>
    </View>
  );
};
