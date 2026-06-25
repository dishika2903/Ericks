import { io, Socket } from 'socket.io-client';
import { API_URL } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

let socket: Socket | null = null;

export const getSocket = (): Socket | null => socket;

export const connectSocket = async (): Promise<Socket> => {
  if (socket?.connected) return socket;

  const token = await AsyncStorage.getItem('user_token');
  
  socket = io(API_URL, {
    auth: { token },
    query: { token },
    transports: ['websocket'],
    autoConnect: false,
  });

  socket.connect();

  socket.on('connect', () => {
    console.log(`[Socket] Connected successfully: ${socket?.id}`);
  });

  socket.on('disconnect', (reason) => {
    console.log(`[Socket] Disconnected: ${reason}`);
  });

  socket.on('connect_error', (error) => {
    console.error('[Socket] Connection error:', error.message);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
