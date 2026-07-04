import type { Metadata } from 'next';
import TeamClient from './TeamClient';

export const metadata: Metadata = {
    title: 'Team | Minimalistic Technology',
    description: 'The collective of architects and creative minds behind Minimalistic Technology.',
};

export default function TeamPage() {
    return <TeamClient />;
}
