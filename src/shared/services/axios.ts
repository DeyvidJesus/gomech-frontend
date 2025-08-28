import { redirect } from "@tanstack/react-router";
import axios from "axios";
import type { SessionData } from "../types/sessionData";

const api = axios.create({
  baseURL: "http://localhost:5080",
  // baseURL: "https://clear-ellene-deyvidgondim-8b8a208e.koyeb.app",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const sessionDataString = localStorage.getItem("REACT_QUERY_OFFLINE_CACHE");
    const sessionData: SessionData | null = sessionDataString ? JSON.parse(sessionDataString) : null;
    const { token } = sessionData?.clientState?.queries?.[0]?.state?.data || {}
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
