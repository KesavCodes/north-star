import React from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, BarChart2, PlusCircle, Book, User } from 'lucide-react-native';
import { HomeScreen } from '../screens/HomeScreen';
import { JournalScreen } from '../screens/JournalScreen';
import { AnalyticsScreen } from '../screens/AnalyticsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

// Empty component for the "Add Task" tab which will be intercepted
const AddTaskPlaceholder = () => null;

export const TabNavigator = ({ navigation }: any) => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#2ECC71',
        tabBarInactiveTintColor: '#95A5A6',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 10,
          height: 70,
          paddingBottom: 15,
        },
      }}
    >
      <Tab.Screen 
        name="Today" 
        component={HomeScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tab.Screen 
        name="Analytics" 
        component={AnalyticsScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <BarChart2 color={color} size={size} />,
        }}
      />
      <Tab.Screen 
        name="AddTab" 
        component={AddTaskPlaceholder} 
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ color }) => (
            <View className="bg-[#2ECC71] w-14 h-14 rounded-full items-center justify-center shadow-lg -mt-4">
              <PlusCircle color="#FFF" size={32} />
            </View>
          ),
        }}
        listeners={() => ({
          tabPress: (e) => {
            e.preventDefault();
            // Navigate to AddTask screen in the RootStack
            navigation.navigate('AddTaskScreen');
          },
        })}
      />
      <Tab.Screen 
        name="Journal" 
        component={JournalScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Book color={color} size={size} />,
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
};
