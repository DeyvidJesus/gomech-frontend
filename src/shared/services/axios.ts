import { redirect } from "@tanstack/react-router";
import axios from "axios";

const api = axios.create({
  baseURL: "https://clear-ellene-deyvidgondim-8b8a208e.koyeb.app",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      redirect({ to: "/login" });
    } else if (error.response?.status === 403) {
      console.error("Acesso negado:", error.response.data);
      alert("Você não tem permissão para realizar esta ação");
      redirect({ to: "/" });
    }

    return Promise.reject(error);
  }
);

export default api;
