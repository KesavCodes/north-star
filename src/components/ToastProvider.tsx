import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { View, StyleSheet, SafeAreaView } from "react-native";
import { Toast, ToastProps } from "./Toast";

type ToastOptions = Omit<ToastProps, "id" | "onHide">;

interface ToastContextType {
  showToast: (options: ToastOptions) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const hideToast = useCallback((id: string) => {
    setToasts((currentToasts) => currentToasts.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (options: ToastOptions) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((currentToasts) => [
        ...currentToasts,
        { ...options, id, onHide: hideToast },
      ]);
    },
    [hideToast],
  );

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <SafeAreaView style={styles.toastContainer} pointerEvents="box-none">
        <View style={styles.toastWrapper} pointerEvents="box-none">
          {toasts.map((toast) => (
            <Toast key={toast.id} {...toast} />
          ))}
        </View>
      </SafeAreaView>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

const styles = StyleSheet.create({
  toastContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  toastWrapper: {
    paddingHorizontal: 16,
    paddingTop: 8,
    flex: 1,
    justifyContent: "flex-end",
    marginBottom: 100,
  },
});
