import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, ArrowRight, CheckCircle2 } from 'lucide-react';

const ContactPage: React.FC = () => {
    const navigate = useNavigate();
    const [formState, setFormState] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate form submission
        setTimeout(() => {
            setIsSubmitted(true);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-brand-100 selection:text-brand-900">
            {/* Navbar */}
            <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                            <img src="/logo.png" alt="Done Flow" className="h-10" />
                        </div>
                        <div className="hidden md:flex items-center gap-8">
                            <button onClick={() => navigate('/')} className="text-slate-600 hover:text-brand-600 font-medium transition-colors text-sm">Voltar para Home</button>
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
                    <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-brand-400/10 rounded-full blur-[120px] animate-pulse-slow" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-[120px] animate-pulse-slow delay-1000" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid md:grid-cols-2 gap-16 items-start">
                        {/* Contact Info */}
                        <div className="animate-slide-up">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-8">
                                <span className="flex h-2 w-2 rounded-full bg-brand-500 animate-pulse"></span>
                                <span className="text-sm font-medium text-slate-600">Estamos online</span>
                            </div>

                            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
                                Vamos conversar sobre o seu <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-blue-600">crescimento?</span>
                            </h1>

                            <p className="text-xl text-slate-600 mb-12 leading-relaxed">
                                Tem alguma dúvida sobre o Done Flow? Nossa equipe está pronta para te ajudar a escalar sua agência.
                            </p>

                            <div className="space-y-8">
                                <div className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 shrink-0">
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 mb-1">WhatsApp / Telefone</h3>
                                        <p className="text-slate-500 mb-2">Atendimento rápido em horário comercial.</p>
                                        <a href="https://wa.me/5521967672937" target="_blank" rel="noopener noreferrer" className="text-lg font-bold text-brand-600 hover:text-brand-700 transition-colors">
                                            +55 21 96767-2937
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 mb-1">Email</h3>
                                        <p className="text-slate-500 mb-2">Para dúvidas técnicas ou parcerias.</p>
                                        <a href="mailto:contato@doneflow.com" className="text-lg font-bold text-brand-600 hover:text-brand-700 transition-colors">
                                            contato@doneflow.com
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-slate-100 animate-slide-up delay-200 relative overflow-hidden">
                            {isSubmitted ? (
                                <div className="absolute inset-0 bg-white flex flex-col items-center justify-center text-center p-8 animate-fade-in">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
                                        <CheckCircle2 size={40} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Mensagem Enviada!</h3>
                                    <p className="text-slate-600 mb-8">Obrigado pelo contato. Nossa equipe responderá em breve.</p>
                                    <button
                                        onClick={() => setIsSubmitted(false)}
                                        className="px-8 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
                                    >
                                        Enviar outra mensagem
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">Nome Completo</label>
                                        <input
                                            type="text"
                                            id="name"
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all bg-slate-50 focus:bg-white"
                                            placeholder="Seu nome"
                                            value={formState.name}
                                            onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">Email Profissional</label>
                                        <input
                                            type="email"
                                            id="email"
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all bg-slate-50 focus:bg-white"
                                            placeholder="seu@email.com"
                                            value={formState.email}
                                            onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-2">Assunto</label>
                                        <select
                                            id="subject"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all bg-slate-50 focus:bg-white"
                                            value={formState.subject}
                                            onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                                        >
                                            <option value="">Selecione um assunto</option>
                                            <option value="sales">Falar com Vendas</option>
                                            <option value="support">Suporte Técnico</option>
                                            <option value="partnership">Parcerias</option>
                                            <option value="other">Outro</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">Mensagem</label>
                                        <textarea
                                            id="message"
                                            required
                                            rows={4}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all bg-slate-50 focus:bg-white resize-none"
                                            placeholder="Como podemos ajudar?"
                                            value={formState.message}
                                            onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                                        ></textarea>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full py-4 bg-brand-600 text-white rounded-xl font-bold text-lg hover:bg-brand-700 transition-all hover:shadow-lg hover:shadow-brand-500/20 flex items-center justify-center gap-2 group"
                                    >
                                        Enviar Mensagem
                                        <Send size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-slate-400 text-sm">
                        © 2024 Done Flow Tecnologia. Todos os direitos reservados.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default ContactPage;
