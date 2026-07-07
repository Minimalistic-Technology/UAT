import type { Metadata } from 'next';
import HomeClient from '@/components/HomeClient';

export const metadata: Metadata = {
    title: 'Minimalistic Technology | Engineering the Future',
    description: 'We are an elite collective of software architects and creative designers building high-performance digital solutions.',
};

export default function HomePage() {
    return <HomeClient />;
}
