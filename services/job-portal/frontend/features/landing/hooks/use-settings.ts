import { useQuery } from "@tanstack/react-query";
import { getLandingSettings } from "../services/settings.service";

export const useGetLandingSettings = (title?: string) => {
  return useQuery({
    queryKey: ["landing-settings", title],
    queryFn: () => getLandingSettings(title),
  });
};
