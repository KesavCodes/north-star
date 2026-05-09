import React, { useEffect, useRef } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import { CheckCircle, AlertTriangle, XCircle, Info, X } from "lucide-react-native";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastProps {
  id: string;
  type?: ToastType;
  title: string;
  body?: string;
  duration?: number;
  onHide: (id: string) => void;
}

const getToastStyles = (type: ToastType) => {
  switch (type) {
    case "success":
      return { bg: "bg-emerald-50", border: "border-emerald-500", text: "text-emerald-800", icon: <CheckCircle color="#10b981" size={24} /> };
    case "error":
      return { bg: "bg-red-50", border: "border-red-500", text: "text-red-800", icon: <XCircle color="#ef4444" size={24} /> };
    case "warning":
      return { bg: "bg-amber-50", border: "border-amber-500", text: "text-amber-800", icon: <AlertTriangle color="#f59e0b" size={24} /> };
    case "info":
    default:
      return { bg: "bg-blue-50", border: "border-blue-500", text: "text-blue-800", icon: <Info color="#3b82f6" size={24} /> };
  }
};

export const Toast: React.FC<ToastProps> = ({
  id,
  type = "info",
  title,
  body,
  duration = 3000,
  onHide,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    if (duration > 0) {
      const timer = setTimeout(() => {
        hideToast();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -20,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide(id);
    });
  };

  const styles = getToastStyles(type);

  return (
    <Animated.View
      style={{ opacity, transform: [{ translateY }] }}
      className={`w-full p-4 mb-2 rounded-xl border-l-4 shadow-sm flex-row items-start ${styles.bg} ${styles.border}`}
    >
      <View className="mr-3 mt-0.5">{styles.icon}</View>
      <View className="flex-1">
        <Text className={`font-bold text-base ${styles.text}`}>{title}</Text>
        {body && <Text className={`mt-1 text-sm ${styles.text} opacity-90`}>{body}</Text>}
      </View>
      <TouchableOpacity onPress={hideToast} className="ml-2 p-1">
        <X color="#94a3b8" size={20} />
      </TouchableOpacity>
    </Animated.View>
  );
};
