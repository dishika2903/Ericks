import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { AuthStackParamList } from "./types";

import Splash from "../screens/auth/Splash";
import LanguageSelection from "../screens/auth/LanguageSelection";
import LoginScreen from "../screens/LoginScreen";
import OtpVerification from "../screens/auth/OtpVerification";
import ProfileSetup from "../screens/auth/ProfileSetup";

const Stack = createStackNavigator<AuthStackParamList>();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="Splash"
        component={Splash}
      />

      <Stack.Screen
        name="LanguageSelection"
        component={LanguageSelection}
      />

      <Stack.Screen
        name="Login"
        component={LoginScreen}
      />

      <Stack.Screen
        name="OtpVerification"
        component={OtpVerification}
      />

      <Stack.Screen
        name="ProfileSetup"
        component={ProfileSetup}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;