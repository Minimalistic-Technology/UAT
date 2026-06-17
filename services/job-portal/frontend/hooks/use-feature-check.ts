"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api-client";
import { useNavSession } from "@/hooks/use-nav-session";

export function useFeatureCheck(slug: string) {
  const [isAllowed, setIsAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const { session } = useNavSession();

  useEffect(() => {
    let mounted = true;

    async function checkFeature() {
      if (!session?.user?.id) return;
      try {
        const featureRes = await api.get(`/features/${slug}/check`);

        if (mounted) {
          setIsAllowed(!!featureRes.data?.data?.allowed);
        }
      } catch (error) {
        console.error("Failed to check feature permission:", error);
        if (mounted) setIsAllowed(false);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    checkFeature();

    // Optional: Re-check when window regains focus to catch dashboard changes
    const handleFocus = () => {
      checkFeature();
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      mounted = false;
      window.removeEventListener("focus", handleFocus);
    };
  }, [slug, session]);

  return { isAllowed, loading };
}
