import axios from 'axios';
import { supabase } from '../lib/supabase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to all requests
api.interceptors.request.use(async (config) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
  } catch (error) {
    console.error('Error getting session:', error);
  }
  
  return config;
});

// Auth endpoints
export const authAPI = {
  signup: async (email: string, password: string) => {
    const response = await api.post('/auth/signup', {
      email,
      password,
    });
    return response.data;
  },

  signin: async (email: string, password: string) => {
    const response = await api.post('/auth/signin', {
      email,
      password,
    });
    return response.data;
  },

  signout: async () => {
    const response = await api.post('/auth/signout');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Analytics endpoints
export const analyticsAPI = {
  getWeeklyStats: async (userId: number) => {
    const response = await api.get(`/analytics/weekly-stats/${userId}`);
    return response.data;
  },

  getTopicProgress: async (userId: number) => {
    const response = await api.get(`/analytics/topic-progress/${userId}`);
    return response.data;
  },
};

// User endpoints
export const userAPI = {
  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  getUserById: async (id: number) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  createUser: async (userData: { email: string; username: string; authId: string }) => {
    const response = await api.post('/users', userData);
    return response.data;
  },
};

// Tags endpoints
export const tagsAPI = {
  getAllTags: async () => {
    const response = await api.get('/tags');
    return response.data;
  },

  getTagsByUserId: async (userId: number) => {
    const response = await api.get(`/tags/user/${userId}`);
    return response.data;
  },

  createTag: async (tagData: { name: string; description?: string; userId: number }) => {
    const response = await api.post('/tags', tagData);
    return response.data;
  },

  createTagForUser: async (userId: number, tagData: { name: string; description?: string }) => {
    const response = await api.post(`/tags/${userId}`, tagData);
    return response.data;
  },

  getQuestionsToShow: async (userId: number) => {
    const response = await api.get(`/flashcards/show/user/${userId}`);
    return response.data;
  },
};