import { useRef, useCallback } from "react";
import { ScrollView, FlatList } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

/**
 * Custom hook to automatically scroll a ScrollView or FlatList to top
 * whenever the screen comes into focus in React Navigation.
 */
export function useResetScrollOnFocus<T extends ScrollView | FlatList = ScrollView>() {
  const scrollRef = useRef<T>(null);

  useFocusEffect(
    useCallback(() => {
      if (scrollRef.current) {
        const ref = scrollRef.current as any;
        if (typeof ref.scrollTo === "function") {
          ref.scrollTo({ y: 0, animated: false });
        } else if (typeof ref.scrollToOffset === "function") {
          ref.scrollToOffset({ offset: 0, animated: false });
        }
      }
    }, [])
  );

  return scrollRef;
}
