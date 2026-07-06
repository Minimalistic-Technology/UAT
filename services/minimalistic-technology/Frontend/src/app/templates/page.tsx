import type { Metadata } from 'next';
import TemplatesClient from './TemplatesClient';

export const metadata: Metadata = {
    title: 'Templates | Minimalistic Technology',
    description: 'Explore our hand-crafted templates made with clean code and smooth animations.',
};

export default function TemplatesPage() {
    return <TemplatesClient />;
}
