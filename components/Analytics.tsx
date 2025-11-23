
import React, { useEffect, useState, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Brain, TrendingUp, Users, Eye, Briefcase, RefreshCw, Sparkles, LayoutGrid } from 'lucide-react';
import { ChartDataPoint, Client } from '../types';
import { analyzeInsights, analyzeCompetitorInsights } from '../services/geminiService';

interface AnalyticsProps {
  clients: Client[];
}

const baseMockData: ChartDataPoint[] = [
  { name: 'Seg', followers: 4000, engagement: 2400, reach: 2400 },
  { name: 'Ter', followers: 3000, engagement: 1398, reach: 2210 },
  { name: 'Qua', followers: 2000, engagement: 9800, reach: 2290 },
  { name: 'Qui', followers: 2780, engagement: 3908, reach: 2000 },
  { name: 'Sex', followers: 1890, engagement: 4800, reach: 2181 },
  { name: 'Sáb', followers: 2390, engagement: 3800, reach: 2500 },
  { name: 'Dom', followers: 3490, engagement: 4300, reach: 2100 },
];

const Analytics: React.FC<AnalyticsProps> = ({ clients }) => {
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [insight, setInsight] = useState<string>('Carregando análise inteligente...');
  const [loading, setLoading] = useState(true);
  
  // Competitor Analysis State
  const [competitorInsight, setCompetitorInsight] = useState<string>('');
  const [loadingCompetitor, setLoadingCompetitor] = useState(false);
  
  const displayData = useMemo(() => {
    if (!selectedClientId) return baseMockData;
    // Simulate different data for a specific client
    return baseMockData.map(d => ({
      ...d,
      followers: Math.floor(d.followers * 0.6),
      engagement: Math.floor(d.engagement * (Math.random() * 0.5 + 0.5)),
      reach: Math.floor(d.reach * 0.7)
    }));
  }, [selectedClientId]);

  // Dynamic Competitor Data based on selection
  const competitorData = useMemo(() => {
    const client = clients.find(c => c.id === selectedClientId);
    const clientName = client ? client.name : 'Sua Agência';
    
    if (!selectedClientId) {
       return [
        { name: 'Sua Agência', value: 85, fill: '#0ea5e9' },
        { name: 'Concorrente A', value: 65, fill: '#94a3b8' },
        { name: 'Concorrente B', value: 45, fill: '#cbd5e1' },
      ];
    }

    // Simulate different market positions based on client ID
    // Client 1: Leader, Client 2: Struggling, etc.
    const seed = selectedClientId.charCodeAt(0);
    const myValue = 40 + (seed % 50); // Randomish value between 40 and 90
    const compA = 30 + (seed % 30);
    const compB = 100 - myValue - compA > 0 ? 100 - myValue - compA : 10;

    return [
        { name: clientName, value: myValue, fill: '#0ea5e9' },
        { name: 'Concorrente A', value: compA, fill: '#94a3b8' },
        { name: 'Concorrente B', value: compB, fill: '#cbd5e1' },
    ];
  }, [selectedClientId, clients]);

  // Fetch General Insights
  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      const clientName = clients.find(c => c.id === selectedClientId)?.name || "Todos os Clientes";
      
      // Summarize data for AI with context
      const dataSummary = `Análise para ${clientName}: Pico de engajamento na Quarta-feira. Queda de seguidores na Sexta. Alcance médio de 2200.`;
      
      const result = await analyzeInsights(dataSummary);
      setInsight(result);
      setLoading(false);
    };
    fetchInsights();
  }, [selectedClientId, clients]);

  // Handler for Competitor Analysis
  const handleCompetitorAnalysis = async () => {
    setLoadingCompetitor(true);
    const result = await analyzeCompetitorInsights(competitorData);
    setCompetitorInsight(result);
    setLoadingCompetitor(false);
  };

  // Auto-fetch competitor insights when data changes (client switch)
  useEffect(() => {
    handleCompetitorAnalysis();
  }, [competitorData]);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 overflow-y-auto h-full custom-scrollbar animate-fade-in">
      <div className="flex flex-col lg:flex-row justify-between items-end gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Performance</h2>
          <p className="text-slate-500 font-medium mt-1">Análise detalhada das métricas e concorrência.</p>
        </div>
        <div className="flex gap-3 items-center flex-wrap">
           {/* Client Filter (Visual + Dropdown) */}
           <div className="flex items-center gap-3 bg-white p-2 border border-slate-200 rounded-2xl shadow-sm overflow-x-auto max-w-full">
             {/* Visual Filter */}
             <div className="flex items-center px-1 gap-2">
               <button
                 onClick={() => setSelectedClientId('')}
                 className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-200 relative group shrink-0 ${
                   selectedClientId === '' 
                     ? 'border-brand-600 bg-brand-50 text-brand-600 z-10 scale-110 shadow-sm' 
                     : 'border-white bg-slate-100 text-slate-400 hover:bg-slate-200 hover:border-slate-200'
                 }`}
                 title="Todos"
               >
                 <LayoutGrid size={14} />
               </button>
               {clients.map(client => (
                 <button
                   key={client.id}
                   onClick={() => setSelectedClientId(client.id)}
                   className={`w-9 h-9 rounded-full border-2 overflow-hidden transition-all duration-200 relative group bg-white shrink-0 ${
                     selectedClientId === client.id
                       ? 'border-brand-600 z-10 scale-110 shadow-sm'
                       : 'border-white grayscale hover:grayscale-0 hover:z-10 hover:scale-105'
                   }`}
                   title={client.name}
                 >
                   <img src={client.logo} alt={client.name} className="w-full h-full object-cover" />
                 </button>
               ))}
             </div>

             <div className="h-6 w-px bg-slate-200 mx-1"></div>
            
             <div className="flex items-center gap-2 px-1">
                <Briefcase size={16} className="text-slate-400" />
                <select 
                    className="bg-transparent text-sm font-bold text-slate-600 outline-none py-1 cursor-pointer min-w-[120px]"
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                >
                <option value="">Todas as Marcas</option>
                {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                ))}
                </select>
             </div>
           </div>

           <select className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-600 outline-none shadow-sm cursor-pointer">
             <option>Últimos 7 dias</option>
             <option>Últimos 30 dias</option>
             <option>Este Mês</option>
           </select>
           <button className="bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg hover:bg-brand-600 transition-colors">Exportar PDF</button>
        </div>
      </div>

      {/* AI Insights Section */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[32px] p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Brain size={120} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm border border-white/20">
              <Brain size={24} className="text-white" />
            </div>
            <h3 className="font-bold text-xl">Done Flow AI Insights</h3>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 min-h-[100px]">
             {loading ? (
               <div className="flex items-center gap-3">
                 <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
                 <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-75"></span>
                 <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-150"></span>
               </div>
             ) : (
               <div className="text-base font-medium leading-relaxed whitespace-pre-line opacity-95">
                 {insight}
               </div>
             )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Line Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-slate-100 shadow-card">
          <h3 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-500" />
            Evolução de Engajamento {selectedClientId && `(${clients.find(c => c.id === selectedClientId)?.name})`}
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={displayData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickMargin={10} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px -5px rgba(0,0,0,0.1)', padding: '12px 16px' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Legend />
                <Line type="monotone" dataKey="engagement" name="Engajamento" stroke="#0ea5e9" strokeWidth={4} dot={{ r: 4, fill: '#0ea5e9', strokeWidth: 0 }} activeDot={{ r: 8, strokeWidth: 0 }} />
                <Line type="monotone" dataKey="reach" name="Alcance" stroke="#8b5cf6" strokeWidth={4} dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Competitor Analysis Bar Chart */}
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-card flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Eye size={20} className="text-emerald-500" />
                Share of Voice
              </h3>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wide">Concorrência</p>
            </div>
            <button 
              onClick={handleCompetitorAnalysis}
              disabled={loadingCompetitor}
              className="p-2 text-brand-600 bg-brand-50 rounded-xl hover:bg-brand-100 transition-colors disabled:opacity-50"
              title="Atualizar análise de concorrência"
            >
              {loadingCompetitor ? <RefreshCw size={18} className="animate-spin"/> : <Sparkles size={18} />}
            </button>
          </div>
          
          <div className="h-[200px] w-full flex-1 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={competitorData} layout="vertical">
                 <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                 <XAxis type="number" hide />
                 <YAxis dataKey="name" type="category" width={90} tick={{fontSize: 10, fill: '#64748b', fontWeight: 600}} tickLine={false} axisLine={false} />
                 <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }} />
                 <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-auto p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 relative">
            <span className="absolute -top-2.5 -left-1 bg-emerald-500 text-white text-[10px] px-2.5 py-1 rounded-full font-bold flex items-center gap-1 shadow-sm">
              <Sparkles size={8} /> IA Analysis
            </span>
            <div className="text-xs font-medium text-slate-700 pt-3">
              {loadingCompetitor ? (
                 <div className="flex gap-1 items-center text-slate-400">
                   <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                   <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                   <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                 </div>
              ) : (
                 <p className="leading-relaxed">{competitorInsight || "Clique no botão para gerar análise."}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-card flex items-center gap-5 hover:-translate-y-1 transition-transform">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm">
              <Users size={28} />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-800">
                {selectedClientId ? '8.2k' : '15.4k'}
              </p>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">Seguidores Totais</p>
            </div>
         </div>
         <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-card flex items-center gap-5 hover:-translate-y-1 transition-transform">
            <div className="w-14 h-14 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-600 shadow-sm">
              <TrendingUp size={28} />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-800">4.8%</p>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">Taxa de Engajamento</p>
            </div>
         </div>
         <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-card flex items-center gap-5 hover:-translate-y-1 transition-transform">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 shadow-sm">
              <Eye size={28} />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-800">
                {selectedClientId ? '450k' : '1.2M'}
              </p>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">Impressões Mensais</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Analytics;
