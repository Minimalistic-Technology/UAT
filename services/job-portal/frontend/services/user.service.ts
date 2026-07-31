import apiClient from "@/lib/api-client";
import { User, Experience, Education } from "@/types";

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  location?: {
    city: string;
    state: string;
    country: string;
  };
  skills?: string[];
  languages?: string[];
  experience?: Experience[];
  education?: Education[];
}

export const updateProfile = async (data: UpdateProfilePayload) => {
  const response = await apiClient.put("/users/profile", data);
  return response.data;
};
