import React from 'react';
import Dashboard from './Dashboard';
import { PostStatus, SocialPlatform } from '../types';

const MockDashboard: React.FC = () => {
    const mockUser = {
        name: 'Visitante',
        role: 'Social Media Manager',
        agencyName: 'Minha Agência',
        email: 'demo@doneflow.com',
        avatar: 'https://ui-avatars.com/api/?name=Done+Flow&background=F95500&color=fff',
        plan: 'Pro' as const,
        subscriptionStatus: 'active' as const
    };

    const mockClients = [
        {
            id: '1',
            name: 'TechStart',
            industry: 'Tecnologia',
            logo: 'https://ui-avatars.com/api/?name=TS&background=0f172a&color=fff',
            active: true,
            connectedPlatforms: [SocialPlatform.INSTAGRAM, SocialPlatform.LINKEDIN]
        },
        {
            id: '2',
            name: 'Café & Co',
            industry: 'Alimentação',
            logo: 'https://ui-avatars.com/api/?name=CC&background=78350f&color=fff',
            active: true,
            connectedPlatforms: [SocialPlatform.INSTAGRAM]
        }
    ];

    const mockPosts = [
        {
            id: '1',
            clientId: '1',
            title: 'Lançamento do App v2.0',
            content: 'Estamos muito felizes em anunciar...',
            platforms: [SocialPlatform.INSTAGRAM],
            scheduledDate: new Date(Date.now() + 86400000), // Amanhã
            status: PostStatus.SCHEDULED,
            author: 'Demo User',
            image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
        },
        {
            id: '2',
            clientId: '2',
            title: 'Promoção de Café da Manhã',
            content: 'Comece o dia com energia...',
            platforms: [SocialPlatform.INSTAGRAM],
            scheduledDate: new Date(Date.now() + 172800000), // Depois de amanhã
            status: PostStatus.SCHEDULED,
            author: 'Demo User',
            image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
        },
        {
            id: '3',
            clientId: '1',
            title: 'Dicas de Produtividade',
            content: '5 dicas para render mais...',
            platforms: [SocialPlatform.LINKEDIN],
            scheduledDate: new Date(),
            status: PostStatus.DRAFT,
            author: 'Demo User'
        }
    ];

    return (
        <div className="pointer-events-none select-none transform scale-[0.6] origin-top-left w-[166%] h-[166%] bg-slate-50 overflow-hidden rounded-3xl border border-slate-200 shadow-2xl">
            <Dashboard
                user={mockUser}
                clients={mockClients}
                posts={mockPosts}
                onNavigate={() => { }}
            />
        </div>
    );
};

export default MockDashboard;
