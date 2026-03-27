import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { LoginValues, RegisterValues } from "../types/auth-type";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const authService = {
  login: async (data: LoginValues) => {
    const response = await api.post("/auth/login", data);
    return response.data;
  },
  register: async (data: RegisterValues) => {
    const response = await api.post("/auth/register", data);
    return response.data;
  },
};
