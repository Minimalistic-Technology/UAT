import { create } from "zustand";
import { api } from "@/lib/api";

interface PublicStoreState {
  homeContent: any | null;
  teamMembers: any[] | null;
  isFetchingHome: boolean;
  isFetchingTeam: boolean;

  // Actions
  fetchHomeContent: () => Promise<void>;
  fetchTeamMembers: () => Promise<void>;
}

export const usePublicGlobalStore = create<PublicStoreState>((set, get) => ({
  homeContent: null,
  teamMembers: null,
  isFetchingHome: false,
  isFetchingTeam: false,

  fetchHomeContent: async () => {
    // Only fetch if we don't have the data and are not already fetching
    if (get().homeContent || get().isFetchingHome) return;
    set({ isFetchingHome: true });
    try {
      const res = await api.get("/public/content/home");
      if (res.data?.data) {
        set({ homeContent: res.data.data, isFetchingHome: false });
      }
    } catch (error) {
      console.error("Failed to fetch home content", error);
      set({ isFetchingHome: false });
    }
  },

  fetchTeamMembers: async () => {
    // Only fetch if we don't have the data and are not already fetching
    if (get().teamMembers || get().isFetchingTeam) return;
    set({ isFetchingTeam: true });
    try {
      const res = await api.get("/public/team");
      if (res.data?.data) {
        set({ teamMembers: res.data.data, isFetchingTeam: false });
      }
    } catch (error) {
      console.error("Failed to fetch team members", error);
      set({ isFetchingTeam: false });
    }
  },
}));
