import { Hero } from "@/components/Hero";
import TrendingSection from "@/components/TrendingSection";

export default function Home() {
	return (
		<main className="min-h-screen bg-background">
			<Hero />
			<TrendingSection />
		</main>
	);
}
