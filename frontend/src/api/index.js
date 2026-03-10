import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

// ── JWT interceptor on the CORRECT instance ───────────────────────
// axios.create() does NOT inherit interceptors from the default axios.
// We must add the interceptor directly onto `api`.
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('css_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// ── Assignments ───────────────────────────────────────────────────
export const getAssignments = () => api.get('/assignments');
export const getAssignment = (id) => api.get(`/assignments/${id}`);

// ── Execution & Hints ─────────────────────────────────────────────
export const executeSQL = (payload) => api.post('/execute', payload);
export const getHint = (payload) => api.post('/hint', payload);

// ── Auth ──────────────────────────────────────────────────────────
export const loginUser = (data) => api.post('/auth/login', data);
export const registerUser = (data) => api.post('/auth/register', data);
export const getMe = () => api.get('/auth/me');

// ── Progress ──────────────────────────────────────────────────────
export const saveAttempt = (data) => api.post('/progress/attempt', data);
export const getAllProgress = () => api.get('/progress');
export const getProgress = (id) => api.get(`/progress/${id}`);
