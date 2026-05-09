import { Clock, ChevronDown } from "lucide-react-native";
import { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal } from "react-native";
const HOURS = Array.from({ length: 24 }, (_, i) =>
  i.toString().padStart(2, "0"),
);
const MINUTES = Array.from({ length: 60 }, (_, i) =>
  i.toString().padStart(2, "0"),
);

const TimePickerDropdown = ({
  hours,
  minutes,
  onHoursChange,
  onMinutesChange,
}: {
  hours: string;
  minutes: string;
  onHoursChange: (h: string) => void;
  onMinutesChange: (m: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const hoursRef = useRef<ScrollView>(null);
  const minutesRef = useRef<ScrollView>(null);

  const hoursPositions = useRef<Record<string, number>>({});
  const minutesPositions = useRef<Record<string, number>>({});

  useEffect(() => {
    if (isOpen) {
      // 150ms gives the Modal enough time to finish native layout on Android
      setTimeout(() => {
        const hY = hoursPositions.current[hours] || 0;
        hoursRef.current?.scrollTo({
          y: hY,
          animated: false,
        });

        const mY = minutesPositions.current[minutes] || 0;
        minutesRef.current?.scrollTo({
          y: mY,
          animated: false,
        });
      }, 150);
    }
  }, [isOpen, hours, minutes]);

  return (
    <View className="flex-1 w-full">
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        className="bg-white border border-slate-100 rounded-2xl p-4 flex-row justify-between items-center space-x-2 w-full"
      >
        <View className="flex-row items-center space-x-2 gap-2">
          <Clock color="#94A3B8" size={20} />
          <Text className="text-lg font-semibold text-slate-800 ml-2">
            {hours} : {minutes}
          </Text>
        </View>
        <View className="flex-row items-center gap-2 space-x-2">
          <Text className="text-slate-400 font-semibold">HH:MM</Text>
          <ChevronDown color="#94A3B8" size={20} />
        </View>
      </TouchableOpacity>

      <Modal visible={isOpen} transparent animationType="fade">
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View className="bg-white rounded-3xl w-5/6 h-[400px] overflow-hidden shadow-2xl p-6">
            <Text className="text-center font-bold text-slate-800 text-xl mb-6">
              Set Target Duration
            </Text>

            <View className="flex-row justify-between flex-1 bg-slate-50 rounded-2xl p-3 border border-slate-100 gap-1">
              {/* Hours Column */}
              <View className="w-[49%] items-center">
                <Text className="text-slate-400 font-bold mb-2 text-xs uppercase tracking-widest">
                  Hours
                </Text>
                <ScrollView
                  ref={hoursRef}
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={false}
                  className="w-full"
                >
                  {HOURS.map((item) => {
                    const isSelected = item === hours;
                    return (
                      <TouchableOpacity
                        key={item}
                        onLayout={(e) => {
                          hoursPositions.current[item] = e.nativeEvent.layout.y;
                        }}
                        onPress={() => onHoursChange(item)}
                        className="h-12 justify-center items-center rounded-xl mb-1"
                        style={{
                          backgroundColor: isSelected
                            ? "#6366f1"
                            : "transparent",
                        }}
                      >
                        <Text
                          className="text-xl"
                          style={{
                            fontWeight: isSelected ? "bold" : "500",
                            color: isSelected ? "#ffffff" : "#475569",
                          }}
                        >
                          {item}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
              {/* Minutes Column */}
              <View className="w-[49%] items-center">
                <Text className="text-slate-400 font-bold mb-2 text-xs uppercase tracking-widest">
                  Minutes
                </Text>
                <ScrollView
                  ref={minutesRef}
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={false}
                  className="w-full"
                >
                  {MINUTES.map((item) => {
                    const isSelected = item === minutes;
                    return (
                      <TouchableOpacity
                        key={item}
                        onLayout={(e) => {
                          minutesPositions.current[item] =
                            e.nativeEvent.layout.y;
                        }}
                        onPress={() => onMinutesChange(item)}
                        className="h-12 justify-center items-center rounded-xl mb-1"
                        style={{
                          backgroundColor: isSelected
                            ? "#6366f1"
                            : "transparent",
                        }}
                      >
                        <Text
                          className="text-xl"
                          style={{
                            fontWeight: isSelected ? "bold" : "500",
                            color: isSelected ? "#ffffff" : "#475569",
                          }}
                        >
                          {item}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setIsOpen(false)}
              className="mt-6 bg-indigo-500 rounded-2xl py-4 items-center shadow-sm"
            >
              <Text className="text-white font-bold text-lg">Confirm</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default TimePickerDropdown;
