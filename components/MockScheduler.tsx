import React, { useState, useMemo, useRef } from 'react';
import { Plus, Image as ImageIcon, Calendar, Layers, ChevronLeft, ChevronRight, FileText, Smartphone, LayoutGrid, Trash2, Heart, MoreHorizontal } from 'lucide-react';
import { SocialPlatform, PostStatus, Client, Post, User as UserType } from '../types';

// Mock Data
const mockUser: UserType = {
    name: 'Visitante',
    role: 'Social Media Manager',
    agencyName: 'Minha Agência',
    email: 'demo@doneflow.com',
    avatar: 'https://ui-avatars.com/api/?name=Done+Flow&background=F95500&color=fff',
    plan: 'Pro',
    subscriptionStatus: 'active'
};

const mockClients: Client[] = [
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

const initialMockPosts: Post[] = [
    {
        id: '1',
        clientId: '1',
        title: 'Lançamento do App v2.0',
        content: 'Estamos muito felizes em anunciar...',
        platforms: [SocialPlatform.INSTAGRAM],
        scheduledDate: new Date(new Date().setDate(new Date().getDate() + 1)), // Amanhã
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
        scheduledDate: new Date(new Date().setDate(new Date().getDate() + 2)), // Depois de amanhã
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
    },
    {
        id: '4',
        clientId: '1',
        title: 'Bastidores da Equipe',
        content: 'Um pouco do nosso dia a dia...',
        platforms: [SocialPlatform.INSTAGRAM],
        scheduledDate: new Date(new Date().setDate(new Date().getDate() - 2)),
        status: PostStatus.PUBLISHED,
        author: 'Demo User',
        image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&auto=format&fit=crop&q=60'
    }
];

const MockScheduler: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>(initialMockPosts);
    const [viewMode, setViewMode] = useState<'calendar' | 'feed'>('calendar');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [filterClientId, setFilterClientId] = useState<string>('');
    const [draggedPostId, setDraggedPostId] = useState<string | null>(null);
    const [dragOverDate, setDragOverDate] = useState<string | null>(null);

    // Helpers
    const getClientById = (id: string) => mockClients.find(c => c.id === id);
    const isValidDate = (d: any) => d instanceof Date && !isNaN(d.getTime());

    const currentMonthName = currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    const calendarPosts = useMemo(() => {
        let p = posts.filter(post => isValidDate(post.scheduledDate));
        if (filterClientId) {
            p = p.filter(post => post.clientId === filterClientId);
        }
        return p;
    }, [posts, filterClientId]);

    const feedPosts = useMemo(() => {
        let p = posts.filter(post => isValidDate(post.scheduledDate) && (post.status === PostStatus.SCHEDULED || post.status === PostStatus.PUBLISHED || post.status === PostStatus.REVIEW));
        if (filterClientId) {
            p = p.filter(post => post.clientId === filterClientId);
        }
        return p.sort((a, b) => b.scheduledDate.getTime() - a.scheduledDate.getTime());
    }, [posts, filterClientId]);

    // Handlers (Simplified for Mock)
    const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    return (
        <div className="pointer-events-none select-none transform scale-[0.6] origin-top-left w-[166%] h-[166%] bg-slate-50 overflow-hidden rounded-3xl border border-slate-200 shadow-2xl">
            <div className="p-6 md:p-10 h-full flex flex-col max-w-[1600px] mx-auto animate-fade-in">
                {/* Header */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-6">
                    <div>
                        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Calendário</h2>
                        <p className="text-slate-500 font-medium mt-1">Organize o futuro da sua marca.</p>
                    </div>
                    <div className="flex gap-4 items-center">
                        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
                            <button onClick={() => setViewMode('calendar')} className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${viewMode === 'calendar' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500'}`}>
                                <Calendar size={16} /> Calendário
                            </button>
                            <button onClick={() => setViewMode('feed')} className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${viewMode === 'feed' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500'}`}>
                                <Smartphone size={16} /> Feed Preview
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex gap-8 flex-1 overflow-hidden">
                    {viewMode === 'calendar' ? (
                        <div className="bg-white rounded-[32px] shadow-card border border-slate-100 flex-1 p-6 md:p-10 overflow-hidden flex flex-col relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-6">
                                    <h3 className="text-2xl font-extrabold text-slate-800 capitalize flex items-center gap-2">
                                        {currentMonthName}
                                    </h3>
                                    <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
                                        <button onClick={handlePrevMonth} className="p-2 hover:bg-white rounded-lg text-slate-500"><ChevronLeft size={20} /></button>
                                        <button onClick={handleNextMonth} className="p-2 hover:bg-white rounded-lg text-slate-500"><ChevronRight size={20} /></button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-hidden relative bg-white rounded-2xl">
                                <div className="grid grid-cols-7 gap-px bg-slate-100 border border-slate-200 rounded-t-2xl overflow-hidden mb-4">
                                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                                        <div key={day} className="bg-slate-50 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">{day}</div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-7 gap-4 auto-rows-fr min-h-[600px]">
                                    {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} className="p-2"></div>)}
                                    {Array.from({ length: daysInMonth }).map((_, i) => {
                                        const day = i + 1;
                                        const dayPosts = calendarPosts.filter(p => p.scheduledDate.getDate() === day && p.scheduledDate.getMonth() === currentMonth);
                                        const isToday = new Date().getDate() === day && new Date().getMonth() === currentMonth;

                                        return (
                                            <div key={i} className={`border rounded-2xl p-3 relative flex flex-col gap-2 min-h-[140px] ${isToday ? 'border-brand-200 bg-white shadow-card ring-4 ring-brand-50/50' : 'bg-white border-slate-100'}`}>
                                                <span className={`text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full ${isToday ? 'bg-brand-600 text-white' : 'text-slate-700 bg-slate-100'}`}>{day}</span>
                                                {dayPosts.map(post => (
                                                    <div key={post.id} className="p-2.5 rounded-xl shadow-sm text-xs flex gap-2.5 items-center bg-white border border-slate-100 relative overflow-hidden">
                                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                                                        {post.image ? (
                                                            <div className="w-9 h-9 rounded-lg bg-slate-100 shrink-0 overflow-hidden"><img src={post.image} className="w-full h-full object-cover" /></div>
                                                        ) : (
                                                            <div className="w-9 h-9 rounded-lg bg-slate-100 shrink-0 flex items-center justify-center text-slate-400"><ImageIcon size={14} /></div>
                                                        )}
                                                        <div className="min-w-0 flex-1">
                                                            <p className="font-bold text-slate-800 truncate leading-tight mb-0.5">{getClientById(post.clientId)?.name}</p>
                                                            <p className="text-[10px] text-slate-500 truncate">{post.title}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-[32px] shadow-card flex-1 p-4 md:p-8 overflow-hidden flex flex-col items-center justify-center relative z-10">
                            <div className="w-[380px] h-[800px] bg-slate-900 rounded-[3.5rem] p-3 shadow-2xl ring-4 ring-slate-200 relative transform scale-[0.85] border-[6px] border-slate-900">
                                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-7 w-40 bg-slate-900 rounded-b-3xl z-30 flex justify-center items-center"><div className="w-20 h-4 bg-black rounded-b-2xl"></div></div>
                                <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden flex flex-col relative">
                                    <div className="h-12 bg-white flex justify-between items-end px-6 pb-2 shrink-0 z-20 select-none">
                                        <span className="text-[12px] font-bold text-slate-900">9:41</span>
                                        <div className="flex gap-1.5 items-center"><div className="h-2.5 w-4 bg-slate-900 rounded-[2px]"></div><div className="h-2.5 w-3.5 bg-slate-900 rounded-[2px]"></div><div className="h-2.5 w-5 bg-slate-300 rounded-[2px] relative border border-slate-900"><div className="absolute inset-0.5 bg-slate-900 w-[70%]"></div></div></div>
                                    </div>
                                    <div className="h-12 border-b border-slate-50 flex items-center justify-between px-4 bg-white shrink-0 z-10">
                                        <div className="w-8"></div>
                                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1 uppercase tracking-wide">techstart <div className="w-2 h-2 rounded-full bg-red-500"></div></span>
                                        <MoreHorizontal size={20} className="text-slate-900" />
                                    </div>
                                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
                                        <div className="grid grid-cols-3 gap-0.5 pb-20">
                                            {feedPosts.map(post => (
                                                <div key={post.id} className="aspect-square bg-slate-100 relative group overflow-hidden">
                                                    {post.image ? <img src={post.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50"><ImageIcon size={20} /></div>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MockScheduler;
