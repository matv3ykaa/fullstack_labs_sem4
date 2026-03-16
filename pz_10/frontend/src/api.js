import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'accept': 'application/json',
  },
  withCredentials: true, // отправлять HttpOnly cookie с каждым запросом
});

// Подставляем access-токен в каждый запрос
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

// Автоматическое обновление access-токена при 401
// refresh-токен едет в HttpOnly cookie автоматически
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        const newAccessToken = response.data.accessToken;

        localStorage.setItem('accessToken', newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
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