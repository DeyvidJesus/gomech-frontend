import { redirect } from "@tanstack/react-router";
import axios from "axios";

const api = axios.create({
  // baseURL: "http://localhost:5080",
  baseURL: "https://api.go-mech.com",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Fallback para cache do TanStack Query
      try {
        const sessionDataString = localStorage.getItem("tanstack-query-persist-client");
        if (sessionDataString) {
          const sessionData = JSON.parse(sessionDataString);
          const fallbackToken = sessionData?.clientState?.queries?.find(
            (q: any) => q.queryKey[0] === "auth"
          )?.state?.data?.token;
          if (fallbackToken) {
            config.headers.Authorization = `Bearer ${fallbackToken}`;
          }
        }
      } catch (error) {
        console.error("Error reading auth cache:", error);
      }
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
