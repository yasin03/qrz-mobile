import axios from "axios";

import { useAuthStore } from "@/stores/auth-store";
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    console.log("AXIOS:", config.method?.toUpperCase(), config.url);

    const user = useAuthStore.getState().user;
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    if (error.response?.status === 401) {
      console.log("AXIOS: 401 Unauthorized");

      await useAuthStore.getState().logout();
    }

    return Promise.reject(error);
  },
);
