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
}

export const authApi = {
  register: (data: { username: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const pollsApi = {
  getAllPolls: () => api.get<{ data: Poll[] }>('/polls'),
  getPollById: (id: string) => api.get<{ data: Poll }>(`/polls/${id}`),
  createPoll: (data: {
    question: string;
    description?: string;
    options: string[];
    budget: number;
    reward: number;
    endsAt?: string;
  }) => api.post('/polls', data),
  vote: (pollId: string, optionId: string) => 
    api.post(`/polls/${pollId}/vote`, { optionId }),
};

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  balance: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
