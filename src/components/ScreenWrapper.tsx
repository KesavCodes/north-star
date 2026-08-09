import React from 'react';
import { Platform, StatusBar } from 'react-native';
import { SafeAreaView, SafeAreaViewProps, useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenWrapperProps extends SafeAreaViewProps {
  children: React.ReactNode;
  className?: string;
  hasTabBar?: boolean;
}

export const ScreenWrapper = ({
  children,
  className,
  hasTabBar = false,
  edges,
  style,
  ...rest
}: ScreenWrapperProps) => {
  const insets = useSafeAreaInsets();
  const activeEdges = edges || (hasTabBar ? ["top", "left", "right"] : ["top", "left", "right", "bottom"]);

  return (
    <SafeAreaView
      className={className}
      edges={activeEdges}
      style={[
        style,
        {
          // paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
          paddingBottom: hasTabBar ? 0 : Math.max(insets.bottom, 16),
        },
      ]}
      {...rest}
    >
      {children}
    </SafeAreaView>
  );
};
