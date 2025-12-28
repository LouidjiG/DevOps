import axios from 'axios';

export const API_URL = '/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface PollOption {
  id: string;
  text: string;
  pollId: string;
  voteCount: number;
  rewardPerVote: string;
  createdAt: string;
  updatedAt: string;
}

export interface Poll {
  id: string;
  question: string;
  description: string | null;
  budget: string;
  reward: string;
  isActive: boolean;
  endsAt: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  options?: PollOption[];
  hasVoted?: boolean;
  creator?: {
    id: string;
    username: string;
  };
}

export const authApi = {
  register: (data: { username: string; email: string; password: string; role?: string }) =>
    api.post<AuthResponse>('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  addBalance: (amount: number) => api.post<{ status: string; data: User; message: string }>('/auth/add-balance', { amount }),
};

export const pollsApi = {
  getAllPolls: (params?: { limit?: number; offset?: number; search?: string }) => api.get<{ data: Poll[]; meta: { total: number } }>('/polls', { params }),
  getMyCreatedPolls: () => api.get<{ data: Poll[] }>('/polls/my-created'),
  deletePoll: (id: string) => api.delete<{ status: string }>(`/polls/${id}`),
  getPollById: (id: string) => api.get<{ data: Poll }>(`/polls/${id}`),
  createPoll: (data: {
    question: string;
    description?: string;
    options: string[];
    budget: number;
    reward: number;
    endsAt?: string;
  }) => api.post('/polls', data),
  updatePoll: (id: string, data: { question: string; description?: string; endsAt?: string; budget?: number; reward?: number }) =>
    api.put<{ status: string; data: Poll; message: string }>(`/polls/${id}`, data),
  vote: (pollId: string, optionId: string) =>
    api.post(`/polls/${pollId}/vote`, { optionId }),
};

export const adminApi = {
  getStats: () => api.get<{ data: { users: number; polls: number; votes: number; totalBalance: string } }>('/users/stats'),
  getUsers: (params?: { limit?: number; offset?: number; search?: string }) =>
    api.get<{ data: User[]; meta: { total: number } }>('/users', { params }),
};

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  balance: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
