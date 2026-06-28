import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import AuthNavigator from "./AuthNavigator";
import MainNavigator from "./MainNavigator";
import { useAuth } from "../context/AuthContext";
import { ActivityIndicator, View } from "react-native";

const RootNavigator = () => {
  const { isLoading, userToken, user } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: '#F8FAFC' }}>
        <ActivityIndicator size="large" color="#16A34A" />
      </View>
    );
  }

  const isAuthenticated = userToken !== null && user?.name !== undefined && user?.name !== '';

  return (
    <NavigationContainer>
      {showSplash ? (
        <AuthNavigator />
      ) : isAuthenticated ? (
        <MainNavigator />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};

export default RootNavigator;