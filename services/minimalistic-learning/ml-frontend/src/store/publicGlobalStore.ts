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

    // Local Storage 24-Hours Caching Logic
    const CACHE_KEY = "ml_home_content_cache";
    const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { timestamp, data } = JSON.parse(cached);
          if (Date.now() - timestamp < TWENTY_FOUR_HOURS_MS) {
            set({ homeContent: data });
            return; // Exit early, NO API hit!
          }
        }
      } catch (e) {
        console.error("Cache read failed", e);
      }
    }

    set({ isFetchingHome: true });
    try {
      const res = await api.get("/public/content/home");
      if (res.data?.data) {
        set({ homeContent: res.data.data, isFetchingHome: false });

        // Save to LocalStorage cache
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({
              timestamp: Date.now(),
              data: res.data.data
            }));
          } catch (e) { }
        }
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
