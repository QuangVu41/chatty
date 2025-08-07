import { create } from 'zustand';
import { useAuthStore, type AuthUser } from './useAuthStore';
import { axiosInstance } from '../lib/axios';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';

interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  text?: string;
  image?: string;
  createdAt: string;
}

interface SendMessage {
  text?: string;
  image?: File;
}

interface ChatStore {
  messages: Message[];
  users: AuthUser[];
  selectedUser: AuthUser | null;
  isUsersLoading: boolean;
  isMessagesLoading: boolean;
  getUsers: () => Promise<void>;
  getMessages: (userId: string) => Promise<void>;
  setSelectedUser: (user: AuthUser | null) => void;
  sendMessage: (data: SendMessage) => Promise<void>;
  subscribeToMessages: () => void;
  unsubscribeFromMessages: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get<AuthUser[]>('/users/connected-users');
      set({ users: res.data });
    } catch (error) {
      if (error instanceof AxiosError) toast.error(error.response?.data.message);
    }
    set({ isUsersLoading: false });
  },
  getMessages: async (userId: string) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get<Message[]>(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      if (error instanceof AxiosError) toast.error(error.response?.data.message);
    }
    set({ isMessagesLoading: false });
  },
  setSelectedUser: (user: AuthUser | null) => set({ selectedUser: user }),
  sendMessage: async (data: SendMessage) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post<Message>(`/messages/send-message/${selectedUser?._id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      set({ messages: [...messages, res.data] });
    } catch (error) {
      if (error instanceof AxiosError) toast.error(error.response?.data.message);
    }
  },
  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    socket?.on('newMessage', (data: Message) => {
      if (data.senderId !== selectedUser._id) return;
      set((state) => ({ messages: [...state.messages, data] }));
    });
  },
  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket?.off('newMessage');
  },
}));
