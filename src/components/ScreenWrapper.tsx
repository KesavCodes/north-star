import React from 'react';
import { SafeAreaView, SafeAreaViewProps } from 'react-native-safe-area-context';

interface ScreenWrapperProps extends SafeAreaViewProps {
  children: React.ReactNode;
  className?: string;
}

export const ScreenWrapper = ({ children, className, ...rest }: ScreenWrapperProps) => {
  return (
    <SafeAreaView className={className} {...rest}>
      {children}
    </SafeAreaView>
  );
};
