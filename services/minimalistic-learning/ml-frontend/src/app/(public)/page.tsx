"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Hero } from "@/components/Hero";
import TrendingSection from "@/components/TrendingSection";

export default function Home() {
	const [homeContent, setHomeContent] = useState<any>(null);

	useEffect(() => {
		api.get('/public/content/home')
			.then((res: any) => {
				if (res.data?.data) setHomeContent(res.data.data);
			})
			.catch(() => { });
	}, []);

	return (
		<main className="min-h-screen bg-background">
			<Hero previewData={homeContent?.hero ?? null} />
			<TrendingSection trendingBadge={homeContent?.hero?.trendingBadge} trendingTitle={homeContent?.hero?.trendingTitle} />
		</main>
	);
}
