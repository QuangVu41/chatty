import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import { io, type Socket } from 'socket.io-client';
import { SOCKET_URL } from '../constants';

export interface AuthUser {
  _id: string;
  email: string;
  fullName: string;
  profilePic?: string;
  createdAt?: string;
}

export interface SignupFormData {
  fullName: string;
  email: string;
  password: string;
}

export type LoginFormData = Omit<SignupFormData, 'fullName'>;

interface AuthStore {
  authUser: AuthUser | null;
  socket: null | Socket;
  onlineUsers: string[];
  isSigningUp: boolean;
  isLoggingIn: boolean;
  isUpdatingProfile: boolean;
  isCheckingAuth: boolean;
  checkAuth: () => Promise<void>;
  signup: (data: SignupFormData) => Promise<void>;
  logout: () => Promise<void>;
  login: (data: LoginFormData) => Promise<void>;
  updateProfile: (profilePic: File) => Promise<void>;
  connectSocket: () => void;
  disconnectSocket: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  authUser: null,
  socket: null,
  onlineUsers: [],
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: false,
  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const res = await axiosInstance.get<AuthUser>('/auth/check-auth');
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log('Error checking auth', error);
      set({ authUser: null });
    }
    set({ isCheckingAuth: false });
  },
  signup: async (data: SignupFormData) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post<AuthUser>('/auth/signup', data);
      set({ authUser: res.data });
      toast.success('Account created successfully!');
    } catch (error) {
      if (error instanceof AxiosError) toast.error(error.response?.data?.message);
    }
    set({ isSigningUp: false });
  },
  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout');
      set({ authUser: null });
      toast.success('Logged out successfully!');
      get().disconnectSocket();
    } catch (error) {
      if (error instanceof AxiosError) toast.error(error.response?.data?.message);
    }
  },
  login: async (data: LoginFormData) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post<AuthUser>('/auth/login', data);
      set({ authUser: res.data });
      toast.success('Logged in successfully!');
      get().connectSocket();
    } catch (error) {
      if (error instanceof AxiosError) toast.error(error.response?.data?.message);
    }
    set({ isLoggingIn: false });
  },
  updateProfile: async (profilePic: File) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.patch<AuthUser>(
        '/users/update-profile',
        {
          profilePic,
        },
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      set({ authUser: res.data });
      toast.success('Profile updated successfully!');
    } catch (error) {
      if (error instanceof AxiosError) toast.error(error.response?.data?.message);
    }
    set({ isUpdatingProfile: false });
  },
  connectSocket: () => {
    if (get().socket?.connected) return;
    const socket = io(SOCKET_URL, {
      query: {
        userId: get().authUser?._id,
      },
    });
    set({ socket });

    socket.on('onlineUsers', (userIds: string[]) => {
      set({ onlineUsers: userIds });
    });
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket?.disconnect();
  },
}));
