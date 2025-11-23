import React, { useState, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Brain, TrendingUp, Users, Eye, Briefcase, RefreshCw, Sparkles, LayoutGrid } from 'lucide-react';
import { Client } from '../types';

// Mock Data
const mockClients: Client[] = [
    {
        id: '1',
        name: 'TechStart',
        industry: 'Tecnologia',
        logo: 'https://ui-avatars.com/api/?name=TS&background=0f172a&color=fff',
        active: true,
        connectedPlatforms: []
    },
    {
        id: '2',
        name: 'Café & Co',
        industry: 'Alimentação',
        logo: 'https://ui-avatars.com/api/?name=CC&background=78350f&color=fff',
        active: true,
        connectedPlatforms: []
    }
];

const baseMockData = [
    { name: 'Seg', followers: 4000, engagement: 2400, reach: 2400 },
    { name: 'Ter', followers: 3000, engagement: 1398, reach: 2210 },
    { name: 'Qua', followers: 2000, engagement: 9800, reach: 2290 },
    { name: 'Qui', followers: 2780, engagement: 3908, reach: 2000 },
    { name: 'Sex', followers: 1890, engagement: 4800, reach: 2181 },
    { name: 'Sáb', followers: 2390, engagement: 3800, reach: 2500 },
    { name: 'Dom', followers: 3490, engagement: 4300, reach: 2100 },
];

const MockAnalytics: React.FC = () => {
    const [selectedClientId, setSelectedClientId] = useState<string>('1');

    const displayData = useMemo(() => {
        return baseMockData.map(d => ({
            ...d,
            followers: Math.floor(d.followers * 0.6),
            engagement: Math.floor(d.engagement * (Math.random() * 0.5 + 0.5)),
            reach: Math.floor(d.reach * 0.7)
        }));
    }, [selectedClientId]);

    const competitorData = [
        { name: 'TechStart', value: 85, fill: '#0ea5e9' },
        { name: 'Concorrente A', value: 65, fill: '#94a3b8' },
        { name: 'Concorrente B', value: 45, fill: '#cbd5e1' },
    ];

    return (
        <div className="pointer-events-none select-none transform scale-[0.6] origin-top-left w-[166%] h-[166%] bg-slate-50 overflow-hidden rounded-3xl border border-slate-200 shadow-2xl">
            <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 overflow-y-auto h-full custom-scrollbar animate-fade-in">
                <div className="flex flex-col lg:flex-row justify-between items-end gap-6">
                    <div>
                        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Performance</h2>
                        <p className="text-slate-500 font-medium mt-1">Análise detalhada das métricas e concorrência.</p>
                    </div>
                    <div className="flex gap-3 items-center flex-wrap">
                        <div className="flex items-center gap-3 bg-white p-2 border border-slate-200 rounded-2xl shadow-sm overflow-x-auto max-w-full">
                            <div className="flex items-center px-1 gap-2">
                                {mockClients.map(client => (
                                    <button
                                        key={client.id}
                                        onClick={() => setSelectedClientId(client.id)}
                                        className={`w-9 h-9 rounded-full border-2 overflow-hidden transition-all duration-200 relative group bg-white shrink-0 ${selectedClientId === client.id
                                                ? 'border-brand-600 z-10 scale-110 shadow-sm'
                                                : 'border-white grayscale hover:grayscale-0 hover:z-10 hover:scale-105'
                                            }`}
                                    >
                                        <img src={client.logo} alt={client.name} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Insights Section */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[32px] p-8 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Brain size={120} /></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm border border-white/20"><Brain size={24} className="text-white" /></div>
                            <h3 className="font-bold text-xl">Done Flow AI Insights</h3>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 min-h-[100px]">
                            <div className="text-base font-medium leading-relaxed whitespace-pre-line opacity-95">
                                Análise para TechStart: Pico de engajamento na Quarta-feira. Queda de seguidores na Sexta. Alcance médio de 2200.
                                Recomendamos focar em conteúdos de vídeo curto para aumentar a retenção.
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-slate-100 shadow-card">
                        <h3 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-2">
                            <TrendingUp size={20} className="text-blue-500" />
                            Evolução de Engajamento
                        </h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={displayData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickMargin={10} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px -5px rgba(0,0,0,0.1)', padding: '12px 16px' }} itemStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                                    <Legend />
                                    <Line type="monotone" dataKey="engagement" name="Engajamento" stroke="#0ea5e9" strokeWidth={4} dot={{ r: 4, fill: '#0ea5e9', strokeWidth: 0 }} activeDot={{ r: 8, strokeWidth: 0 }} />
                                    <Line type="monotone" dataKey="reach" name="Alcance" stroke="#8b5cf6" strokeWidth={4} dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 0 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-card flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Eye size={20} className="text-emerald-500" /> Share of Voice</h3>
                                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wide">Concorrência</p>
                            </div>
                        </div>
                        <div className="h-[200px] w-full flex-1 mb-6">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={competitorData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} tickLine={false} axisLine={false} />
                                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }} />
                                    <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MockAnalytics;
