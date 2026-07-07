import type { Metadata } from 'next';
import ServicesClient from './ServicesClient';

export const metadata: Metadata = {
    title: 'Services | Minimalistic Technology',
    description: 'Elite digital solutions, from AI-powered builders to custom UI/UX design.',
};

export default function ServicesPage() {
    return <ServicesClient />;
}
