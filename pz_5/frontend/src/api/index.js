import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
    "accept": "application/json",
  },
});

export const api = {
  // Получить всех пользователей
  getUsers: async () => {
    const response = await apiClient.get("/users");
    return response.data;
  },

  // Получить пользователя по ID
  getUserById: async (id) => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  // Создать пользователя
  createUser: async (user) => {
    const response = await apiClient.post("/users", user);
    return response.data;
  },

  // Обновить пользователя
  updateUser: async (id, user) => {
    const response = await apiClient.patch(`/users/${id}`, user);
    return response.data;
  },

  // Удалить пользователя
  deleteUser: async (id) => {
    await apiClient.delete(`/users/${id}`);
  },
};
