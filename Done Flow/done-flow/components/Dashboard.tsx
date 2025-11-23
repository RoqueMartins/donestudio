
import React, { useMemo } from 'react';
import { 
  Plus, CalendarDays, Zap, BarChart3, Users, ArrowRight, TrendingUp, 
  Sparkles, MessageSquare, Clock, CheckCircle2, LayoutGrid 
} from 'lucide-react';
import { Post, PostStatus, Client, User } from '../types';

interface DashboardProps {
  clients: Client[];
  posts: Post[];
  onNavigate: (view: string) => void;
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ clients, posts, onNavigate, user }) => {
  
  const stats = useMemo(() => {
      const scheduled = posts.filter(p => p.status === PostStatus.SCHEDULED).length;
      const draft = posts.filter(p => p.status === PostStatus.DRAFT).length;
      const review = posts.filter(p => p.status === PostStatus.REVIEW).length;
      return { scheduled, draft, review };
  }, [posts]);

  const upcomingPosts = useMemo(() => {
      return posts
        .filter(p => p.status === PostStatus.SCHEDULED && new Date(p.scheduledDate) >= new Date())
        .sort((a,b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
        .slice(0, 3);
  }, [posts]);

  // Quick Actions Bento Config
  const quickActions = [
      { id: 'studio', label: 'Novo Post', desc: 'Criar conteúdo', icon: Plus, color: 'bg-slate-900 text-white', hover: 'hover:bg-slate-800' },
      { id: 'planner', label: 'IA Brain', desc: 'Ideias & Tópicos', icon: Zap, color: 'bg-brand-600 text-white', hover: 'hover:bg-brand-700' },
      { id: 'scheduler', label: 'Agenda', desc: 'Ver calendário', icon: CalendarDays, color: 'bg-white text-slate-600 border border-slate-200', hover: 'hover:border-brand-300 hover:text-brand-600' },
      { id: 'clients', label: 'Clientes', desc: 'Gerenciar marcas', icon: Users, color: 'bg-white text-slate-600 border border-slate-200', hover: 'hover:border-brand-300 hover:text-brand-600' },
  ];

  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto h-full flex flex-col animate-slide-up overflow-y-auto custom-scrollbar">
        
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
            <div>
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
                    Olá, {user.name.split(' ')[0]} <span className="inline-block animate-wave">👋</span>
                </h1>
                <p className="text-slate-500 font-medium text-lg">Aqui está o resumo da sua agência hoje.</p>
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-500 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
                <CalendarDays size={16} className="text-brand-500" />
                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            
            {/* Stat Card 1: Scheduled */}
            <div onClick={() => onNavigate('scheduler')} className="bg-white p-6 rounded-[24px] shadow-card border border-slate-100 relative overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity group-hover:scale-110 duration-500">
                    <Clock size={80} className="text-blue-600" />
                </div>
                <div className="relative z-10">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                        <Clock size={20} />
                    </div>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-1">Agendados</p>
                    <h3 className="text-4xl font-extrabold text-slate-800">{stats.scheduled}</h3>
                </div>
            </div>

             {/* Stat Card 2: In Review */}
             <div onClick={() => onNavigate('workflow')} className="bg-white p-6 rounded-[24px] shadow-card border border-slate-100 relative overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity group-hover:scale-110 duration-500">
                    <CheckCircle2 size={80} className="text-yellow-500" />
                </div>
                <div className="relative z-10">
                    <div className="w-10 h-10 rounded-2xl bg-yellow-50 flex items-center justify-center text-yellow-600 mb-4 group-hover:scale-110 transition-transform">
                        <CheckCircle2 size={20} />
                    </div>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-1">Em Aprovação</p>
                    <h3 className="text-4xl font-extrabold text-slate-800">{stats.review}</h3>
                </div>
            </div>

             {/* Stat Card 3: Drafts */}
             <div onClick={() => onNavigate('workflow')} className="bg-white p-6 rounded-[24px] shadow-card border border-slate-100 relative overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity group-hover:scale-110 duration-500">
                    <LayoutGrid size={80} className="text-slate-400" />
                </div>
                <div className="relative z-10">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 mb-4 group-hover:scale-110 transition-transform">
                        <LayoutGrid size={20} />
                    </div>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-1">Rascunhos</p>
                    <h3 className="text-4xl font-extrabold text-slate-800">{stats.draft}</h3>
                </div>
            </div>

            {/* Action Card: Generate AI */}
            <div onClick={() => onNavigate('planner')} className="bg-gradient-to-br from-brand-600 to-brand-500 p-6 rounded-[24px] shadow-lg shadow-brand-500/30 relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform text-white md:col-span-3 xl:col-span-1">
                 <div className="absolute -right-6 -bottom-6 opacity-20">
                     <Sparkles size={120} />
                 </div>
                 <div className="relative z-10 h-full flex flex-col justify-between">
                     <div>
                        <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4">
                            <Sparkles size={20} className="text-white" />
                        </div>
                        <h3 className="text-xl font-bold mb-1">Gerar com IA</h3>
                        <p className="text-brand-100 text-sm font-medium">Crie um mês de conteúdo em segundos.</p>
                     </div>
                     <div className="flex items-center gap-2 text-sm font-bold bg-white/20 w-fit px-3 py-1.5 rounded-lg backdrop-blur-md mt-4">
                         Começar <ArrowRight size={14} />
                     </div>
                 </div>
            </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1">
            {/* Left Column: Upcoming Posts */}
            <div className="xl:col-span-2 bg-white rounded-[32px] shadow-card border border-slate-100 p-8 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-800">Próximos Posts</h3>
                    <button onClick={() => onNavigate('scheduler')} className="text-sm font-bold text-brand-600 hover:bg-brand-50 px-3 py-1 rounded-lg transition-colors">Ver Calendário</button>
                </div>

                <div className="flex-1 space-y-4">
                    {upcomingPosts.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 py-10 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                            <CalendarDays size={48} className="mb-4 opacity-20" />
                            <p className="font-medium">Nenhum post agendado para breve.</p>
                            <button onClick={() => onNavigate('studio')} className="mt-4 text-sm font-bold text-slate-600 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm hover:border-brand-300">Agendar Post</button>
                        </div>
                    ) : (
                        upcomingPosts.map((post) => {
                            const client = clients.find(c => c.id === post.clientId);
                            return (
                                <div key={post.id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group cursor-pointer" onClick={() => onNavigate('scheduler')}>
                                    <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-100 shadow-sm">
                                        {post.image ? (
                                            <img src={post.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300"><LayoutGrid size={20} /></div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <img src={client?.logo} className="w-5 h-5 rounded-full object-cover" />
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{client?.name}</span>
                                        </div>
                                        <h4 className="font-bold text-slate-800 truncate">{post.title}</h4>
                                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                            <Clock size={12} /> {new Date(post.scheduledDate).toLocaleString('pt-BR', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-300 group-hover:border-brand-500 group-hover:text-brand-500 transition-colors">
                                        <ArrowRight size={16} />
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>

            {/* Right Column: Quick Actions & Mini Stats */}
            <div className="space-y-6">
                 {/* Quick Actions */}
                 <div className="bg-white rounded-[32px] shadow-card border border-slate-100 p-8">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Acesso Rápido</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {quickActions.map(action => (
                            <button 
                                key={action.id}
                                onClick={() => onNavigate(action.id)}
                                className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-300 ${action.color} ${action.hover} hover:-translate-y-1 hover:shadow-lg`}
                            >
                                <action.icon size={24} className="mb-2" />
                                <span className="font-bold text-sm">{action.label}</span>
                            </button>
                        ))}
                    </div>
                 </div>

                 {/* Mini Insight */}
                 <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <BarChart3 size={100} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4 text-brand-400">
                            <TrendingUp size={20} />
                            <span className="font-bold text-sm uppercase tracking-wider">Performance</span>
                        </div>
                        <p className="text-3xl font-bold mb-1">8.4%</p>
                        <p className="text-slate-400 text-sm mb-6">Crescimento médio de engajamento esta semana.</p>
                        <button onClick={() => onNavigate('analytics')} className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-sm transition-colors backdrop-blur-sm border border-white/10">
                            Ver Relatórios
                        </button>
                    </div>
                 </div>
            </div>
        </div>
    </div>
  );
};

export default Dashboard;
