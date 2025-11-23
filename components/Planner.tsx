

import React, { useState, useRef } from 'react';
import { Wand2, Loader2, Sparkles, FileOutput, Save, ImageIcon, Clock, Trash2, RotateCw, Send, Bookmark, ChevronLeft, LayoutGrid, Upload, Zap, FileText, CheckCircle2 } from 'lucide-react';
import { Client, Post, PostStatus, SocialPlatform } from '../types';
import { generatePostTopics, generateCaption, generateSingleTopic, TopicSuggestion } from '../services/geminiService';
import { savePostToFirestore, getCurrentUserId } from '../services/firebase';

interface PlannerProps {
  clients: Client[];
  posts: Post[];
  setPosts: (posts: Post[] | ((prevPosts: Post[]) => Post[])) => void;
  onNavigate: (view: string) => void;
}

type PostFormat = 'Post' | 'Reels' | 'Story';

interface DraftPost {
  tempId: number;
  title: string;
  content: string;
  image?: string;
  date: string;
  time: string;
  platforms: SocialPlatform[];
  format: PostFormat;
  isGenerating: boolean;
  isRegeneratingTopic: boolean;
  extraInstruction?: string; 
}

const Planner: React.FC<PlannerProps> = ({ clients, posts, setPosts, onNavigate }) => {
  const [batchClient, setBatchClient] = useState<string>('');
  const [batchMonth, setBatchMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [batchCount, setBatchCount] = useState<number>(12);
  const [campaignFocus, setCampaignFocus] = useState<string>('');
  const [drafts, setDrafts] = useState<DraftPost[]>([]);
  const [step, setStep] = useState<1 | 2>(1);
  const [isBatchLoading, setIsBatchLoading] = useState(false);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [isBulkGeneratingText, setIsBulkGeneratingText] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getClientById = (id: string) => clients.find(c => c.id === id);

  const generateSmartDates = (year: number, monthInput: number, count: number): string[] => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; 
    const today = now.getDate();

    if (year < currentYear || (year === currentYear && monthInput < currentMonth)) {
        year = currentYear;
        monthInput = currentMonth;
    }

    let currentIterDate = new Date(year, monthInput - 1, 1);
    
    if (year === currentYear && monthInput === currentMonth) {
        currentIterDate.setDate(today + 1);
    }

    const dates: string[] = [];
    const daysInMonth = new Date(year, monthInput, 0).getDate();
    const remainingDays = daysInMonth - currentIterDate.getDate();
    
    let stepDay = Math.floor(Math.max(1, remainingDays / count));
    if (stepDay === 0) stepDay = 1;

    for (let i = 0; i < count; i++) {
        const y = currentIterDate.getFullYear();
        const m = String(currentIterDate.getMonth() + 1).padStart(2, '0');
        const d = String(currentIterDate.getDate()).padStart(2, '0');
        dates.push(`${y}-${m}-${d}`);

        currentIterDate.setDate(currentIterDate.getDate() + (stepDay > 1 ? Math.floor(Math.random() * 2) + 1 : 1)); 
    }
    return dates;
  };

  const handleStartBatch = async () => {
    if (!batchClient) {
      alert("Selecione um cliente para continuar.");
      return;
    }
    setIsBatchLoading(true);

    try {
      const clientData = getClientById(batchClient);
      if (!clientData) throw new Error("Client not found");

      const [yearStr, monthStr] = batchMonth.split('-');
      const year = parseInt(yearStr);
      const month = parseInt(monthStr);
      
      const suggestedDates = generateSmartDates(year, month, batchCount);
      
      // Pass full Client object for better context
      const topics: TopicSuggestion[] = await generatePostTopics(
        clientData, 
        `${month}/${year}`,
        batchCount,
        campaignFocus
      );

      const defaultPlatforms = clientData.connectedPlatforms && clientData.connectedPlatforms.length > 0 
         ? clientData.connectedPlatforms 
         : [SocialPlatform.INSTAGRAM];

      const newDrafts: DraftPost[] = topics.map((topic, i) => ({
        tempId: i,
        title: topic.title,
        content: '',
        image: '',
        date: suggestedDates[i] || suggestedDates[suggestedDates.length - 1],
        time: '10:00',
        platforms: defaultPlatforms,
        format: 'Post',
        isGenerating: false,
        isRegeneratingTopic: false,
        extraInstruction: topic.visual_concept || ''
      }));

      setDrafts(newDrafts);
      setStep(2);
    } catch (error) {
      console.error("Erro ao gerar planejamento:", error);
      alert("Erro ao gerar tópicos. Tente novamente.");
    } finally {
      setIsBatchLoading(false);
    }
  };

  const updateDraft = (index: number, field: keyof DraftPost, value: any) => {
    const newDrafts = [...drafts];
    newDrafts[index] = { ...newDrafts[index], [field]: value };
    setDrafts(newDrafts);
  };

  const removeDraft = (index: number) => {
      const newDrafts = drafts.filter((_, i) => i !== index);
      setDrafts(newDrafts);
  };

  const togglePlatform = (index: number, platform: SocialPlatform) => {
      const draft = drafts[index];
      let newPlatforms = [...draft.platforms];
      if (newPlatforms.includes(platform)) {
          newPlatforms = newPlatforms.filter(p => p !== platform);
      } else {
          newPlatforms.push(platform);
      }
      updateDraft(index, 'platforms', newPlatforms);
  };

  const regenerateTopic = async (index: number) => {
      const draft = drafts[index];
      const client = getClientById(batchClient);
      if (!client) return;

      const newDrafts = [...drafts];
      newDrafts[index].isRegeneratingTopic = true;
      setDrafts(newDrafts);
      try {
          const newTopic = await generateSingleTopic(
              client.name, 
              client.industry, 
              campaignFocus || `Conteúdo para ${batchMonth}`
          );
          setDrafts(prev => {
              const updated = [...prev];
              updated[index].title = newTopic;
              updated[index].isRegeneratingTopic = false;
              return updated;
          });
      } catch (e) {
          setDrafts(prev => {
              const updated = [...prev];
              updated[index].isRegeneratingTopic = false;
              return updated;
          });
      }
  };

  const generateDraftCaption = async (index: number) => {
    const draft = drafts[index];
    if (!draft.title) return;
    const client = getClientById(batchClient);
    if (!client) return;

    const newDrafts = [...drafts];
    newDrafts[index].isGenerating = true;
    setDrafts(newDrafts);
    
    try {
      // Pass full client object for Brand DNA
      const generated = await generateCaption(draft.title, client, draft.extraInstruction);
      setDrafts(prev => {
          const updated = [...prev];
          updated[index].content = generated;
          updated[index].isGenerating = false;
          return updated;
      });
    } catch (e) {
      console.error(e);
      setDrafts(prev => {
          const updated = [...prev];
          updated[index].isGenerating = false;
          return updated;
      });
    }
  };

  const triggerImageUpload = (index: number) => {
    setUploadingIndex(index);
    fileInputRef.current?.click();
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && uploadingIndex !== null) {
        const reader = new FileReader();
        reader.onloadend = () => {
            updateDraft(uploadingIndex, 'image', reader.result as string);
            setUploadingIndex(null);
        };
        reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleBulkGenerateCaptions = async () => {
    setIsBulkGeneratingText(true);
    const client = getClientById(batchClient);
    if (!client) return;
    
    setDrafts(prev => prev.map(d => ({...d, isGenerating: true})));

    try {
       const batchSize = 3;
       for (let i = 0; i < drafts.length; i += batchSize) {
           const batch = drafts.slice(i, i + batchSize);
           const results = await Promise.all(batch.map(async (draft) => {
               if (draft.content) return draft.content;
               return await generateCaption(draft.title, client, draft.extraInstruction);
           }));

           setDrafts(prev => {
               const updated = [...prev];
               results.forEach((res, idx) => {
                   updated[i + idx].content = res;
                   updated[i + idx].isGenerating = false;
               });
               return updated;
           });
       }
    } catch (e) {
      console.error("Erro bulk text:", e);
      setDrafts(prev => prev.map(d => ({...d, isGenerating: false})));
    } finally {
      setIsBulkGeneratingText(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };
  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === dropIndex) return;
    const newDrafts = [...drafts];
    const [removed] = newDrafts.splice(draggedItemIndex, 1);
    newDrafts.splice(dropIndex, 0, removed);
    setDrafts(newDrafts);
    setDraggedItemIndex(null);
  };

  const saveBatchPosts = async (targetStatus: PostStatus) => {
    const userId = getCurrentUserId();
    if (!userId) return;
    setIsSaving(true);
    
    await new Promise(resolve => setTimeout(resolve, 500));

    const isBusy = drafts.some(d => d.isGenerating);
    
    if (isBusy) {
        const confirmBusy = window.confirm("A geração de texto ainda está em andamento. Deseja salvar apenas o que já foi concluído?");
        if (!confirmBusy) {
            setIsSaving(false);
            return;
        }
    }

    if (drafts.length === 0) {
        alert("Nenhum post para salvar.");
        setIsSaving(false);
        return;
    }

    try {
      // Execute sequentially to avoid slamming local storage and causing quota errors instantly
      for (let i = 0; i < drafts.length; i++) {
          const draft = drafts[i];
          const uniqueId = Date.now().toString() + Math.random().toString(36).substring(2, 7) + i;
          
          let finalStatus = targetStatus;
          let finalDate = new Date();
          
          if (draft.date) {
              const [yStr, mStr, dStr] = draft.date.split('-');
              const y = parseInt(yStr);
              const m = parseInt(mStr) - 1; 
              const d = parseInt(dStr);
              const [hStr, minStr] = (draft.time || '10:00').split(':');
              const h = parseInt(hStr);
              const min = parseInt(minStr);
              finalDate = new Date(y, m, d, h, min);
              
              if (isNaN(finalDate.getTime())) {
                 finalDate = new Date();
                 if (targetStatus === PostStatus.SCHEDULED) finalStatus = PostStatus.DRAFT;
              } else {
                  const now = new Date();
                  if (targetStatus === PostStatus.SCHEDULED && finalDate < now) {
                      finalStatus = PostStatus.DRAFT;
                  }
              }
          } else {
              if (targetStatus === PostStatus.SCHEDULED) {
                  finalStatus = PostStatus.DRAFT;
              }
          }

          const newPost: Post = {
              id: uniqueId,
              clientId: batchClient,
              title: draft.title || 'Post Sem Título',
              content: draft.content || '',
              image: draft.image || '',
              scheduledDate: finalDate,
              status: finalStatus,
              platforms: draft.platforms.length > 0 ? draft.platforms : [SocialPlatform.INSTAGRAM],
              author: 'IA Planner'
          };

          await savePostToFirestore(userId, newPost);
      }

      setStep(1);
      setBatchClient('');
      setDrafts([]);
      
      // Navigate to correct tab based on status
      setTimeout(() => {
          if (targetStatus === PostStatus.DRAFT || targetStatus === PostStatus.REVIEW) {
              // Usually workflow or scheduler/drafts view
              onNavigate('workflow');
          } else {
              onNavigate('scheduler');
          }
      }, 100);
      
    } catch (error: any) {
      console.error("Erro ao salvar posts:", error);
      if (error.message === "QUOTA_EXCEEDED") {
         alert("Memória cheia! O sistema limpou imagens antigas para liberar espaço. Tente salvar novamente.");
      } else {
         alert("Ocorreu um erro ao salvar os posts. Tente salvar em lotes menores.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col max-w-[1600px] mx-auto animate-fade-in">
      <input 
         type="file" 
         ref={fileInputRef} 
         className="hidden" 
         accept="image/*"
         onChange={handleImageFileChange}
      />

      {step === 1 ? (
         <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center mb-10">
               <div className="w-28 h-28 bg-slate-900 text-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-slate-900/20 rotate-3 hover:rotate-6 transition-transform hover:scale-105 duration-500">
                  <Wand2 size={48} className="text-brand-400" />
               </div>
               <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Planejador Editorial IA</h2>
               <p className="text-slate-500 mt-4 text-lg max-w-md mx-auto leading-relaxed font-medium">
                 Gere conteúdo estratégico usando o <strong>DNA da Marca</strong>. A IA criará legendas curtas e criativas baseadas na persona do cliente.
               </p>
            </div>

            <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-white max-w-2xl w-full relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-brand-100 to-transparent rounded-bl-full -mr-16 -mt-16 opacity-50 pointer-events-none"></div>
               
               <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div>
                     <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3 ml-1">Marca</label>
                     <select 
                        className="w-full px-6 py-4 border border-slate-100 bg-slate-50 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all font-bold text-slate-700 shadow-inner outline-none cursor-pointer"
                        value={batchClient}
                        onChange={(e) => setBatchClient(e.target.value)}
                     >
                        <option value="">Selecione a marca...</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                     </select>
                  </div>
                  <div>
                     <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3 ml-1">Mês de Início</label>
                     <input 
                        type="month" 
                        className="w-full px-6 py-4 border border-slate-100 bg-slate-50 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all font-bold text-slate-700 shadow-inner outline-none cursor-pointer"
                        value={batchMonth}
                        onChange={(e) => setBatchMonth(e.target.value)}
                     />
                  </div>
               </div>

               <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  <div>
                     <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3 ml-1">Quantidade</label>
                     <div className="flex items-center gap-4 bg-slate-50 rounded-2xl px-6 py-3 shadow-inner border border-slate-100">
                        <LayoutGrid size={24} className="text-brand-500" />
                        <input 
                           type="number" 
                           min="1" max="12"
                           className="w-full py-1 bg-transparent outline-none font-bold text-xl text-slate-800"
                           value={batchCount}
                           onChange={(e) => setBatchCount(Math.min(15, parseInt(e.target.value)))}
                        />
                        <span className="text-xs font-bold text-slate-400 uppercase">Posts</span>
                     </div>
                  </div>
                  <div>
                     <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3 ml-1">Foco (Opcional)</label>
                     <input 
                        type="text" 
                        className="w-full px-6 py-4 border border-slate-100 bg-slate-50 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition-all font-medium text-slate-700 shadow-inner"
                        placeholder="Ex: Black Friday..."
                        value={campaignFocus}
                        onChange={(e) => setCampaignFocus(e.target.value)}
                     />
                  </div>
               </div>

               <button 
                  onClick={handleStartBatch}
                  disabled={isBatchLoading}
                  className="relative z-10 w-full py-5 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-brand-600 hover:shadow-xl hover:shadow-brand-500/30 transition-all flex justify-center items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group active:scale-[0.98]"
               >
                  {isBatchLoading ? <Loader2 className="animate-spin" /> : (
                     <>
                        <Sparkles size={20} className="text-brand-400 group-hover:text-white transition-colors" /> 
                        Gerar Planejamento IA
                     </>
                  )}
               </button>
            </div>
         </div>
      ) : (
         <div className="flex-1 flex flex-col overflow-hidden bg-white/30 backdrop-blur-md rounded-[2.5rem] border border-white/50 shadow-soft m-4">
            <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-sm px-8 py-5">
               <div className="flex flex-col xl:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-6 w-full xl:w-auto">
                     <button 
                        onClick={() => setStep(1)} 
                        className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-slate-800 hover:border-brand-200 hover:bg-brand-50 transition-all shadow-sm"
                     >
                        <ChevronLeft size={24} />
                     </button>
                     <div>
                        <h3 className="font-bold text-slate-900 text-2xl leading-none">{getClientById(batchClient)?.name}</h3>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wide mt-1.5 flex items-center gap-2">
                           <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> {batchCount} Ideias Geradas
                        </p>
                     </div>
                  </div>

                  <div className="flex items-center gap-3">
                     <button 
                           onClick={handleBulkGenerateCaptions}
                           disabled={isBulkGeneratingText}
                           className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 shadow-lg shadow-brand-500/20 transition-all disabled:opacity-50 hover:-translate-y-0.5"
                     >
                           {isBulkGeneratingText ? <><Loader2 size={16} className="animate-spin"/> Escrevendo...</> : <><Zap size={16} fill="currentColor" /> Gerar Textos</>}
                     </button>
                  </div>

                  <div className="flex gap-2">
                     <button 
                        onClick={() => saveBatchPosts(PostStatus.DRAFT)} 
                        disabled={isSaving} 
                        className="px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center gap-2"
                        title="Salvar como Rascunho"
                     >
                        <FileText size={18} /> <span className="hidden lg:inline">Rascunho</span>
                     </button>
                     
                     <button 
                        onClick={() => saveBatchPosts(PostStatus.REVIEW)} 
                        disabled={isSaving} 
                        className="px-4 py-3 bg-yellow-100 text-yellow-700 border border-yellow-200 rounded-2xl font-bold text-sm hover:bg-yellow-200 transition-all flex items-center gap-2"
                        title="Enviar para Aprovação"
                     >
                        <CheckCircle2 size={18} /> <span className="hidden lg:inline">Aprovação</span>
                     </button>

                     <button 
                        onClick={() => saveBatchPosts(PostStatus.SCHEDULED)} 
                        disabled={isSaving} 
                        className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-brand-600 shadow-xl shadow-slate-900/20 transition-all flex items-center gap-2 hover:-translate-y-0.5 disabled:opacity-70"
                     >
                        {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Clock size={18} />} 
                        <span className="hidden md:inline">Agendar Tudo</span>
                     </button>
                  </div>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8 pb-20">
                  {drafts.map((draft, index) => (
                  <div 
                     key={index} 
                     className={`bg-white rounded-[2rem] shadow-card border border-white hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col overflow-hidden group relative ${draggedItemIndex === index ? 'opacity-50 border-dashed border-brand-400' : ''}`}
                     draggable
                     onDragStart={(e) => handleDragStart(e, index)}
                     onDragOver={(e) => handleDragOver(e, index)}
                     onDrop={(e) => handleDrop(e, index)}
                  >
                     <div className="p-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                         <div className="flex items-center gap-2">
                            <input 
                                type="date" 
                                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-bold text-slate-700 shadow-sm cursor-pointer hover:border-brand-400 outline-none"
                                value={draft.date}
                                onChange={(e) => updateDraft(index, 'date', e.target.value)}
                            />
                            <input 
                                type="time" 
                                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-bold text-slate-700 shadow-sm cursor-pointer outline-none w-[60px]"
                                value={draft.time}
                                onChange={(e) => updateDraft(index, 'time', e.target.value)}
                            />
                         </div>
                         <button onClick={() => removeDraft(index)} className="text-slate-300 hover:text-red-500 transition-colors p-1 hover:bg-red-50 rounded-full"><Trash2 size={14} /></button>
                     </div>

                     <div className="p-4 bg-slate-50/50 border-b border-slate-100">
                         <div className="flex items-start gap-2 mb-2">
                            <Sparkles size={12} className="text-brand-500 mt-0.5 shrink-0" />
                            <p className="text-xs font-medium text-slate-600 leading-snug">{draft.extraInstruction}</p>
                         </div>
                         <div 
                            onClick={() => triggerImageUpload(index)}
                            className="w-full aspect-[4/2] bg-white border-2 border-dashed border-slate-200 hover:border-brand-400 rounded-xl flex items-center justify-center cursor-pointer group/upload relative overflow-hidden transition-all hover:bg-brand-50/10"
                         >
                             {draft.image ? (
                                 <img src={draft.image} className="w-full h-full object-cover opacity-90 group-hover/upload:opacity-100 transition-opacity" />
                             ) : (
                                 <div className="flex flex-col items-center gap-2 text-slate-400">
                                     <ImageIcon size={20} />
                                     <span className="text-[10px] font-bold uppercase tracking-wide group-hover/upload:text-brand-600">Upload Mídia</span>
                                 </div>
                             )}
                         </div>
                     </div>

                     <div className="p-5 flex flex-col flex-1">
                        <div className="flex-1 relative rounded-xl bg-slate-50 border border-transparent focus-within:bg-white focus-within:border-brand-200 transition-all overflow-hidden p-3 group/text">
                           {draft.isGenerating && (
                               <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
                                   <Loader2 size={20} className="animate-spin text-brand-500" />
                               </div>
                           )}
                           <textarea 
                              className="w-full h-32 text-xs text-slate-600 resize-none border-none outline-none bg-transparent custom-scrollbar font-medium leading-relaxed placeholder:text-slate-300"
                              placeholder="Legenda gerada pela IA..."
                              value={draft.content}
                              onChange={(e) => updateDraft(index, 'content', e.target.value)}
                           />
                           <button 
                                 onClick={() => generateDraftCaption(index)}
                                 disabled={draft.isGenerating}
                                 className="absolute bottom-2 right-2 p-2 bg-white text-brand-600 rounded-xl shadow-md hover:scale-110 transition-transform hover:text-brand-700 border border-slate-100 opacity-0 group-hover/text:opacity-100 focus:opacity-100"
                                 title="Reescrever"
                              >
                                 <Wand2 size={14} />
                           </button>
                        </div>
                     </div>
                  </div>
                  ))}
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default Planner;
