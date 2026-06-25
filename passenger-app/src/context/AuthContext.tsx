import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';

interface UserType {
  _id: string;
  phone: string;
  role: string;
  name?: string;
  email?: string;
  language: string;
}

interface AuthContextType {
  isLoading: boolean;
  userToken: string | null;
  user: UserType | null;
  login: (phone: string, otp: string, role: string) => Promise<boolean>;
  registerProfile: (name: string, email: string, language: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserContext: (updatedUser: UserType) => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  userToken: null,
  user: null,
  login: async () => false,
  registerProfile: async () => {},
  logout: async () => {},
  updateUserContext: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserType | null>(null);

  // Initialize and load persisted credentials
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem('user_token');
        const userJSON = await AsyncStorage.getItem('user_profile');
        
        if (token && userJSON) {
          setUserToken(token);
          setUser(JSON.parse(userJSON));
          // Connect WebSocket as soon as token is recovered
          await connectSocket();
        }
      } catch (e) {
        console.error('Failed to load authenticated state:', e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  const login = async (phone: string, otp: string, role: string): Promise<boolean> => {
    try {
      const response = await apiClient.post('/api/auth/verify-otp', { phone, otp, role });
      const { token, user: profile, isNewUser } = response.data;

      await AsyncStorage.setItem('user_token', token);
      await AsyncStorage.setItem('user_profile', JSON.stringify(profile));

      setUserToken(token);
      setUser(profile);
      await connectSocket();

      return isNewUser; // Returns true if profile name setup is required
    } catch (error) {
      console.error('Login request failed:', error);
      throw error;
    }
  };

  const registerProfile = async (name: string, email: string, language: string) => {
    try {
      const response = await apiClient.post('/api/auth/register', { name, email, language });
      const { user: updatedProfile } = response.data;
      
      await AsyncStorage.setItem('user_profile', JSON.stringify(updatedProfile));
      setUser(updatedProfile);
    } catch (error) {
      console.error('Profile registration request failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user_token');
      await AsyncStorage.removeItem('user_profile');
      disconnectSocket();
      setUserToken(null);
      setUser(null);
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const updateUserContext = (updatedUser: UserType) => {
    setUser(updatedUser);
    AsyncStorage.setItem('user_profile', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        userToken,
        user,
        login,
        registerProfile,
        logout,
        updateUserContext,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
