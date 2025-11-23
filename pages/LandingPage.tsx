import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Check, Zap, BarChart3, Users, Calendar, Instagram, Linkedin, Facebook,
    Star, ArrowRight, Play, Sparkles, LayoutDashboard, LineChart, Phone
} from 'lucide-react';
import MockDashboard from '../components/MockDashboard';
import MockScheduler from '../components/MockScheduler';
import MockAnalytics from '../components/MockAnalytics';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [activePreview, setActivePreview] = useState<'dashboard' | 'scheduler' | 'analytics'>('dashboard');

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden selection:bg-brand-100 selection:text-brand-900">
            {/* Navbar */}
            <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
                            <img src="/logo.png" alt="Done Flow" className="h-10" />
                        </div>
                        <div className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-slate-600 hover:text-brand-600 font-medium transition-colors text-sm">Funcionalidades</a>
                            <a href="#testimonials" className="text-slate-600 hover:text-brand-600 font-medium transition-colors text-sm">Depoimentos</a>
                            <a href="#pricing" className="text-slate-600 hover:text-brand-600 font-medium transition-colors text-sm">Preços</a>
                            <button onClick={() => navigate('/contact')} className="text-slate-600 hover:text-brand-600 font-medium transition-colors text-sm">Contato</button>
                            <div className="h-6 w-px bg-slate-200"></div>
                            <button onClick={() => window.location.href = 'https://done-flow-852926998704.us-west1.run.app/'} className="text-slate-700 font-semibold hover:text-brand-600 transition-colors">Entrar</button>
                            <button onClick={() => window.location.href = 'https://done-flow-852926998704.us-west1.run.app/'} className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-full font-bold transition-all hover:shadow-lg hover:shadow-brand-500/30 hover:-translate-y-0.5 active:translate-y-0">
                                Começar Grátis
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 md:pt-48 md:pb-32 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                    <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-brand-400/20 rounded-full blur-[120px] animate-pulse-slow" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 rounded-full blur-[120px] animate-pulse-slow delay-1000" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-8 animate-fade-in">
                        <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-sm font-medium text-slate-600">Novidade: Agendamento com IA 2.0</span>
                        <ArrowRight size={14} className="text-slate-400" />
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-tight animate-slide-up">
                        Gerencie suas redes sociais <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-blue-600">sem perder a sanidade.</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed animate-slide-up delay-100">
                        A plataforma tudo-em-um para agências e freelancers. Agende posts, aprove com clientes e gere relatórios em segundos.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 animate-slide-up delay-200">
                        <button onClick={() => window.location.href = 'https://done-flow-852926998704.us-west1.run.app/'} className="w-full sm:w-auto px-8 py-4 bg-brand-600 text-white rounded-full font-bold text-lg hover:bg-brand-700 transition-all hover:scale-105 shadow-xl shadow-brand-500/20 flex items-center justify-center gap-2">
                            <Zap size={20} fill="currentColor" />
                            Testar Grátis Agora
                        </button>
                        <button onClick={() => setIsVideoModalOpen(true)} className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-full font-bold text-lg hover:bg-slate-50 transition-all hover:border-slate-300 flex items-center justify-center gap-2 group">
                            <Play size={20} className="fill-slate-900 group-hover:scale-110 transition-transform" />
                            Ver Demo
                        </button>
                    </div>

                    {/* Feature Switcher & Preview */}
                    <div className="relative mx-auto max-w-6xl animate-slide-up delay-300">
                        {/* Tabs */}
                        <div className="flex justify-center mb-8">
                            <div className="inline-flex bg-white/50 backdrop-blur-sm p-1.5 rounded-2xl border border-slate-200/60 shadow-sm">
                                <button
                                    onClick={() => setActivePreview('dashboard')}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activePreview === 'dashboard' ? 'bg-white text-brand-600 shadow-md transform scale-105' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
                                >
                                    <LayoutDashboard size={18} />
                                    Dashboard
                                </button>
                                <button
                                    onClick={() => setActivePreview('scheduler')}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activePreview === 'scheduler' ? 'bg-white text-brand-600 shadow-md transform scale-105' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
                                >
                                    <Calendar size={18} />
                                    Agendamento
                                </button>
                                <button
                                    onClick={() => setActivePreview('analytics')}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activePreview === 'analytics' ? 'bg-white text-brand-600 shadow-md transform scale-105' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
                                >
                                    <LineChart size={18} />
                                    Analytics
                                </button>
                            </div>
                        </div>

                        {/* Preview Container */}
                        <div className="relative rounded-[2.5rem] bg-slate-900 p-2 md:p-4 shadow-2xl shadow-brand-900/20 border border-slate-800/50">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-1.5 bg-slate-800 rounded-b-xl z-20"></div>
                            <div className="relative rounded-[2rem] overflow-hidden bg-slate-50 aspect-[16/10] md:aspect-[16/9]">
                                <div className="absolute inset-0 bg-slate-50 overflow-hidden">
                                    {/* Conditional Rendering of Mock Components */}
                                    <div className={`absolute inset-0 transition-opacity duration-500 ${activePreview === 'dashboard' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                                        <div className="w-[125%] h-[125%] origin-top-left transform scale-[0.8]">
                                            <MockDashboard />
                                        </div>
                                    </div>
                                    <div className={`absolute inset-0 transition-opacity duration-500 ${activePreview === 'scheduler' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                                        <div className="w-[125%] h-[125%] origin-top-left transform scale-[0.8]">
                                            <MockScheduler />
                                        </div>
                                    </div>
                                    <div className={`absolute inset-0 transition-opacity duration-500 ${activePreview === 'analytics' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                                        <div className="w-[125%] h-[125%] origin-top-left transform scale-[0.8]">
                                            <MockAnalytics />
                                        </div>
                                    </div>
                                </div>

                                {/* Overlay Gradient for Depth */}
                                <div className="absolute inset-0 pointer-events-none shadow-inner rounded-[2rem] ring-1 ring-black/5"></div>
                            </div>
                        </div>

                        {/* Decorative Elements around Preview */}
                        <div className="absolute -right-6 lg:-right-12 top-1/4 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 animate-float hidden md:block z-30">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                    <Check size={20} />
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500">Status</div>
                                    <div className="font-bold text-slate-900">Aprovado pelo Cliente</div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -left-6 lg:-left-12 bottom-1/4 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 animate-float delay-700 hidden md:block z-30">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-600">
                                    <Sparkles size={20} />
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500">IA Generativa</div>
                                    <div className="font-bold text-slate-900">Legenda Criada!</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-32 bg-slate-50 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">Tudo o que você precisa para escalar.</h2>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto">Uma suíte completa de ferramentas desenhada para agências e freelancers de alta performance.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: Calendar, title: 'Agendamento Inteligente', desc: 'Planeje posts para Instagram, LinkedIn e TikTok com visualização de calendário drag-and-drop.' },
                            { icon: Users, title: 'Workflow de Aprovação', desc: 'Envie links mágicos para clientes aprovarem conteúdo sem precisar de login. Adeus WhatsApp.' },
                            { icon: Zap, title: 'Criação com IA', desc: 'Gere legendas, ideias de posts e roteiros de Reels em segundos com nossa IA integrada.' },
                            { icon: BarChart3, title: 'Relatórios Automatizados', desc: 'Prove seu ROI com relatórios PDF bonitos que são gerados e enviados automaticamente.' },
                            { icon: Instagram, title: 'Gestão Multi-conta', desc: 'Alterne entre clientes e marcas com um clique. Sem limites de perfis conectados.' },
                            { icon: Users, title: 'Colaboração em Time', desc: 'Defina funções, atribua tarefas e converse com seu time dentro de cada post.' },
                        ].map((feature, i) => (
                            <div key={i} className="p-8 rounded-3xl bg-white border border-slate-100 hover:border-brand-200 hover:shadow-2xl hover:shadow-brand-500/10 transition-all group hover:-translate-y-1">
                                <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 mb-6 group-hover:scale-110 group-hover:bg-brand-600 group-hover:text-white transition-all duration-300">
                                    <feature.icon size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section id="testimonials" className="py-32 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">O que dizem sobre nós</h2>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto">Junte-se a milhares de profissionais que transformaram sua gestão.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { name: "Ana Silva", role: "Social Media Manager", text: "O Done Flow salvou minha vida. Antes eu perdia horas em planilhas, agora tudo flui.", avatar: "https://i.pravatar.cc/150?img=5" },
                            { name: "Carlos Mendes", role: "Dono de Agência", text: "A funcionalidade de aprovação com o cliente é sensacional. Reduziu nosso tempo de refação em 50%.", avatar: "https://i.pravatar.cc/150?img=12" },
                            { name: "Beatriz Costa", role: "Freelancer", text: "Melhor custo benefício do mercado. A IA ajuda muito naqueles dias sem criatividade.", avatar: "https://i.pravatar.cc/150?img=9" }
                        ].map((t, i) => (
                            <div key={i} className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                                <div className="flex gap-1 text-yellow-400 mb-4">
                                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={16} fill="currentColor" />)}
                                </div>
                                <p className="text-slate-700 mb-6 text-lg italic">"{t.text}"</p>
                                <div className="flex items-center gap-4">
                                    <img
                                        src={t.avatar}
                                        alt={t.name}
                                        className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-200"
                                    />
                                    <div>
                                        <div className="font-bold text-slate-900">{t.name}</div>
                                        <div className="text-sm text-slate-500">{t.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing" className="py-32 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">Preços simples, sem surpresas.</h2>
                        <p className="text-xl text-slate-600">Escolha o plano ideal para o seu momento.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                        {/* Teste Grátis */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col">
                            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 mb-6">
                                <Sparkles size={24} />
                            </div>
                            <div className="text-lg font-bold text-slate-900 mb-2">Teste Grátis</div>
                            <div className="text-4xl font-bold text-slate-900 mb-2">R$ 0,00<span className="text-sm text-slate-400 font-normal">/7 dias</span></div>
                            <p className="text-slate-400 text-sm mb-6">Para conhecer a plataforma</p>

                            <ul className="space-y-3 mb-8 flex-1">
                                <li className="flex items-center gap-2 text-sm text-slate-600"><Check size={16} className="text-green-500 shrink-0" /> 1 Cliente</li>
                                <li className="flex items-center gap-2 text-sm text-slate-600"><Check size={16} className="text-green-500 shrink-0" /> Agendamento Limitado</li>
                                <li className="flex items-center gap-2 text-sm text-slate-600"><Check size={16} className="text-green-500 shrink-0" /> Relatórios Básicos</li>
                                <li className="flex items-center gap-2 text-sm text-slate-600"><Check size={16} className="text-green-500 shrink-0" /> Sem cartão necessário</li>
                            </ul>
                            <button onClick={() => window.location.href = 'https://done-flow-852926998704.us-west1.run.app/'} className="w-full py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-500/20">Começar Grátis</button>
                        </div>

                        {/* Starter */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col">
                            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600 mb-6">
                                <Star size={24} />
                            </div>
                            <div className="text-lg font-bold text-slate-900 mb-2">Starter</div>
                            <div className="text-4xl font-bold text-slate-900 mb-2">R$ 49,90<span className="text-sm text-slate-400 font-normal">/mês</span></div>
                            <p className="text-slate-400 text-sm mb-6">Para quem está começando</p>

                            <ul className="space-y-3 mb-8 flex-1">
                                <li className="flex items-center gap-2 text-sm text-slate-600"><Check size={16} className="text-green-500 shrink-0" /> Até 3 Clientes</li>
                                <li className="flex items-center gap-2 text-sm text-slate-600"><Check size={16} className="text-green-500 shrink-0" /> 1 Usuário</li>
                                <li className="flex items-center gap-2 text-sm text-slate-600"><Check size={16} className="text-green-500 shrink-0" /> Agendamento Básico</li>
                                <li className="flex items-center gap-2 text-sm text-slate-600"><Check size={16} className="text-green-500 shrink-0" /> Relatórios Simples</li>
                            </ul>
                            <button onClick={() => window.location.href = 'https://done-flow-852926998704.us-west1.run.app/'} className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20">Assinar Agora</button>
                        </div>

                        {/* Pro */}
                        <div className="bg-white rounded-3xl p-6 border-2 border-brand-500 shadow-xl relative flex flex-col transform md:-translate-y-4 z-10">
                            <div className="absolute top-0 right-0 bg-brand-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">Mais Popular</div>
                            <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600 mb-6">
                                <Zap size={24} fill="currentColor" />
                            </div>
                            <div className="text-lg font-bold text-slate-900 mb-2">Pro</div>
                            <div className="text-4xl font-bold text-slate-900 mb-2">R$ 149,90<span className="text-sm text-slate-400 font-normal">/mês</span></div>
                            <p className="text-slate-400 text-sm mb-6">Para agências em crescimento</p>

                            <ul className="space-y-3 mb-8 flex-1">
                                <li className="flex items-center gap-2 text-sm text-slate-600"><Check size={16} className="text-green-500 shrink-0" /> Até 10 Clientes</li>
                                <li className="flex items-center gap-2 text-sm text-slate-600"><Check size={16} className="text-green-500 shrink-0" /> 3 Usuários</li>
                                <li className="flex items-center gap-2 text-sm text-slate-600"><Check size={16} className="text-green-500 shrink-0" /> IA Geradora de Texto</li>
                                <li className="flex items-center gap-2 text-sm text-slate-600"><Check size={16} className="text-green-500 shrink-0" /> IA Geradora de Imagem</li>
                                <li className="flex items-center gap-2 text-sm text-slate-600"><Check size={16} className="text-green-500 shrink-0" /> Relatórios Avançados</li>
                            </ul>
                            <button onClick={() => window.location.href = 'https://done-flow-852926998704.us-west1.run.app/'} className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30">Assinar Agora</button>
                        </div>

                        {/* Agency */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col">
                            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-6">
                                <Users size={24} />
                            </div>
                            <div className="text-lg font-bold text-slate-900 mb-2">Agency</div>
                            <div className="text-4xl font-bold text-slate-900 mb-2">R$ 497<span className="text-sm text-slate-400 font-normal">/mês</span></div>
                            <p className="text-slate-400 text-sm mb-6">Para grandes operações</p>

                            <ul className="space-y-3 mb-8 flex-1">
                                <li className="flex items-center gap-2 text-sm text-slate-600"><Check size={16} className="text-green-500 shrink-0" /> Clientes Ilimitados</li>
                                <li className="flex items-center gap-2 text-sm text-slate-600"><Check size={16} className="text-green-500 shrink-0" /> Usuários Ilimitados</li>
                                <li className="flex items-center gap-2 text-sm text-slate-600"><Check size={16} className="text-green-500 shrink-0" /> IA Ilimitada</li>
                                <li className="flex items-center gap-2 text-sm text-slate-600"><Check size={16} className="text-green-500 shrink-0" /> Whitelabel</li>
                                <li className="flex items-center gap-2 text-sm text-slate-600"><Check size={16} className="text-green-500 shrink-0" /> Suporte Prioritário</li>
                                <li className="flex items-center gap-2 text-sm text-slate-600"><Check size={16} className="text-green-500 shrink-0" /> API Access</li>
                            </ul>
                            <button onClick={() => window.location.href = 'https://done-flow-852926998704.us-west1.run.app/'} className="w-full py-3 rounded-xl bg-slate-100 text-slate-900 font-bold hover:bg-slate-200 transition-all">Assinar Agora</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="py-24 bg-slate-900 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                    <div className="absolute top-[-50%] left-[-20%] w-[80%] h-[80%] bg-brand-600/20 rounded-full blur-[100px]" />
                    <div className="absolute bottom-[-50%] right-[-20%] w-[80%] h-[80%] bg-blue-600/20 rounded-full blur-[100px]" />
                </div>
                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">Pronto para transformar sua agência?</h2>
                    <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">Comece hoje mesmo. Sem cartão de crédito necessário.</p>
                    <button onClick={() => window.location.href = 'https://done-flow-852926998704.us-west1.run.app/'} className="px-10 py-5 bg-white text-slate-900 rounded-full font-bold text-xl hover:bg-brand-50 transition-all hover:scale-105 shadow-2xl shadow-white/10">
                        Criar Conta Grátis
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center gap-2 mb-6">
                                <img src="/logo.png" alt="Done Flow" className="h-8" />
                            </div>
                            <p className="text-slate-500 max-w-xs">A plataforma definitiva para gestão de mídias sociais. Simples, poderosa e inteligente.</p>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 mb-4">Produto</h4>
                            <ul className="space-y-2 text-slate-500">
                                <li><a href="#" className="hover:text-brand-600">Funcionalidades</a></li>
                                <li><a href="#" className="hover:text-brand-600">Preços</a></li>
                                <li><a href="#" className="hover:text-brand-600">Integrações</a></li>
                                <li><a href="#" className="hover:text-brand-600">Changelog</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 mb-4">Empresa</h4>
                            <ul className="space-y-2 text-slate-500">
                                <li><a href="#" className="hover:text-brand-600">Sobre</a></li>
                                <li><a href="#" className="hover:text-brand-600">Blog</a></li>
                                <li><a href="#" className="hover:text-brand-600">Carreiras</a></li>
                                <li><button onClick={() => navigate('/contact')} className="hover:text-brand-600">Contato</button></li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-slate-400 text-sm flex flex-col md:flex-row gap-4 items-center">
                            <span>© 2024 Done Flow Tecnologia. Todos os direitos reservados.</span>
                            <span className="hidden md:inline text-slate-300">|</span>
                            <a href="https://wa.me/5521967672937" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-500 hover:text-green-600 transition-colors font-medium">
                                <Phone size={16} />
                                +55 21 96767-2937
                            </a>
                        </div>
                        <div className="flex gap-6">
                            <a href="#" className="text-slate-400 hover:text-brand-600 transition-colors"><Instagram size={20} /></a>
                            <a href="#" className="text-slate-400 hover:text-brand-600 transition-colors"><Linkedin size={20} /></a>
                            <a href="#" className="text-slate-400 hover:text-brand-600 transition-colors"><Facebook size={20} /></a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
