import axios from 'axios';

const baseURL = 'http://localhost:8000/api';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  register: (userData: { email: string; password: string; name: string }) =>
    api.post('/auth/register', userData),
};

// Materials API
export const materialsAPI = {
  getAll: () => api.get('/materials'),
  getById: (id: string) => api.get(`/materials/${id}`),
  create: (data: any) => api.post('/materials', data),
  update: (id: string, data: any) => api.put(`/materials/${id}`, data),
  delete: (id: string) => api.delete(`/materials/${id}`),
};

// Building Types API
export const buildingTypesAPI = {
  getAll: () => api.get('/building-types'),
  getById: (id: string) => api.get(`/building-types/${id}`),
  create: (data: any) => api.post('/building-types', data),
  update: (id: string, data: any) => api.put(`/building-types/${id}`, data),
  delete: (id: string) => api.delete(`/building-types/${id}`),
};

// Projects API
export const projectsAPI = {
  getAll: () => api.get('/projects'),
  getById: (id: string) => api.get(`/projects/${id}`),
  create: (data: any) => api.post('/projects', data),
  update: (id: string, data: any) => api.put(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
  estimate: (id: string) => api.post(`/projects/${id}/estimate`),
};