import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const registerUser = (data) => api.post('/register', data);
export const loginUser = (data) => api.post('/login', data);
export const getProfile = () => api.get('/profile');
export const updateProfile = (data) => api.put('/profile', data);
export const submitAssessment = (data) => api.post('/assessment', data);
export const predictAssessment = (data) => api.post('/predict', data);
export const getHistory = () => api.get('/history');
export const getRecommendations = (risk) =>
  api.get('/recommendations', { params: risk ? { risk_level: risk } : {} });
export const getAdminStats = () => api.get('/admin/stats');
export const getAdminUsers = () => api.get('/admin/users');
export const deleteAdminUser = (uid) => api.delete(`/admin/users/${uid}`);
export const exportCsv = () =>
  api.get('/admin/export/csv', { responseType: 'blob' });
export const sendChatMessage = (message) => api.post('/chat', { message });
export const getChatSuggestions = () => api.get('/chat/suggestions');
export const getMoods = () => api.get('/mood');
export const addMood = (data) => api.post('/mood', data);
export const getGoals = () => api.get('/goals');
export const createGoal = (data) => api.post('/goals', data);
export const updateGoal = (id, data) => api.put(`/goals/${id}`, data);
export const deleteGoal = (id) => api.delete(`/goals/${id}`);
export const getNotifications = () => api.get('/notifications');
export const markNotificationsRead = (id) => api.post('/notifications/read', id ? { id } : {});
export const getSettings = () => api.get('/settings');
export const saveSettings = (data) => api.put('/settings', data);
export const getWeeklyReport = () => api.get('/weekly-report');
export const getAchievements = () => api.get('/achievements');
export const getInsights = () => api.get('/insights');
export const exportMyData = () => api.get('/export/my-data');
export const getWellnessScore = () => api.get('/wellness-score');
export const getStreaks = () => api.get('/streaks');
export const getMoodCalendar = () => api.get('/calendar');
export const getJournals = () => api.get('/journal');
export const addJournal = (data) => api.post('/journal', data);
export const deleteJournal = (id) => api.delete(`/journal/${id}`);
export const getSleepLogs = () => api.get('/sleep');
export const addSleepLog = (data) => api.post('/sleep', data);
export const getResources = () => api.get('/resources');

export default api;
