

import React, { useState, useRef, useEffect } from 'react';
import { 
  Image as ImageIcon, Wand2, Loader2, Camera, ChevronLeft, Clock, 
  MoreHorizontal, Heart, MessageCircle, Send as SendIcon, 
  Instagram, Facebook, Linkedin, Twitter, Youtube, Smartphone, 
  Eye, X, Sparkles, RefreshCcw, Type, Upload, CheckCircle2, Zap
} from 'lucide-react';
import { Client, Post, PostStatus, SocialPlatform } from '../types';
import { generateCaption } from '../services/geminiService';
import { savePostToFirestore, getCurrentUserId } from '../services/firebase';

interface StudioProps {
  clients: Client[];
  posts: Post[];
  setPosts: (posts: Post[]) => void;
  onNavigate: (view: string) => void;
  initialPost?: Post | null;
}

const Studio: React.FC<StudioProps> = ({ clients, posts, setPosts, onNavigate, initialPost }) => {
  const [selectedClientId, setSelectedClientId] = useState(initialPost?.clientId || '');
  const [title, setTitle] = useState(initialPost?.title || '');
  const [content, setContent] = useState(initialPost?.content || '');
  const [postImage, setPostImage] = useState(initialPost?.image || '');
  const [scheduledDate, setScheduledDate] = useState(initialPost?.scheduledDate ? new Date(initialPost.scheduledDate).toISOString().split('T')[0] : '');
  const [scheduledTime, setScheduledTime] = useState(initialPost?.scheduledDate ? new Date(initialPost.scheduledDate).toTimeString().slice(0, 5) : '');
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>(initialPost?.platforms || [SocialPlatform.INSTAGRAM]);
  
  const [aiTopic, setAiTopic] = useState('');
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedClient = clients.find(c => c.id === selectedClientId);

  // Auto-select platforms based on client defaults
  useEffect(() => {
    if (selectedClient && !initialPost) {
        if (selectedClient.connectedPlatforms.length > 0) {
            setSelectedPlatforms(selectedClient.connectedPlatforms);
        }
    }
  }, [selectedClientId]);

  const handleGenerateText = async (instructionOverride?: string) => {
    if ((!aiTopic && !title) || !selectedClient) {
        alert("Por favor, selecione uma marca e digite um tópico ou título.");
        return;
    }
    setIsGeneratingText(true);
    
    const topicToUse = aiTopic || title;
    const finalInstruction = instructionOverride ? `${topicToUse}. Instrução Extra: ${instructionOverride}` : topicToUse;

    try {
        const generated = await generateCaption(finalInstruction, selectedClient);
        setContent(generated);
    } catch (error) {
        console.error("Erro IA", error);
    } finally {
        setIsGeneratingText(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => setPostImage(reader.result as string);
      reader.readAsDataURL(file);
  };

  // Drag and Drop Logic
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const togglePlatform = (p: SocialPlatform) => {
    if (selectedPlatforms.includes(p)) {
        setSelectedPlatforms(prev => prev.filter(pl => pl !== p));
    } else {
        setSelectedPlatforms(prev => [...prev, p]);
    }
  };

  const handleSave = async (status: PostStatus) => {
      const userId = getCurrentUserId();
      if (!userId) {
          alert("Erro: Usuário não autenticado.");
          return;
      }

      if (!selectedClientId || !title) {
          alert("Selecione uma marca e defina um título para o post.");
          return;
      }
      
      let finalDate = new Date();
      if (scheduledDate) {
          finalDate = new Date(`${scheduledDate}T${scheduledTime || '12:00'}`);
          const now = new Date();
          now.setHours(0,0,0,0);
          
          if (finalDate < now && status === PostStatus.SCHEDULED) {
               const confirmSave = window.confirm("A data selecionada é no passado. Deseja salvar como Rascunho?");
               if (confirmSave) status = PostStatus.DRAFT;
               else return;
          }
      } else if (status === PostStatus.SCHEDULED) {
          alert("Selecione uma data para agendar.");
          return;
      }

      const newPost: Post = {
          id: initialPost?.id || Date.now().toString(),
          clientId: selectedClientId,
          title,
          content,
          image: postImage,
          scheduledDate: finalDate,
          status: status,
          platforms: selectedPlatforms,
          author: 'Studio'
      };

      // 1. Optimistic Update
      if (initialPost) {
          setPosts(posts.map(p => p.id === initialPost.id ? newPost : p));
      } else {
          setPosts([...posts, newPost]);
      }
      
      // 2. Persist to Firestore (Mock)
      try {
          await savePostToFirestore(userId, newPost);
          onNavigate('scheduler');
      } catch (error: any) {
          console.error("Erro ao salvar:", error);
          if (error.message === 'QUOTA_EXCEEDED') {
              alert("Memória cheia! O sistema liberou espaço apagando imagens de posts antigos. Tente salvar novamente.");
          } else {
              alert("Erro ao salvar o post.");
          }
      }
  };

  const PlatformIcon = ({ p, active }: { p: SocialPlatform, active: boolean }) => {
      const colorClass = active ? 
        (p === SocialPlatform.INSTAGRAM ? 'text-pink-600' : 
         p === SocialPlatform.FACEBOOK ? 'text-blue-600' : 
         p === SocialPlatform.LINKEDIN ? 'text-blue-700' : 
         p === SocialPlatform.YOUTUBE ? 'text-red-600' : 'text-black') 
        : 'text-slate-300';
      
      const IconMap = {
          [SocialPlatform.INSTAGRAM]: Instagram,
          [SocialPlatform.FACEBOOK]: Facebook,
          [SocialPlatform.LINKEDIN]: Linkedin,
          [SocialPlatform.TWITTER]: Twitter,
          [SocialPlatform.YOUTUBE]: Youtube
      };
      const Icon = IconMap[p] || Smartphone;

      return <Icon size={20} className={colorClass} />;
  };

  // Quick AI Actions
  const aiActions = [
      { label: 'Encurtar', icon: Type, prompt: 'Reescreva de forma mais curta e direta.' },
      { label: 'Expandir', icon: MessageCircle, prompt: 'Adicione mais detalhes e contexto.' },
      { label: 'Tom Divertido', icon: Sparkles, prompt: 'Use um tom bem humorado e emojis.' },
      { label: 'Vendas', icon: Zap, prompt: 'Foque em conversão e chamada para ação (CTA).' },
  ];

  return (
    <div className="h-full flex flex-col animate-fade-in overflow-hidden relative bg-[#f8fafc]">
        {/* Top Bar */}
        <div className="bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between z-30 shrink-0 sticky top-0 shadow-sm">
            <div className="flex items-center gap-4">
                <button onClick={() => onNavigate('dashboard')} className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200">
                    <ChevronLeft size={22} />
                </button>
                <div>
                    <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                        Estúdio Criativo
                        {selectedClient && <span className="px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 text-[10px] uppercase font-bold tracking-wider border border-brand-100">AI Enabled</span>}
                    </h1>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => setShowMobilePreview(true)}
                    className="lg:hidden p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
                >
                    <Eye size={20} />
                </button>
                <button 
                    onClick={() => handleSave(PostStatus.DRAFT)} 
                    className="hidden md:flex px-5 py-2.5 text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-sm font-bold transition-colors"
                >
                    Salvar Rascunho
                </button>
                <button 
                    onClick={() => handleSave(PostStatus.SCHEDULED)} 
                    className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-brand-600 shadow-lg shadow-slate-900/20 hover:shadow-brand-500/30 transition-all hover:-translate-y-0.5 flex items-center gap-2"
                >
                    <Clock size={16} /> <span>Agendar Post</span>
                </button>
            </div>
        </div>

        <div className="flex-1 flex overflow-hidden relative">
            {/* Main Editor */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-8 w-full max-w-[1000px] mx-auto">
                
                {/* 1. Context Section */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
                    {/* Brand Selector */}
                    <div className="md:col-span-5 bg-white p-5 rounded-[24px] shadow-sm border border-slate-200">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Marca & DNA</label>
                        <div className="relative mb-3">
                            <select 
                                value={selectedClientId} 
                                onChange={(e) => setSelectedClientId(e.target.value)}
                                className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-700 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 cursor-pointer appearance-none text-sm outline-none transition-all"
                            >
                                <option value="">Selecione a Marca...</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <ChevronLeft size={16} className="-rotate-90" />
                            </div>
                        </div>
                        {selectedClient && (
                            <div className="flex flex-wrap gap-2 animate-fade-in">
                                <span className="text-[10px] px-2 py-1 bg-blue-50 text-blue-700 rounded-md font-bold border border-blue-100 truncate max-w-full">
                                    {selectedClient.industry}
                                </span>
                                {selectedClient.toneOfVoice && (
                                    <span className="text-[10px] px-2 py-1 bg-purple-50 text-purple-700 rounded-md font-bold border border-purple-100 flex items-center gap-1">
                                        <Sparkles size={8} /> {selectedClient.toneOfVoice}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Channels & Date */}
                    <div className="md:col-span-7 bg-white p-5 rounded-[24px] shadow-sm border border-slate-200 flex flex-col justify-between">
                         <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Canais de Publicação</label>
                            <div className="flex gap-2 flex-wrap mb-4">
                                {Object.values(SocialPlatform).map(p => (
                                    <button 
                                        key={p}
                                        onClick={() => togglePlatform(p)}
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-200 ${selectedPlatforms.includes(p) ? 'bg-white border-brand-200 ring-2 ring-brand-50 shadow-sm' : 'bg-slate-50 border-transparent hover:bg-slate-100 opacity-60 hover:opacity-100'}`}
                                        title={p}
                                    >
                                        <PlatformIcon p={p} active={selectedPlatforms.includes(p)} />
                                    </button>
                                ))}
                            </div>
                         </div>
                         <div className="flex gap-3">
                             <input 
                                type="date" 
                                className="flex-1 px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 font-bold text-xs focus:outline-none focus:border-brand-500 transition-colors"
                                value={scheduledDate}
                                onChange={(e) => setScheduledDate(e.target.value)}
                             />
                             <input 
                                type="time" 
                                className="w-24 px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 font-bold text-xs focus:outline-none focus:border-brand-500 transition-colors"
                                value={scheduledTime}
                                onChange={(e) => setScheduledTime(e.target.value)}
                             />
                         </div>
                    </div>
                </div>

                {/* 2. Content Creator */}
                <div className="space-y-6">
                    {/* Title */}
                    <input 
                        type="text" 
                        placeholder="Título do Post (Interno)..."
                        className="w-full text-3xl font-extrabold text-slate-800 placeholder:text-slate-300 border-none outline-none bg-transparent transition-all px-2"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    {/* Media Dropzone */}
                    <div 
                        className={`
                            relative w-full aspect-video rounded-[32px] border-2 border-dashed transition-all duration-300 overflow-hidden group
                            ${dragActive ? 'border-brand-500 bg-brand-50/10 scale-[1.01]' : 'border-slate-200 bg-slate-50 hover:border-brand-300 hover:bg-slate-100'}
                        `}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        {postImage ? (
                            <>
                                <img src={postImage} className="w-full h-full object-cover" alt="Post content" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                     <button onClick={() => fileInputRef.current?.click()} className="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold text-sm shadow-xl hover:scale-105 transition-transform flex items-center gap-2">
                                        <RefreshCcw size={16} /> Trocar Mídia
                                     </button>
                                </div>
                            </>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-3 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-sm ${dragActive ? 'bg-brand-100 text-brand-600 scale-110' : 'bg-white text-slate-300 group-hover:text-brand-500 group-hover:scale-110'}`}>
                                    <Upload size={32} />
                                </div>
                                <div className="text-center">
                                    <p className="font-bold text-lg text-slate-600">Arraste sua mídia aqui</p>
                                    <p className="text-xs font-medium text-slate-400 mt-1">ou clique para fazer upload</p>
                                </div>
                            </div>
                        )}
                        <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageUpload} accept="image/*" />
                    </div>

                    {/* AI Smart Editor */}
                    <div className="bg-white rounded-[32px] shadow-card border border-slate-200 overflow-hidden relative">
                        {/* AI Toolbar */}
                        <div className="p-3 bg-slate-50/80 border-b border-slate-100 flex flex-col gap-3 backdrop-blur-sm">
                            <div className="flex items-center gap-2 w-full">
                                <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/20 shrink-0">
                                    <Wand2 size={16} className="text-white" />
                                </div>
                                <input 
                                    type="text" 
                                    className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium outline-none text-slate-700 placeholder:text-slate-400 focus:border-brand-400 transition-colors"
                                    placeholder="Descreva o post para a IA (ex: Dicas de verão)..."
                                    value={aiTopic}
                                    onChange={(e) => setAiTopic(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleGenerateText()}
                                />
                                <button 
                                    onClick={() => handleGenerateText()}
                                    disabled={isGeneratingText || !selectedClient}
                                    className="h-10 px-4 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-brand-600 transition-all disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isGeneratingText ? <Loader2 className="animate-spin" size={14} /> : 'Gerar'}
                                </button>
                            </div>
                            
                            {/* Smart Chips */}
                            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                {aiActions.map((action, i) => (
                                    <button 
                                        key={i}
                                        onClick={() => handleGenerateText(action.prompt)}
                                        disabled={isGeneratingText || !selectedClient}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-brand-300 hover:bg-brand-50 rounded-lg text-[11px] font-bold text-slate-600 hover:text-brand-700 transition-all whitespace-nowrap"
                                    >
                                        <action.icon size={12} /> {action.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <textarea 
                            className="w-full h-48 p-6 bg-white border-none focus:ring-0 text-slate-700 leading-relaxed text-sm resize-none outline-none font-medium custom-scrollbar"
                            placeholder="Escreva sua legenda aqui..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                        
                        <div className="px-6 py-3 bg-white border-t border-slate-50 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            <span className={content.length > 2200 ? 'text-red-500' : ''}>{content.length} / 2200 caracteres</span>
                            <span>{content.split(/\s+/).filter(x => x).length} palavras</span>
                        </div>
                    </div>
                </div>
                <div className="h-20"></div> {/* Spacer */}
            </div>

            {/* Live Preview (Sticky Right) */}
            <div className={`
                ${showMobilePreview ? 'fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center p-4' : 'hidden lg:flex'} 
                lg:w-[420px] lg:bg-slate-50 lg:border-l lg:border-slate-200 flex-col items-center justify-center py-8 relative transition-all duration-300
            `}>
                {showMobilePreview && (
                    <button 
                        onClick={() => setShowMobilePreview(false)}
                        className="absolute top-6 right-6 p-3 bg-white rounded-full shadow-lg text-slate-400 hover:text-slate-800 z-50"
                    >
                        <X size={24} />
                    </button>
                )}

                <div className="hidden lg:flex absolute top-6 left-1/2 -translate-x-1/2 bg-white border border-slate-200 px-4 py-1.5 rounded-full text-[10px] font-bold text-slate-500 items-center gap-2 shadow-sm">
                    <Smartphone size={12} /> Live Preview
                </div>

                {/* Realistic Phone Mockup */}
                <div className="w-[340px] h-[680px] bg-black rounded-[3rem] border-[8px] border-black overflow-hidden shadow-2xl relative shrink-0 ring-4 ring-slate-200/50">
                    {/* Status Bar */}
                    <div className="h-12 bg-white flex justify-between items-end px-6 pb-2 select-none relative z-20">
                        <span className="text-[12px] font-bold text-black">9:41</span>
                        <div className="flex gap-1.5 items-end">
                            <div className="w-4 h-2.5 bg-black rounded-[2px]"></div>
                            <div className="w-4 h-2.5 bg-gray-300 rounded-[2px]"></div>
                        </div>
                    </div>

                    {/* App Header */}
                    <div className="h-14 border-b border-gray-100 flex items-center justify-between px-4 bg-white relative z-10">
                         <div className="w-8 h-8 flex items-center justify-center">
                             <ChevronLeft size={20} className="text-black" />
                         </div>
                         <span className="font-bold text-xs text-black uppercase tracking-wide">Posts</span>
                         <div className="w-8 h-8"></div>
                    </div>

                    {/* Content */}
                    <div className="bg-white h-full overflow-y-auto custom-scrollbar pb-24 relative">
                         <div className="flex items-center gap-3 p-3">
                             <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px]">
                                 <img 
                                    src={selectedClient?.logo || 'https://via.placeholder.com/40'} 
                                    className="w-full h-full rounded-full object-cover border-2 border-white"
                                 />
                             </div>
                             <div className="flex-1 leading-tight">
                                 <p className="text-sm font-bold text-black">{selectedClient?.name || 'sua_marca'}</p>
                                 <p className="text-[10px] text-gray-500">{selectedClient?.location || 'Brasil'}</p>
                             </div>
                             <MoreHorizontal size={20} className="text-black" />
                         </div>

                         <div className="aspect-square bg-slate-100 w-full relative group">
                             {postImage ? (
                                 <img src={postImage} className="w-full h-full object-cover" />
                             ) : (
                                 <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50">
                                     <ImageIcon size={40} opacity={0.5} />
                                     <p className="text-[10px] font-bold mt-2 uppercase tracking-wide">Sem Mídia</p>
                                 </div>
                             )}
                         </div>

                         <div className="flex justify-between items-center px-4 py-3">
                             <div className="flex gap-4">
                                 <Heart size={24} className="text-black" />
                                 <MessageCircle size={24} className="text-black" />
                                 <SendIcon size={24} className="text-black" />
                             </div>
                             <div className="w-6 h-6 flex items-center justify-center">
                                <div className="w-5 h-6 border-2 border-black rounded-sm"></div>
                             </div>
                         </div>

                         <div className="px-4">
                             <p className="text-sm font-bold text-black mb-1">Curtido por você e outras pessoas</p>
                             <div className="text-sm text-black leading-snug">
                                 <span className="font-bold mr-1.5">{selectedClient?.name || 'sua_marca'}</span>
                                 {content || <span className="text-slate-400 italic">Sua legenda aparecerá aqui...</span>}
                             </div>
                             <div className="mt-2 text-blue-900 text-xs">
                                {selectedClient?.customHashtags?.split(' ').map((tag, i) => (
                                    <span key={i} className="mr-1">{tag.startsWith('#') ? tag : `#${tag}`}</span>
                                ))}
                             </div>
                             <p className="text-[10px] text-gray-400 mt-2 uppercase font-medium">Há 2 minutos</p>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Studio;
