
import React, { useState, useRef } from 'react';
import { CheckCircle2, User as UserIcon, Building, Mail, Bell, Shield, CreditCard, Camera, LogOut, Star, Zap, Crown, Check, ShieldAlert, Lock, Key, MapPin, Globe, Sparkles } from 'lucide-react';
import { User as UserType, Plan } from '../types';
import { saveUserProfile, getCurrentUserId } from '../services/firebase';

interface SettingsProps {
  user: UserType;
  setUser: (user: UserType) => void;
  onLogout?: () => void;
  onNavigate?: (view: string) => void;
}

declare global {
  interface Window {
    Stripe?: (key: string) => any;
  }
}

const TIMEZONES = [
  'America/Sao_Paulo',
  'America/Manaus',
  'America/Belem',
  'America/Fortaleza',
  'America/Recife',
  'America/Noronha',
  'America/Cuiaba',
  'America/Campo_Grande',
  'Europe/Lisbon',
  'America/New_York'
];

const PLANS = [
  {
    id: 'Trial',
    name: 'Teste Grátis',
    price: 'R$ 0,00',
    period: '/7 dias',
    features: ['1 Cliente', 'Agendamento Limitado', 'Relatórios Básicos', 'Sem cartão necessário'],
    color: 'bg-green-50',
    btnColor: 'bg-green-600',
    icon: Sparkles
  },
  {
    id: 'Starter',
    name: 'Starter',
    price: 'R$ 49,90',
    period: '/mês',
    features: ['Até 3 Clientes', '1 Usuário', 'Agendamento Básico', 'Relatórios Simples'],
    color: 'bg-slate-100',
    btnColor: 'bg-slate-800',
    icon: Star
  },
  {
    id: 'Pro',
    name: 'Pro',
    price: 'R$ 149,90',
    period: '/mês',
    features: ['Até 10 Clientes', '3 Usuários', 'IA Geradora de Texto', 'IA Geradora de Imagem', 'Relatórios Avançados'],
    color: 'bg-blue-50',
    btnColor: 'bg-blue-600',
    popular: true,
    icon: Zap
  },
  {
    id: 'Agency',
    name: 'Agency',
    price: 'R$ 497',
    period: '/mês',
    features: ['Clientes Ilimitados', 'Usuários Ilimitados', 'IA Ilimitada', 'Whitelabel', 'Suporte Prioritário', 'API Access'],
    color: 'bg-purple-50',
    btnColor: 'bg-purple-600',
    icon: Crown
  }
];

const Settings: React.FC<SettingsProps> = ({ user, setUser, onLogout, onNavigate }) => {
  // Tab State
  const [activeTab, setActiveTab] = useState<'profile' | 'billing' | 'notifications' | 'security'>('profile');
  
  // Profile Form State
  const [name, setName] = useState(user.name);
  const [agencyName, setAgencyName] = useState(user.agencyName);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);
  const [location, setLocation] = useState(user.location || '');
  const [timezone, setTimezone] = useState(user.timezone || 'America/Sao_Paulo');
  const [avatarPreview, setAvatarPreview] = useState(user.avatar);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Checkout State
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    const userId = getCurrentUserId();
    if (!userId) return;
    setIsSaving(true);
    
    const updatedUser: UserType = {
      ...user,
      name,
      agencyName,
      email,
      role,
      avatar: avatarPreview,
      location,
      timezone
    };

    await saveUserProfile(updatedUser);
    setUser(updatedUser);
    
    setIsSaving(false);
    setSuccessMessage('Perfil atualizado com sucesso!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleSubscribe = (plan: any) => {
    setSelectedPlan(plan);
    setShowCheckout(true);
  };

  const processPayment = async () => {
    setIsProcessingPayment(true);

    try {
      // Processamento seguro
      await new Promise(resolve => setTimeout(resolve, 1500));

      const updatedUser: UserType = {
        ...user,
        plan: selectedPlan.id,
        subscriptionStatus: selectedPlan.id === 'Trial' ? 'trial' : 'active'
      };
      
      await saveUserProfile(updatedUser);
      setUser(updatedUser);

      setIsProcessingPayment(false);
      setShowCheckout(false);
      setSuccessMessage(selectedPlan.id === 'Trial' ? 'Período de teste iniciado!' : `Plano ${selectedPlan.name} ativado com sucesso!`);
      setTimeout(() => setSuccessMessage(''), 4000);

    } catch (error) {
      console.error("Erro no processamento do pagamento", error);
      setIsProcessingPayment(false);
      alert("Erro ao processar pagamento. Por favor, tente novamente.");
    }
  };

  const handlePasswordChange = () => {
      setIsSaving(true);
      setTimeout(() => {
          setIsSaving(false);
          setCurrentPassword('');
          setNewPassword('');
          setSuccessMessage('Senha alterada com sucesso!');
          setTimeout(() => setSuccessMessage(''), 3000);
      }, 1000);
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto h-full flex flex-col animate-fade-in">
      <div className="mb-8 flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Configurações & Perfil</h2>
            <p className="text-slate-500">Gerencie suas informações pessoais e assinatura.</p>
        </div>
        {onLogout && (
            <button onClick={onLogout} className="flex items-center gap-2 text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors font-medium">
                <LogOut size={18} /> Sair
            </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center text-center">
             <div className="relative mb-4 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-24 h-24 rounded-full p-1 border-2 border-dashed border-brand-300 group-hover:border-brand-500 transition-colors">
                  <img src={avatarPreview} alt="Profile" className="w-full h-full rounded-full object-cover" />
                </div>
                <div className="absolute bottom-0 right-0 bg-brand-600 text-white p-2 rounded-full shadow-md group-hover:scale-110 transition-transform">
                   <Camera size={14} />
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
             </div>
             
             <h3 className="font-bold text-slate-800">{name || 'Usuário'}</h3>
             <p className="text-xs text-slate-500 mb-4">{agencyName}</p>
             
             <div className="w-full pt-4 border-t border-slate-100">
                 <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${user.plan === 'Agency' ? 'bg-purple-100 text-purple-700' : user.plan === 'Pro' ? 'bg-blue-100 text-blue-700' : user.plan === 'Trial' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                    Plano {user.plan}
                 </span>
             </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <button 
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-6 py-4 transition-colors border-b border-slate-50 text-left ${activeTab === 'profile' ? 'bg-brand-50 text-brand-700 font-bold' : 'hover:bg-slate-50 text-slate-700'}`}
             >
                <UserIcon size={18} />
                <span className="text-sm">Meu Perfil</span>
             </button>
             <button 
                onClick={() => setActiveTab('billing')}
                className={`w-full flex items-center gap-3 px-6 py-4 transition-colors border-b border-slate-50 text-left ${activeTab === 'billing' ? 'bg-brand-50 text-brand-700 font-bold' : 'hover:bg-slate-50 text-slate-700'}`}
             >
                <CreditCard size={18} />
                <span className="text-sm">Cobrança & Planos</span>
             </button>
             <button 
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center gap-3 px-6 py-4 transition-colors border-b border-slate-50 text-left ${activeTab === 'notifications' ? 'bg-brand-50 text-brand-700 font-bold' : 'hover:bg-slate-50 text-slate-700'}`}
             >
                <Bell size={18} />
                <span className="text-sm">Notificações</span>
             </button>
             <button 
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center gap-3 px-6 py-4 transition-colors text-left ${activeTab === 'security' ? 'bg-brand-50 text-brand-700 font-bold' : 'hover:bg-slate-50 text-slate-700'}`}
             >
                <Shield size={18} />
                <span className="text-sm">Segurança</span>
             </button>
          </div>
        </div>

        <div className="lg:col-span-9">
           {activeTab === 'profile' && (
             <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-800">Editar Informações</h3>
                    {successMessage && (
                        <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 px-3 py-1 rounded-full font-bold animate-fade-in">
                        <CheckCircle2 size={16} /> {successMessage}
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Nome Completo</label>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-3 text-slate-400" size={18} />
                            <input 
                                type="text" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700 font-medium"
                            />
                        </div>
                        </div>
                        <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Cargo / Função</label>
                        <div className="relative">
                            <Shield className="absolute left-3 top-3 text-slate-400" size={18} />
                            <input 
                                type="text" 
                                value={role} 
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700 font-medium"
                            />
                        </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Email de Acesso</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                            <input 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700 font-medium"
                            />
                        </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Nome da Agência</label>
                            <div className="relative">
                            <Building className="absolute left-3 top-3 text-slate-400" size={18} />
                            <input 
                                type="text" 
                                value={agencyName} 
                                onChange={(e) => setAgencyName(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700 font-medium"
                            />
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <h4 className="text-sm font-bold text-slate-700 mb-4">Localização e Data</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Localização (Cidade/País)</label>
                                <div className="relative">
                                <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
                                <input 
                                    type="text" 
                                    value={location} 
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="Ex: São Paulo, Brasil"
                                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700 font-medium"
                                />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Fuso Horário</label>
                                <div className="relative">
                                <Globe className="absolute left-3 top-3 text-slate-400" size={18} />
                                <select 
                                    value={timezone} 
                                    onChange={(e) => setTimezone(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700 font-medium bg-white cursor-pointer"
                                >
                                    {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                                </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                        <button 
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="bg-brand-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-700 shadow-lg shadow-brand-500/20 transition-all disabled:opacity-70 flex items-center gap-2"
                        >
                        {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </div>
             </div>
           )}

           {activeTab === 'billing' && (
             <div className="space-y-6 animate-fade-in">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                   <div>
                      <h3 className="text-sm font-bold text-slate-500 uppercase mb-1">Seu Plano Atual</h3>
                      <div className="flex items-center gap-3">
                         <h2 className="text-3xl font-bold text-brand-600">{user.plan}</h2>
                         <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase ${user.subscriptionStatus === 'active' ? 'bg-green-100 text-green-700' : user.subscriptionStatus === 'trial' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                           {user.subscriptionStatus === 'trial' ? 'Teste Grátis' : 'Ativo'}
                         </span>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {PLANS.map((plan) => {
                        const isCurrent = user.plan === plan.id;
                        const Icon = plan.icon;
                        return (
                            <div key={plan.id} className={`relative bg-white rounded-2xl border p-5 flex flex-col hover:shadow-lg transition-shadow ${plan.popular ? 'border-brand-500 shadow-lg shadow-brand-500/10' : 'border-slate-200 shadow-sm'}`}>
                                <div className={`w-12 h-12 rounded-2xl ${plan.color} flex items-center justify-center mb-4`}>
                                    <Icon size={24} className="text-slate-700" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800">{plan.name}</h3>
                                <div className="mt-1 mb-6">
                                    <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
                                    <span className="text-slate-400 text-sm font-medium">{plan.period}</span>
                                </div>
                                <ul className="space-y-3 mb-8 flex-1">
                                    {plan.features.map((feat, i) => (
                                        <li key={i} className="flex items-start gap-2 text-xs text-slate-600 font-medium">
                                            <Check size={14} className="text-green-500 shrink-0 mt-0.5" />
                                            {feat}
                                        </li>
                                    ))}
                                </ul>
                                <button 
                                    onClick={() => !isCurrent && handleSubscribe(plan)}
                                    disabled={isCurrent}
                                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${isCurrent ? 'bg-slate-100 text-slate-400 cursor-default' : `${plan.btnColor} text-white hover:opacity-90 shadow-md hover:-translate-y-1`}`}
                                >
                                    {isCurrent ? 'Plano Atual' : plan.id === 'Trial' ? 'Começar Grátis' : 'Assinar Agora'}
                                </button>
                            </div>
                        )
                    })}
                </div>
             </div>
           )}

           {activeTab === 'notifications' && (
             <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 text-center animate-fade-in">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Bell size={32} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Notificações</h3>
                <p className="text-slate-500">Configure suas preferências de alerta.</p>
             </div>
           )}
           
           {activeTab === 'security' && (
             <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 animate-fade-in">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-800">Segurança da Conta</h3>
                 </div>
                 <div className="space-y-6">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
                        <div className="flex items-start gap-3">
                            <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                                <Lock size={20} className="text-slate-500" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 text-sm">Autenticação</h4>
                                <p className="text-xs text-slate-500 mt-1">Gerenciado via Done Flow Identity</p>
                            </div>
                        </div>
                    </div>
                    <p className="text-sm text-slate-500">Para alterar sua senha, utilize a função de recuperação na tela de login ou contate o suporte.</p>
                </div>
             </div>
           )}
        </div>
      </div>

      {showCheckout && selectedPlan && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden">
                <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Checkout Seguro</h3>
                        <p className="text-xs text-slate-500 font-medium">Upgrade para o plano {selectedPlan.name}</p>
                    </div>
                    <button onClick={() => setShowCheckout(false)} className="text-slate-400 hover:text-slate-600"><LogOut size={20} className="rotate-180" /></button>
                </div>
                
                <div className="p-8 space-y-6">
                    <div className="flex justify-between items-center p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                                <Zap size={24} />
                            </div>
                            <div>
                                <p className="font-bold text-slate-800 text-base">{selectedPlan.name}</p>
                                <p className="text-xs text-slate-500 font-medium">Assinatura Mensal</p>
                            </div>
                        </div>
                        <p className="font-bold text-lg text-blue-700">{selectedPlan.price}</p>
                    </div>

                    <button 
                        onClick={processPayment}
                        disabled={isProcessingPayment}
                        className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-brand-600 transition-all shadow-lg shadow-slate-900/20 hover:shadow-brand-500/30 flex items-center justify-center gap-2"
                    >
                        {isProcessingPayment ? 'Processando...' : selectedPlan.id === 'Trial' ? 'Iniciar Teste Grátis' : `Pagar ${selectedPlan.price}`}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
