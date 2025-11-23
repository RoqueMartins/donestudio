
import React, { useState, useRef } from 'react';
import { Plus, Search, Building, Instagram, Facebook, Linkedin, Youtube, Twitter, X, Link2, CheckCircle2, AlertCircle, Loader2, Trash2, Upload, Pencil, Palette, FileText, LayoutTemplate, MonitorPlay, Type, Image as ImageIcon, MoreHorizontal, Globe, Share2, Rocket, ArrowRight, BrainCircuit, Users, MessageSquare, Hash, Ban } from 'lucide-react';
import { Client, SocialPlatform } from '../types';
import { saveClientToFirestore, deleteClientFromFirestore, getCurrentUserId } from '../services/firebase';

interface ClientsProps {
  clients: Client[];
  setClients: (clients: Client[]) => void;
}

const BRAND_STYLES = [
  'Minimalista e Limpo',
  'Corporativo e Sério',
  'Vibrante e Colorido',
  'Luxuoso e Elegante',
  'Tecnológico e Moderno',
  'Rústico e Natural',
  'Jovem e Descolado'
];

const TONE_OPTIONS = [
  'Profissional e Autoritário',
  'Amigável e Próximo',
  'Engraçado e Sarcástico',
  'Inspirador e Motivacional',
  'Educativo e Técnico',
  'Luxuoso e Exclusivo'
];

const Clients: React.FC<ClientsProps> = ({ clients, setClients }) => {
  // Modals State
  const [showClientForm, setShowClientForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'identity' | 'ai_brain'>('general');
  
  const [editingClient, setEditingClient] = useState<Client | null>(null); 
  const [connectingClient, setConnectingClient] = useState<Client | null>(null); 
  const [isSaving, setIsSaving] = useState(false);
  
  // Search State
  const [searchTerm, setSearchTerm] = useState('');

  // --- FORM STATE ---
  // 1. General
  const [clientName, setClientName] = useState('');
  const [clientIndustry, setClientIndustry] = useState('');
  const [clientDescription, setClientDescription] = useState('');
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [clientWebsite, setClientWebsite] = useState('');
  
  // Socials
  const [clientInstagram, setClientInstagram] = useState('');
  const [clientFacebook, setClientFacebook] = useState('');
  const [clientLinkedin, setClientLinkedin] = useState('');
  const [clientYoutube, setClientYoutube] = useState('');

  // 2. Visual Identity
  const [brandColor, setBrandColor] = useState('#F95500');
  const [brandColorSecondary, setBrandColorSecondary] = useState('#1F2937');
  const [brandColorTertiary, setBrandColorTertiary] = useState('#CCCCCC');
  const [brandStyle, setBrandStyle] = useState(BRAND_STYLES[0]);
  const [brandbookFile, setBrandbookFile] = useState<string>('');
  const [brandbookName, setBrandbookName] = useState<string>('');

  // 3. AI Brain (New!)
  const [targetAudience, setTargetAudience] = useState('');
  const [toneOfVoice, setToneOfVoice] = useState(TONE_OPTIONS[0]);
  const [contentPillarsInput, setContentPillarsInput] = useState(''); // Comma separated
  const [avoidTerms, setAvoidTerms] = useState('');
  const [customHashtags, setCustomHashtags] = useState('');
  
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>([]);
  const [loadingPlatform, setLoadingPlatform] = useState<SocialPlatform | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // --- Handlers ---

  const openAddModal = () => {
    setEditingClient(null);
    setActiveTab('general');
    resetForm();
    setShowClientForm(true);
  };

  const resetForm = () => {
    setClientName('');
    setClientIndustry('');
    setClientDescription('');
    setLogoPreview('');
    setClientWebsite('');
    setClientInstagram('');
    setClientFacebook('');
    setClientLinkedin('');
    setClientYoutube('');
    setBrandColor('#F95500'); 
    setBrandColorSecondary('#1F2937');
    setBrandColorTertiary('#F3F4F6');
    setBrandStyle(BRAND_STYLES[0]);
    setBrandbookFile('');
    setBrandbookName('');
    setTargetAudience('');
    setToneOfVoice(TONE_OPTIONS[0]);
    setContentPillarsInput('');
    setAvoidTerms('');
    setCustomHashtags('');
    setSelectedPlatforms([]);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setActiveTab('general');
    
    // General
    setClientName(client.name);
    setClientIndustry(client.industry);
    setClientDescription(client.description || '');
    setLogoPreview(client.logo);
    setClientWebsite(client.website || '');
    setClientInstagram(client.socialLinks?.instagram || '');
    setClientFacebook(client.socialLinks?.facebook || '');
    setClientLinkedin(client.socialLinks?.linkedin || '');
    setClientYoutube(client.socialLinks?.youtube || '');
    
    // Identity
    setBrandColor(client.brandColor || '#F95500');
    setBrandColorSecondary(client.brandColorSecondary || '#1F2937');
    setBrandColorTertiary(client.brandColorTertiary || '#F3F4F6');
    setBrandStyle(client.brandStyle || BRAND_STYLES[0]);
    setBrandbookFile(client.brandbook || '');
    setBrandbookName(client.brandbookName || '');
    
    // AI Brain
    setTargetAudience(client.targetAudience || '');
    setToneOfVoice(client.toneOfVoice || TONE_OPTIONS[0]);
    setContentPillarsInput(client.contentPillars?.join(', ') || '');
    setAvoidTerms(client.avoidTerms || '');
    setCustomHashtags(client.customHashtags || '');

    setSelectedPlatforms(client.connectedPlatforms); 
    setShowClientForm(true);
  };

  const openConnectModal = (client: Client) => {
    setConnectingClient(client);
    setSelectedPlatforms([...client.connectedPlatforms]);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Por favor, selecione apenas arquivos PDF.');
        return;
      }
      setBrandbookName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBrandbookFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveClient = async () => {
    const userId = getCurrentUserId();
    if (!clientName || !clientIndustry || !userId) return;
    
    setIsSaving(true);

    const finalLogo = logoPreview || `https://picsum.photos/seed/${clientName}/100/100`;
    const socialLinks = {
      instagram: clientInstagram,
      facebook: clientFacebook,
      linkedin: clientLinkedin,
      youtube: clientYoutube
    };
    
    const contentPillars = contentPillarsInput.split(',').map(s => s.trim()).filter(s => s !== '');

    const clientData: Client = {
      id: editingClient ? editingClient.id : Date.now().toString(),
      name: clientName,
      industry: clientIndustry,
      logo: finalLogo,
      active: true,
      connectedPlatforms: selectedPlatforms,
      website: clientWebsite,
      socialLinks,
      brandColor,
      brandColorSecondary,
      brandColorTertiary,
      brandStyle,
      brandbook: brandbookFile,
      brandbookName,
      nextPost: editingClient?.nextPost,
      
      // New AI Fields
      description: clientDescription,
      targetAudience,
      toneOfVoice,
      contentPillars,
      avoidTerms,
      customHashtags
    };

    await saveClientToFirestore(userId, clientData);
    
    setIsSaving(false);
    setShowClientForm(false);
    resetForm();
    setEditingClient(null);
  };

  const handleDeleteClient = async (clientId: string) => {
    const userId = getCurrentUserId();
    if (!userId) return;
    if (window.confirm('Tem certeza que deseja remover este cliente?')) {
       await deleteClientFromFirestore(userId, clientId);
    }
  };

  const handleTogglePlatform = (platform: SocialPlatform) => {
      const isConnected = selectedPlatforms.includes(platform);
      if (!isConnected) {
        setLoadingPlatform(platform);
        setTimeout(() => {
          setSelectedPlatforms(prev => [...prev, platform]);
          setLoadingPlatform(null);
        }, 1000);
      } else {
        setSelectedPlatforms(prev => prev.filter(p => p !== platform));
      }
  };

  const saveConnections = async () => {
    const userId = getCurrentUserId();
    if (!connectingClient || !userId) return;
    const updatedClient = { ...connectingClient, connectedPlatforms: selectedPlatforms };
    await saveClientToFirestore(userId, updatedClient);
    setConnectingClient(null);
  };

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    client.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPlatformIcon = (platform: SocialPlatform, size: number = 16) => {
    switch (platform) {
      case SocialPlatform.INSTAGRAM: return <Instagram size={size} className="text-pink-600" />;
      case SocialPlatform.FACEBOOK: return <Facebook size={size} className="text-blue-600" />;
      case SocialPlatform.LINKEDIN: return <Linkedin size={size} className="text-blue-700" />;
      case SocialPlatform.YOUTUBE: return <Youtube size={size} className="text-red-600" />;
      case SocialPlatform.TWITTER: return <Twitter size={size} className="text-slate-800" />;
      default: return null;
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Carteira de Clientes</h2>
          <p className="text-slate-500 font-medium mt-1">Gerencie o DNA de cada marca para potencializar a IA.</p>
        </div>
        {clients.length > 0 && (
          <button 
            onClick={openAddModal}
            className="bg-slate-900 text-white px-5 py-3 rounded-2xl flex items-center gap-2 shadow-lg hover:bg-brand-600 hover:shadow-brand-500/30 transition-all font-bold text-sm"
          >
            <Plus size={20} />
            Novo Cliente
          </button>
        )}
      </div>

      {/* Search */}
      {clients.length > 0 && (
        <div className="bg-white p-4 rounded-[1.5rem] border border-slate-200 shadow-sm mb-8 flex items-center gap-4 max-w-2xl focus-within:border-brand-300 transition-colors">
          <Search className="text-slate-400" size={22} />
          <input 
            type="text" 
            placeholder="Buscar marca..." 
            className="flex-1 outline-none text-slate-700 placeholder-slate-400 bg-transparent font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      {/* List Grid */}
      {clients.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center animate-fade-in pb-20">
           <div className="bg-white/80 backdrop-blur-lg p-12 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white max-w-2xl w-full text-center">
               <div className="w-24 h-24 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce-slow shadow-inner ring-8 ring-brand-50/50">
                  <Rocket size={40} strokeWidth={1.5} />
               </div>
               <h3 className="text-3xl font-extrabold text-slate-800 mb-4 tracking-tight">Nenhuma marca cadastrada</h3>
               <p className="text-slate-500 text-lg mb-10 leading-relaxed max-w-md mx-auto font-medium">
                  Cadastre seu primeiro cliente e configure o "Brand DNA" para gerar conteúdo ultra-personalizado.
               </p>
               <button onClick={openAddModal} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl transition-all hover:-translate-y-1 hover:bg-brand-600 flex items-center gap-3 mx-auto">
                  Cadastrar Marca <ArrowRight size={20} />
               </button>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 overflow-y-auto custom-scrollbar pb-10 flex-1">
          {filteredClients.map((client) => (
            <div key={client.id} className="bg-white rounded-[2rem] shadow-card hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col group overflow-hidden hover:-translate-y-1 cursor-pointer" onClick={() => openEditModal(client)}>
              <div className="h-32 w-full relative flex items-start justify-end p-4" style={{ backgroundColor: client.brandColor || '#3b82f6' }}>
                 <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent"></div>
                 <div className="flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteClient(client.id); }} className="bg-white/20 hover:bg-white text-white hover:text-red-600 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors">
                        <Trash2 size={14} />
                    </button>
                 </div>
              </div>

              <div className="px-8 pb-8 flex flex-col flex-1 relative">
                <div className="-mt-12 mb-4 relative">
                  <div className="w-24 h-24 rounded-3xl p-1 bg-white shadow-md">
                    <img src={client.logo} alt={client.name} className="w-full h-full rounded-2xl object-cover" />
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-2xl font-extrabold text-slate-800 leading-tight mb-1">{client.name}</h3>
                  <div className="flex items-center gap-1.5 text-slate-500 text-sm font-medium mb-3">
                    <Building size={14} /> <span>{client.industry}</span>
                  </div>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                     {client.toneOfVoice && <span className="text-[10px] px-2 py-1 rounded-md bg-slate-100 text-slate-600 font-bold uppercase">{client.toneOfVoice.split(' ')[0]}</span>}
                     {client.targetAudience && <span className="text-[10px] px-2 py-1 rounded-md bg-slate-100 text-slate-600 font-bold uppercase truncate max-w-[120px]">{client.targetAudience}</span>}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-between items-center mt-auto">
                      <div className="flex -space-x-2">
                        {client.connectedPlatforms.length > 0 ? client.connectedPlatforms.map((p,i) => (
                             <div key={i} className="w-7 h-7 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-sm z-10">{getPlatformIcon(p, 14)}</div>
                        )) : <span className="text-xs text-slate-400 font-medium">Offline</span>}
                      </div>
                      <button onClick={(e) => {e.stopPropagation(); openConnectModal(client)}} className="text-xs font-bold text-brand-600 hover:underline">Conexões</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button onClick={openAddModal} className="group border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center p-8 text-slate-400 hover:border-brand-300 hover:bg-brand-50/10 transition-all min-h-[380px]">
            <div className="w-16 h-16 rounded-full bg-slate-50 group-hover:bg-white flex items-center justify-center mb-4 transition-all shadow-sm group-hover:scale-110">
              <Plus size={32} className="text-slate-300 group-hover:text-brand-500" />
            </div>
            <span className="font-bold text-lg text-slate-500 group-hover:text-brand-700">Adicionar Cliente</span>
          </button>
        </div>
      )}

      {/* --- MAIN MODAL --- */}
      {showClientForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col h-[90vh]">
            
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
              <div>
                 <h3 className="text-2xl font-bold text-slate-800">{editingClient ? 'Editar DNA da Marca' : 'Nova Marca'}</h3>
                 <p className="text-sm text-slate-500">Configure os detalhes para calibrar a IA.</p>
              </div>
              <button onClick={() => setShowClientForm(false)} className="w-10 h-10 rounded-full bg-white text-slate-400 hover:text-slate-800 flex items-center justify-center hover:bg-slate-100 transition-colors shadow-sm border border-slate-100">
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Tabs */}
                <div className="w-64 bg-slate-50 border-r border-slate-100 p-4 space-y-2 hidden md:block overflow-y-auto custom-scrollbar">
                   <button onClick={() => setActiveTab('general')} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 transition-all ${activeTab === 'general' ? 'bg-white text-brand-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:bg-slate-100'}`}>
                      <Building size={18} /> Perfil Geral
                   </button>
                   <button onClick={() => setActiveTab('identity')} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 transition-all ${activeTab === 'identity' ? 'bg-white text-brand-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:bg-slate-100'}`}>
                      <Palette size={18} /> Identidade Visual
                   </button>
                   <button onClick={() => setActiveTab('ai_brain')} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 transition-all ${activeTab === 'ai_brain' ? 'bg-gradient-to-r from-brand-500 to-pink-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}>
                      <BrainCircuit size={18} /> Cérebro da IA
                   </button>
                </div>

                {/* Mobile Tabs */}
                <div className="md:hidden w-full flex border-b border-slate-100 overflow-x-auto">
                    <button onClick={() => setActiveTab('general')} className={`flex-1 py-4 text-xs font-bold uppercase border-b-2 ${activeTab === 'general' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-400'}`}>Geral</button>
                    <button onClick={() => setActiveTab('identity')} className={`flex-1 py-4 text-xs font-bold uppercase border-b-2 ${activeTab === 'identity' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-400'}`}>Visual</button>
                    <button onClick={() => setActiveTab('ai_brain')} className={`flex-1 py-4 text-xs font-bold uppercase border-b-2 ${activeTab === 'ai_brain' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-400'}`}>IA Brain</button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-[#f8fafc]">
                    
                    {/* TAB: GENERAL */}
                    {activeTab === 'general' && (
                       <div className="space-y-8 max-w-2xl animate-fade-in">
                          <div className="flex flex-col md:flex-row gap-8 items-start">
                             <div className="flex flex-col items-center gap-3">
                                <div onClick={() => fileInputRef.current?.click()} className="w-32 h-32 bg-white rounded-3xl border-2 border-dashed border-slate-300 hover:border-brand-500 flex items-center justify-center cursor-pointer overflow-hidden group relative shadow-sm transition-all">
                                   {logoPreview ? <img src={logoPreview} className="w-full h-full object-cover" /> : <Upload size={32} className="text-slate-300 group-hover:text-brand-500" />}
                                   <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs">Alterar</div>
                                </div>
                                <input type="file" ref={fileInputRef} className="hidden" onChange={handleLogoUpload} accept="image/*" />
                                <span className="text-xs font-bold text-slate-400 uppercase">Logo da Marca</span>
                             </div>
                             <div className="flex-1 w-full space-y-5">
                                <div>
                                   <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nome da Marca</label>
                                   <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all font-medium" placeholder="Ex: Tech Solutions" />
                                </div>
                                <div>
                                   <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Segmento / Indústria</label>
                                   <input type="text" value={clientIndustry} onChange={e => setClientIndustry(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium" placeholder="Ex: Tecnologia, Varejo, Saúde..." />
                                </div>
                             </div>
                          </div>

                          <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Descrição Curta (Bio)</label>
                             <textarea value={clientDescription} onChange={e => setClientDescription(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none h-24 resize-none font-medium" placeholder="O que a empresa faz? Qual o diferencial?" />
                          </div>

                          <div className="pt-6 border-t border-slate-200">
                             <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><Globe size={16} /> Redes Sociais (URLs)</h4>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input type="text" value={clientInstagram} onChange={e => setClientInstagram(e.target.value)} placeholder="Instagram Link" className="px-4 py-2 border border-slate-200 rounded-lg text-sm" />
                                <input type="text" value={clientFacebook} onChange={e => setClientFacebook(e.target.value)} placeholder="Facebook Link" className="px-4 py-2 border border-slate-200 rounded-lg text-sm" />
                                <input type="text" value={clientLinkedin} onChange={e => setClientLinkedin(e.target.value)} placeholder="LinkedIn Link" className="px-4 py-2 border border-slate-200 rounded-lg text-sm" />
                                <input type="text" value={clientWebsite} onChange={e => setClientWebsite(e.target.value)} placeholder="Website Oficial" className="px-4 py-2 border border-slate-200 rounded-lg text-sm" />
                             </div>
                          </div>
                       </div>
                    )}

                    {/* TAB: IDENTITY */}
                    {activeTab === 'identity' && (
                       <div className="space-y-8 max-w-2xl animate-fade-in">
                          <div className="grid grid-cols-2 gap-6">
                             <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Cor Primária</label>
                                <div className="flex gap-3">
                                   <input type="color" value={brandColor} onChange={e => setBrandColor(e.target.value)} className="h-11 w-11 rounded-lg cursor-pointer border-none p-0" />
                                   <input type="text" value={brandColor} onChange={e => setBrandColor(e.target.value)} className="flex-1 px-3 border border-slate-200 rounded-lg font-mono text-sm uppercase" />
                                </div>
                             </div>
                             <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Cor Secundária</label>
                                <div className="flex gap-3">
                                   <input type="color" value={brandColorSecondary} onChange={e => setBrandColorSecondary(e.target.value)} className="h-11 w-11 rounded-lg cursor-pointer border-none p-0" />
                                   <input type="text" value={brandColorSecondary} onChange={e => setBrandColorSecondary(e.target.value)} className="flex-1 px-3 border border-slate-200 rounded-lg font-mono text-sm uppercase" />
                                </div>
                             </div>
                          </div>

                          <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Estilo Visual</label>
                             <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {BRAND_STYLES.map(style => (
                                   <button 
                                      key={style} 
                                      onClick={() => setBrandStyle(style)}
                                      className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${brandStyle === style ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                                   >
                                      {style}
                                   </button>
                                ))}
                             </div>
                          </div>

                          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                             <div className="flex items-start gap-4">
                                <div className="bg-white p-3 rounded-xl shadow-sm text-brand-600">
                                   <FileText size={24} />
                                </div>
                                <div className="flex-1">
                                   <h4 className="font-bold text-slate-800 mb-1">Brandbook (PDF)</h4>
                                   <p className="text-xs text-slate-500 mb-4">Faça upload do manual da marca. A IA usará isso para entender profundamente o tom e estilo.</p>
                                   <button onClick={() => pdfInputRef.current?.click()} className="bg-white border border-blue-200 text-blue-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-50 transition-colors">
                                      {brandbookName ? `Arquivo: ${brandbookName}` : 'Selecionar PDF'}
                                   </button>
                                   <input type="file" ref={pdfInputRef} className="hidden" accept="application/pdf" onChange={handlePdfUpload} />
                                </div>
                             </div>
                          </div>
                       </div>
                    )}

                    {/* TAB: AI BRAIN (NEW) */}
                    {activeTab === 'ai_brain' && (
                       <div className="space-y-8 max-w-2xl animate-fade-in">
                          <div className="bg-gradient-to-r from-brand-600 to-pink-600 p-6 rounded-2xl text-white shadow-lg mb-6 relative overflow-hidden">
                             <div className="relative z-10">
                                <h4 className="font-bold text-lg flex items-center gap-2"><BrainCircuit size={20} /> Configuração de Inteligência</h4>
                                <p className="text-sm text-white/80 mt-1">Quanto mais detalhes aqui, mais "humano" e preciso será o texto gerado.</p>
                             </div>
                             <BrainCircuit size={120} className="absolute -right-6 -bottom-6 text-white/10" />
                          </div>

                          <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2"><MessageSquare size={14} /> Tom de Voz</label>
                             <select value={toneOfVoice} onChange={e => setToneOfVoice(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-brand-500 outline-none cursor-pointer">
                                {TONE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                             </select>
                          </div>

                          <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2"><Users size={14} /> Público-Alvo (Persona)</label>
                             <input type="text" value={targetAudience} onChange={e => setTargetAudience(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Ex: Mulheres de 25-35 anos, classe B, interessadas em moda sustentável." />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                 <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2"><LayoutTemplate size={14} /> Pilares de Conteúdo</label>
                                 <textarea value={contentPillarsInput} onChange={e => setContentPillarsInput(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none h-24 resize-none text-sm" placeholder="Separar por vírgulas. Ex: Dicas de Estilo, Bastidores, Promoções..." />
                              </div>
                              <div>
                                 <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2"><Ban size={14} /> O que evitar? (Blacklist)</label>
                                 <textarea value={avoidTerms} onChange={e => setAvoidTerms(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none h-24 resize-none text-sm" placeholder="Ex: Gírias, termos técnicos difíceis, emoji de berinjela..." />
                              </div>
                          </div>

                          <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2"><Hash size={14} /> Hashtags de Nicho (Opcional)</label>
                             <input type="text" value={customHashtags} onChange={e => setCustomHashtags(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Ex: #ModaSustentavel #SlowFashion #LookDoDia" />
                             <p className="text-[10px] text-slate-400 mt-1">A IA irá misturar estas com hashtags virais do momento.</p>
                          </div>
                       </div>
                    )}
                </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
               <button onClick={() => setShowClientForm(false)} className="px-6 py-3 rounded-xl text-slate-500 font-bold text-sm hover:bg-slate-200 transition-colors">Cancelar</button>
               <button onClick={handleSaveClient} disabled={isSaving} className="px-8 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-brand-600 shadow-lg transition-all disabled:opacity-70 flex items-center gap-2">
                  {isSaving ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                  {editingClient ? 'Salvar Alterações' : 'Criar Marca'}
               </button>
            </div>
          </div>
        </div>
      )}

      {connectingClient && (
         <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-6">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-slate-800">Conexões Sociais</h3>
                  <button onClick={() => setConnectingClient(null)}><X size={20} className="text-slate-400" /></button>
               </div>
               <div className="space-y-3 mb-6">
                  {Object.values(SocialPlatform).map((platform) => (
                     <div key={platform} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:border-brand-200 transition-colors">
                        <div className="flex items-center gap-3">
                           {getPlatformIcon(platform)}
                           <span className="font-bold text-slate-700">{platform}</span>
                        </div>
                        <button 
                           onClick={() => handleTogglePlatform(platform)}
                           className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedPlatforms.includes(platform) ? 'bg-red-50 text-red-600' : 'bg-slate-900 text-white'}`}
                        >
                           {loadingPlatform === platform ? <Loader2 size={14} className="animate-spin" /> : (selectedPlatforms.includes(platform) ? 'Desconectar' : 'Conectar')}
                        </button>
                     </div>
                  ))}
               </div>
               <button onClick={saveConnections} className="w-full py-3 bg-brand-600 text-white rounded-xl font-bold shadow-lg shadow-brand-500/20">Salvar</button>
            </div>
         </div>
      )}
    </div>
  );
};

export default Clients;
