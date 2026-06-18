"use client";

import { useState, useEffect } from "react";
import { useNavSession } from "@/hooks/use-nav-session";
import { checkFeature } from "@/features/admin/services/feature.service";

export function useFeatureCheck(slug: string) {
  const [isAllowed, setIsAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const { session } = useNavSession();

  useEffect(() => {
    let mounted = true;

    async function verifyFeature() {
      if (!session?.user?.id) return;
      try {
        const featureData = await checkFeature(slug);

        if (mounted) {
          setIsAllowed(!!featureData?.allowed);
        }
      } catch (error) {
        console.error("Failed to check feature permission:", error);
        if (mounted) setIsAllowed(false);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    verifyFeature();

    // Optional: Re-check when window regains focus to catch dashboard changes
    const handleFocus = () => {
      verifyFeature();
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      mounted = false;
      window.removeEventListener("focus", handleFocus);
    };
  }, [slug, session]);

  return { isAllowed, loading };
}
