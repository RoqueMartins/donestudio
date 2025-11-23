
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, CalendarDays, BarChart3, MessageCircle, Users, Settings, Briefcase, X, Wand2, Shield, Download, Share, Palette } from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (isOpen: boolean) => void;
  user: User;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, isMobileOpen = false, setIsMobileOpen, user }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);

  useEffect(() => {
    const checkIsIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(checkIsIOS);
    const checkStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    setIsStandalone(checkStandalone);

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIosHelp(true);
      return;
    }
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'clients', label: 'Carteira (Clientes)', icon: Briefcase },
    { id: 'studio', label: 'Estúdio Criativo', icon: Palette },
    { id: 'planner', label: 'Planejador IA', icon: Wand2 },
    { id: 'scheduler', label: 'Agenda & Feed', icon: CalendarDays },
    { id: 'workflow', label: 'Workflow', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'inbox', label: 'SAC 2.0', icon: MessageCircle },
  ];

  const sidebarClasses = `
    w-72 h-[96vh] flex flex-col 
    fixed left-3 top-[2vh] z-30 transition-transform duration-300 ease-out rounded-[24px]
    bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl shadow-slate-200/50
    ${isMobileOpen ? 'translate-x-0' : '-translate-x-[120%] md:translate-x-0'}
  `;

  return (
    <>
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 z-20 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
        />
      )}

      {showIosHelp && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in"
          onClick={() => setShowIosHelp(false)}
        >
          <div className="bg-white rounded-3xl p-8 max-w-xs text-center relative shadow-2xl" onClick={(e) => e.stopPropagation()}>
             <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Share size={32} />
             </div>
             <h3 className="text-xl font-bold text-slate-800 mb-2">Instalar no iOS</h3>
             <p className="text-sm text-slate-500 mb-6 leading-relaxed font-medium">
                Adicione à tela de início para a melhor experiência:
             </p>
             <ol className="text-left text-sm text-slate-600 space-y-3 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <li className="flex gap-3 items-start">
                   <span className="bg-white shadow-sm text-slate-800 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 border border-slate-200">1</span>
                   <span>Toque em <strong>Compartilhar</strong> <Share size={12} className="inline"/></span>
                </li>
                <li className="flex gap-3 items-start">
                   <span className="bg-white shadow-sm text-slate-800 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 border border-slate-200">2</span>
                   <span>Selecione <strong>Adicionar à Tela de Início</strong>.</span>
                </li>
             </ol>
             <button 
               onClick={() => setShowIosHelp(false)}
               className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-brand-500/20 hover:bg-brand-700 transition-colors"
             >
               Entendi
             </button>
          </div>
        </div>
      )}

      <div className={sidebarClasses}>
        <div className="p-6 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-3 select-none cursor-pointer group px-2" onClick={() => setCurrentView('dashboard')}>
            {/* Logo Updated: Text Only, Flow thinner */}
            <div className="flex flex-col leading-none">
               <span className="text-3xl font-extrabold text-slate-900 tracking-tighter">
                 done<span className="font-light text-brand-600 ml-0.5">flow</span>
               </span>
            </div>
          </div>
          <button 
            className="md:hidden text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-colors"
            onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-8 mt-6 mb-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Menu</p>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar py-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group relative ${
                  isActive 
                    ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10 font-semibold scale-[1.02]' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium'
                }`}
              >
                <Icon size={18} className={`transition-colors ${isActive ? 'text-brand-400' : 'text-slate-400 group-hover:text-slate-600'}`} strokeWidth={isActive ? 2.5 : 2} />
                <span className="relative z-10 tracking-wide text-sm">{item.label}</span>
                {isActive && (
                    <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-brand-500 shadow-[0_0_10px_rgba(249,115,22,0.8)] animate-pulse"></div>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 mt-auto space-y-2">
          {!isStandalone && (deferredPrompt || isIOS) && (
            <button
              onClick={handleInstallClick}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-50 text-brand-700 text-xs font-bold border border-brand-100 hover:bg-brand-100 transition-all hover:-translate-y-0.5"
            >
              <Download size={16} /> Instalar App
            </button>
          )}

          {user.isAdmin && (
            <button 
              onClick={() => setCurrentView('admin')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors text-sm font-medium border border-transparent ${
                  currentView === 'admin' 
                  ? 'bg-red-50 text-red-600 font-bold border-red-100' 
                  : 'text-slate-500 hover:bg-red-50 hover:text-red-600'
              }`}
            >
              <Shield size={18} className={currentView === 'admin' ? 'text-red-600' : 'text-slate-400'} />
              Admin
            </button>
          )}

          <div className="bg-slate-50 p-2 rounded-[20px] border border-slate-100">
             <button 
                onClick={() => setCurrentView('settings')}
                className={`w-full flex items-center gap-3 p-2 rounded-2xl transition-all hover:bg-white hover:shadow-sm group text-left ${currentView === 'settings' ? 'bg-white shadow-sm' : ''}`}
             >
                <div className="relative shrink-0">
                  <img 
                    src={user.avatar} 
                    alt="User" 
                    className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover" 
                  />
                  <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${user.subscriptionStatus === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs font-bold text-slate-800 truncate group-hover:text-brand-700 transition-colors">{user.name}</p>
                  <p className="text-[10px] text-slate-500 truncate font-medium flex items-center gap-1">
                      {user.plan} Plan
                  </p>
                </div>
                <div className="p-1.5 bg-white rounded-full text-slate-300 group-hover:text-brand-600 transition-colors shadow-sm">
                   <Settings size={14} />
                </div>
             </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
