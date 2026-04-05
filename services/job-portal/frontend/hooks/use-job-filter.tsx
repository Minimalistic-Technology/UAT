import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { useDebounce } from "@/hooks/use-debounce";

export const useJobFilters = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo(() => ({
    search: searchParams.get("search") || "",
    state: searchParams.get("state") || "",
    country: searchParams.get("country") || "",
    city: searchParams.get("city") || "",
    jobType: searchParams.get("jobType") || "all",
    experienceLevel: searchParams.get("experienceLevel") || "",
    remote: searchParams.get("remote") === "true",
    skills: searchParams.get("skills")?.split(",").filter(Boolean) || [],
    minSalary: searchParams.get("minSalary") ? Number(searchParams.get("minSalary")) : undefined,
    maxSalary: searchParams.get("maxSalary") ? Number(searchParams.get("maxSalary")) : undefined,
    page: Number(searchParams.get("page")) || 1,
    limit: Number(searchParams.get("limit")) || 10,
  }), [searchParams]);

  const updateParams = useCallback((newParams: Record<string, any>) => {
    console.log("new params: ", newParams);
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, value]) => {
      if (!value || value === "all" || (Array.isArray(value) && value.length === 0)) {
        params.delete(key);
      } else {
        params.set(key, Array.isArray(value) ? value.join(",") : String(value));
      }
    });

    if (!newParams.page) params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  // Debounce filters that involve typing to prevent excessive API calls
  const debouncedFilters = useDebounce(filters, 400);

  return { filters, debouncedFilters, updateParams };
};