import type { Metadata } from 'next';
import AboutClient from './AboutClient';

export const metadata: Metadata = {
    title: 'About us | Minimalistic Technology',
    description: 'Elite collective of software architects and creative designers building high-performance digital solutions.',
};

export default function AboutPage() {
    return <AboutClient />;
}
