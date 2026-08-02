import React, { useState, useRef, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
} from "react-native";
import Svg, { Circle, Line, Text as SvgText } from "react-native-svg";
import { Clock, X, Check, ChevronUp, ChevronDown } from "lucide-react-native";

interface ClockTimePickerProps {
  hours: string; // 24-hour format "00" to "23"
  minutes: string; // "00" to "59"
  onTimeChange: (hours: string, minutes: string) => void;
  title?: string;
}

export const ClockTimePicker: React.FC<ClockTimePickerProps> = ({
  hours,
  minutes,
  onTimeChange,
  title = "Set Reminder Time",
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  // Convert initial 24h to 12h + AM/PM
  const initH24 = parseInt(hours, 10) || 9;
  const initM = parseInt(minutes, 10) || 0;

  const [period, setPeriod] = useState<"AM" | "PM">(initH24 >= 12 ? "PM" : "AM");
  const [selectedHour, setSelectedHour] = useState<number>(
    initH24 % 12 === 0 ? 12 : initH24 % 12,
  );
  const [selectedMinute, setSelectedMinute] = useState<number>(initM);
  const [pickerMode, setPickerMode] = useState<"hours" | "minutes">("hours");

  const openPicker = () => {
    const h24 = parseInt(hours, 10) || 9;
    const m = parseInt(minutes, 10) || 0;
    setPeriod(h24 >= 12 ? "PM" : "AM");
    setSelectedHour(h24 % 12 === 0 ? 12 : h24 % 12);
    setSelectedMinute(m);
    setPickerMode("hours");
    setModalVisible(true);
  };

  const handleSave = () => {
    let finalH = selectedHour % 12;
    if (period === "PM") {
      finalH += 12;
    }
    const hStr = finalH.toString().padStart(2, "0");
    const mStr = selectedMinute.toString().padStart(2, "0");
    onTimeChange(hStr, mStr);
    setModalVisible(false);
  };

  // Clock constants
  const size = 250;
  const center = size / 2;
  const radius = 105;
  const numberRadius = 80;

  // Touch & Drag Math Helper
  const handleTouch = (evt: GestureResponderEvent) => {
    const { locationX, locationY } = evt.nativeEvent;
    const dx = locationX - center;
    const dy = locationY - center;

    // Calculate angle in degrees relative to 12 o'clock
    let angleRad = Math.atan2(dy, dx);
    let angleDeg = (angleRad * 180) / Math.PI + 90;
    if (angleDeg < 0) angleDeg += 360;

    if (pickerMode === "hours") {
      let h = Math.round(angleDeg / 30);
      if (h === 0) h = 12;
      if (h > 12) h = 12;
      setSelectedHour(h);
    } else {
      let m = Math.round(angleDeg / 6);
      if (m >= 60) m = 0;
      setSelectedMinute(m);
    }
  };

  // Create PanResponder for dragging on the clock face
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
          handleTouch(evt);
        },
        onPanResponderMove: (evt) => {
          handleTouch(evt);
        },
        onPanResponderRelease: () => {
          // If in hours mode, auto-advance to minutes after selecting hour
          if (pickerMode === "hours") {
            setPickerMode("minutes");
          }
        },
      }),
    [pickerMode],
  );

  // Stepper functions for fine adjustment
  const incrementValue = () => {
    if (pickerMode === "hours") {
      setSelectedHour((prev) => (prev % 12) + 1);
    } else {
      setSelectedMinute((prev) => (prev + 1) % 60);
    }
  };

  const decrementValue = () => {
    if (pickerMode === "hours") {
      setSelectedHour((prev) => (prev === 1 ? 12 : prev - 1));
    } else {
      setSelectedMinute((prev) => (prev === 0 ? 59 : prev - 1));
    }
  };

  // Clock Hand Position Calculations
  const currentAngle =
    pickerMode === "hours"
      ? (selectedHour % 12) * 30
      : (selectedMinute / 60) * 360;

  const handRad = (currentAngle - 90) * (Math.PI / 180);
  const handX = center + numberRadius * Math.cos(handRad);
  const handY = center + numberRadius * Math.sin(handRad);

  const displayHStr = selectedHour.toString().padStart(2, "0");
  const displayMStr = selectedMinute.toString().padStart(2, "0");

  return (
    <View>
      {/* Display Card / Trigger */}
      <TouchableOpacity
        onPress={openPicker}
        className="bg-white rounded-2xl p-4 border border-slate-100 flex-row items-center justify-between shadow-sm"
      >
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-full bg-indigo-50 items-center justify-center mr-3">
            <Clock color="#6366F1" size={20} />
          </View>
          <View>
            <Text className="text-xs text-slate-400 font-medium">{title}</Text>
            <Text className="text-lg font-bold text-slate-800 mt-0.5">
              {displayHStr}:{displayMStr} {period}
            </Text>
          </View>
        </View>
        <Text className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full">
          Change
        </Text>
      </TouchableOpacity>

      {/* Time Jot Interactive Clock Modal */}
      <Modal visible={modalVisible} animationType="fade" transparent>
        <View className="flex-1 bg-black/60 items-center justify-center px-5">
          <View className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl">
            {/* Modal Header */}
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-base font-bold text-slate-800">{title}</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="p-1"
              >
                <X color="#94A3B8" size={20} />
              </TouchableOpacity>
            </View>

            {/* Time Digital Readout & AM/PM Toggle */}
            <View className="bg-slate-900 rounded-2xl p-4 flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <TouchableOpacity onPress={() => setPickerMode("hours")}>
                  <Text
                    className={`text-3xl font-bold ${pickerMode === "hours" ? "text-[#2ECC71]" : "text-white"
                      }`}
                  >
                    {displayHStr}
                  </Text>
                </TouchableOpacity>
                <Text className="text-3xl font-bold text-slate-500 mx-1">:</Text>
                <TouchableOpacity onPress={() => setPickerMode("minutes")}>
                  <Text
                    className={`text-3xl font-bold ${pickerMode === "minutes" ? "text-[#2ECC71]" : "text-white"
                      }`}
                  >
                    {displayMStr}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Stepper & AM/PM Switcher */}
              <View className="flex-row items-center space-x-2 gap-2">
                {/* Steppers */}
                <View className="flex-col bg-slate-800 rounded-xl p-1">
                  <TouchableOpacity onPress={incrementValue} className="p-1">
                    <ChevronUp color="#94A3B8" size={16} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={decrementValue} className="p-1">
                    <ChevronDown color="#94A3B8" size={16} />
                  </TouchableOpacity>
                </View>

                {/* AM/PM Switcher */}
                <View className="bg-slate-800 p-1 rounded-xl flex-col gap-1">
                  <TouchableOpacity
                    onPress={() => setPeriod("AM")}
                    className={`px-2.5 py-1 rounded-lg ${period === "AM" ? "bg-[#2ECC71]" : "bg-transparent"
                      }`}
                  >
                    <Text
                      className={`text-xs font-bold ${period === "AM" ? "text-slate-900" : "text-slate-400"
                        }`}
                    >
                      AM
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setPeriod("PM")}
                    className={`px-2.5 py-1 rounded-lg ${period === "PM" ? "bg-[#2ECC71]" : "bg-transparent"
                      }`}
                  >
                    <Text
                      className={`text-xs font-bold ${period === "PM" ? "text-slate-900" : "text-slate-400"
                        }`}
                    >
                      PM
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Mode Switcher Tabs */}
            <View className="flex-row bg-slate-100 rounded-xl p-1 mb-4">
              <TouchableOpacity
                onPress={() => setPickerMode("hours")}
                className={`flex-1 py-1.5 rounded-lg items-center ${pickerMode === "hours" ? "bg-white shadow-xs" : ""
                  }`}
              >
                <Text
                  className={`text-xs font-bold ${pickerMode === "hours" ? "text-slate-800" : "text-slate-400"
                    }`}
                >
                  Hours
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setPickerMode("minutes")}
                className={`flex-1 py-1.5 rounded-lg items-center ${pickerMode === "minutes" ? "bg-white shadow-xs" : ""
                  }`}
              >
                <Text
                  className={`text-xs font-bold ${pickerMode === "minutes" ? "text-slate-800" : "text-slate-400"
                    }`}
                >
                  Minutes
                </Text>
              </TouchableOpacity>
            </View>

            {/* Interactive Analog Clock Face Dial */}
            <View
              className="items-center justify-center my-2"
              {...panResponder.panHandlers}
            >
              <Svg width={size} height={size}>
                {/* Outer Clock Circle */}
                <Circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="#F8FAFC"
                  stroke="#E2E8F0"
                  strokeWidth="2"
                />

                {/* Minute Ticks (60 ticks around the circumference) */}
                {Array.from({ length: 60 }).map((_, i) => {
                  const tickAngle = i * 6; // 360 / 60 = 6 deg
                  const rad = (tickAngle - 90) * (Math.PI / 180);
                  const isMajor = i % 5 === 0;
                  const innerR = isMajor ? radius - 10 : radius - 5;
                  const x1 = center + radius * Math.cos(rad);
                  const y1 = center + radius * Math.sin(rad);
                  const x2 = center + innerR * Math.cos(rad);
                  const y2 = center + innerR * Math.sin(rad);

                  return (
                    <Line
                      key={`tick-${i}`}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={isMajor ? "#94A3B8" : "#CBD5E1"}
                      strokeWidth={isMajor ? "2" : "1"}
                    />
                  );
                })}

                {/* Clock Center Pivot */}
                <Circle cx={center} cy={center} r={6} fill="#334155" />

                {/* Dynamic Clock Pointer Line */}
                <Line
                  x1={center}
                  y1={center}
                  x2={handX}
                  y2={handY}
                  stroke="#2ECC71"
                  strokeWidth="3"
                />

                {/* Dynamic Tip Circle Pointer */}
                <Circle cx={handX} cy={handY} r={18} fill="#2ECC71" />

                {/* Dial Numbers */}
                {pickerMode === "hours"
                  ? [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((val) => {
                    const angle = (val % 12) * 30;
                    const rad = (angle - 90) * (Math.PI / 180);
                    const nx = center + numberRadius * Math.cos(rad);
                    const ny = center + numberRadius * Math.sin(rad);
                    const isSelected = selectedHour === val;

                    return (
                      <React.Fragment key={`h-${val}`}>
                        {/* Large Touch Circle */}
                        <Circle
                          cx={nx}
                          cy={ny}
                          r={18}
                          fill={isSelected ? "#2ECC71" : "transparent"}
                        />
                        <SvgText
                          x={nx}
                          y={ny + 5}
                          fill={isSelected ? "#FFFFFF" : "#334155"}
                          fontSize="14"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {val}
                        </SvgText>
                      </React.Fragment>
                    );
                  })
                  : [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((val) => {
                    const angle = (val / 60) * 360;
                    const rad = (angle - 90) * (Math.PI / 180);
                    const nx = center + numberRadius * Math.cos(rad);
                    const ny = center + numberRadius * Math.sin(rad);
                    const isSelected = selectedMinute === val;
                    const valStr = val.toString().padStart(2, "0");

                    return (
                      <React.Fragment key={`m-${val}`}>
                        <Circle
                          cx={nx}
                          cy={ny}
                          r={18}
                          fill={isSelected ? "#2ECC71" : "transparent"}
                        />
                        <SvgText
                          x={nx}
                          y={ny + 5}
                          fill={isSelected ? "#FFFFFF" : "#334155"}
                          fontSize="13"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {valStr}
                        </SvgText>
                      </React.Fragment>
                    );
                  })}
              </Svg>
            </View>

            <Text className="text-slate-400 text-xs text-center mt-1">
              Drag finger around dial to set {pickerMode}
            </Text>

            {/* Save & Confirm Button */}
            <TouchableOpacity
              onPress={handleSave}
              className="bg-slate-900 rounded-2xl py-3.5 flex-row items-center justify-center mt-4 shadow-sm"
            >
              <Check color="#2ECC71" size={20} />
              <Text className="text-white font-semibold text-base ml-2">
                Set Time ({displayHStr}:{displayMStr} {period})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};
