import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'accept': 'application/json',
  },
  withCredentials: true,
});

let isAuthenticated = false;

export function setAuthenticated(value) {
  isAuthenticated = value;
}

apiClient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      // auth-маршруты не трогаем — там 401 это просто неверные данные
      if (originalRequest.url?.startsWith('/auth/')) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const response = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        const newAccessToken = response.data.accessToken;

        localStorage.setItem('accessToken', newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        if (isAuthenticated) {
          isAuthenticated = false;
          window.dispatchEvent(new CustomEvent('session-expired'));
          return new Promise(() => {});
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const auth = {
  register: (data) => apiClient.post('/auth/register', data),
  login:    (data) => apiClient.post('/auth/login', data),
  refresh:  ()     => apiClient.post('/auth/refresh'),
  me:       ()     => apiClient.get('/auth/me'),
};

export const products = {
  getAll:  ()         => apiClient.get('/products'),
  getById: (id)       => apiClient.get(`/products/${id}`),
  create:  (data)     => apiClient.post('/products', data),
  update:  (id, data) => apiClient.put(`/products/${id}`, data),
  remove:  (id)       => apiClient.delete(`/products/${id}`),
};

export const usersApi = {
  getAll:  ()         => apiClient.get('/users'),
  getById: (id)       => apiClient.get(`/users/${id}`),
  update:  (id, data) => apiClient.put(`/users/${id}`, data),
  block:   (id)       => apiClient.delete(`/users/${id}`),
};