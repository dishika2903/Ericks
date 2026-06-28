import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AppStackParamList, TabParamList } from "./types";
import { useTheme } from "../theme/theme";
import HomeScreen from "../screens/HomeScreen";
import DeliveryScreen from "../screens/DeliveryScreen";
import SavedPlacesScreen from "../screens/SavedPlacesScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { Text } from "react-native";

const Stack = createStackNavigator<AppStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const TabLabel = ({ focused, color, text }: { focused: boolean; color: string; text: string }) => {
  return (
    <Text style={{ color, fontSize: 12, fontWeight: focused ? '700' : '500', marginBottom: 4 }}>
      {text}
    </Text>
  );
};

const MainTabNavigator = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textLight,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          height: 60,
          paddingBottom: 8,
        },
        tabBarIconStyle: { display: 'none' }, // Simple modern clean text tabs for now
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: ({ focused, color }) => <TabLabel focused={focused} color={color} text="Ride" />,
        }}
      />
      <Tab.Screen
        name="DeliveryTab"
        component={DeliveryScreen}
        options={{
          tabBarLabel: ({ focused, color }) => <TabLabel focused={focused} color={color} text="Delivery" />,
        }}
      />
      <Tab.Screen
        name="SavedPlacesTab"
        component={SavedPlacesScreen}
        options={{
          tabBarLabel: ({ focused, color }) => <TabLabel focused={focused} color={color} text="Favorites" />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: ({ focused, color }) => <TabLabel focused={focused} color={color} text="Profile" />,
        }}
      />
    </Tab.Navigator>
  );
};

const MainNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabNavigator}
      />
      {/* Additional full-screen screens like PickupSelection, LiveRideTracking will be registered here in subsequent phases */}
    </Stack.Navigator>
  );
};

export default MainNavigator;
