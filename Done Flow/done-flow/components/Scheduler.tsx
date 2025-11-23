

import React, { useState, useMemo, useRef } from 'react';
import { Plus, Sparkles, Image as ImageIcon, X, Save, Wand2, Camera, MoreHorizontal, Heart, MessageCircle, Send as SendIcon, Bookmark, Paintbrush, Trash2, Loader2, Calendar, Layers, Pencil, LayoutGrid, StickyNote, CheckCircle2, AlertCircle, Download, ChevronLeft, ChevronRight, Printer, Filter, Smartphone, Share2, Upload, User, RefreshCcw, FileText } from 'lucide-react';
import { SocialPlatform, PostStatus, Client, Post, User as UserType } from '../types';
import { savePostToFirestore, getCurrentUserId, deletePostFromFirestore } from '../services/firebase';

interface SchedulerProps {
  clients: Client[];
  posts: Post[];
  setPosts: (posts: Post[]) => void;
  onNavigate?: (view: string) => void;
  user: UserType | null;
}

const Scheduler: React.FC<SchedulerProps> = ({ clients, posts, setPosts, onNavigate, user }) => {
  // View States
  const [previewPost, setPreviewPost] = useState<Post | null>(null);
  const [showDraftsSidebar, setShowDraftsSidebar] = useState(true);
  
  // New View Mode State: Calendar vs Feed
  const [viewMode, setViewMode] = useState<'calendar' | 'feed'>('calendar');
  
  // Sidebar Tabs State
  const [sidebarTab, setSidebarTab] = useState<'draft' | 'review' | 'scheduled'>('draft');

  // Global Filter State
  const [filterClientId, setFilterClientId] = useState<string>('');
  
  // Date Navigation State
  const [currentDate, setCurrentDate] = useState(new Date());

  // Drag and Drop State
  const [draggedPostId, setDraggedPostId] = useState<string | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [isOverTrash, setIsOverTrash] = useState(false);
  
  // Trash Accumulation State
  const [trashedPostIds, setTrashedPostIds] = useState<string[]>([]);
  const [showTrashConfirm, setShowTrashConfirm] = useState(false);

  // Feed Drag State
  const [draggedFeedPost, setDraggedFeedPost] = useState<string | null>(null);

  // Upload Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Helpers ---
  const getClientById = (id: string) => clients.find(c => c.id === id);
  
  // Date Safety Helper
  const isValidDate = (d: any) => {
    return d instanceof Date && !isNaN(d.getTime());
  };

  // Month Navigation Helpers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleMonthSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.value) {
          const [year, month] = e.target.value.split('-').map(Number);
          setCurrentDate(new Date(year, month - 1, 1));
      }
  };

  const currentMonthName = currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Calculate Calendar Grid Logic
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday

  // Filter posts for the calendar (Shows everything with a date)
  const calendarPosts = useMemo(() => {
    let p = posts.filter(post => isValidDate(post.scheduledDate) && !trashedPostIds.includes(post.id)); 
    if (filterClientId) {
      p = p.filter(post => post.clientId === filterClientId);
    }
    // Also filter by current month view for the PDF export to be relevant to what's seen
    return p;
  }, [posts, filterClientId, trashedPostIds]);

  // Feed Posts (Sorted by Date DESC for Instagram Grid Look)
  const feedPosts = useMemo(() => {
    let p = posts.filter(post => isValidDate(post.scheduledDate) && (post.status === PostStatus.SCHEDULED || post.status === PostStatus.PUBLISHED || post.status === PostStatus.REVIEW) && !trashedPostIds.includes(post.id));
    if (filterClientId) {
      p = p.filter(post => post.clientId === filterClientId);
    }
    // Sort Newest First (Top of Feed) to match Instagram Layout
    return p.sort((a, b) => b.scheduledDate.getTime() - a.scheduledDate.getTime());
  }, [posts, filterClientId, trashedPostIds]);

  // Sidebar Lists Logic
  const sidebarList = useMemo(() => {
    let filtered = posts.filter(p => !trashedPostIds.includes(p.id));
    
    // 1. Filter by Client if selected
    if (filterClientId) {
      filtered = filtered.filter(post => post.clientId === filterClientId);
    }

    // 2. Filter by Tab Status
    if (sidebarTab === 'draft') {
       return filtered.filter(p => p.status === PostStatus.DRAFT).sort((a, b) => {
          const idA = Number(a.id);
          const idB = Number(b.id);
          if (!isNaN(idA) && !isNaN(idB)) return idB - idA;
          return b.id.localeCompare(a.id);
       });
    } else if (sidebarTab === 'review') {
       return filtered.filter(p => p.status === PostStatus.REVIEW).sort((a, b) => {
         const dateA = isValidDate(a.scheduledDate) ? a.scheduledDate.getTime() : 0;
         const dateB = isValidDate(b.scheduledDate) ? b.scheduledDate.getTime() : 0;
         return dateA - dateB;
       });
    } else {
       return filtered.filter(p => p.status === PostStatus.SCHEDULED || p.status === PostStatus.PUBLISHED).sort((a, b) => {
         const dateA = isValidDate(a.scheduledDate) ? a.scheduledDate.getTime() : 0;
         const dateB = isValidDate(b.scheduledDate) ? b.scheduledDate.getTime() : 0;
         return dateA - dateB;
       });
    }
  }, [posts, filterClientId, sidebarTab, trashedPostIds]);

  // --- Handlers ---

  const handleExportPDF = () => {
    // 1. Determine what to export
    // Filter posts for the currently selected month and client
    const postsToExport = calendarPosts.filter(p => {
        return p.scheduledDate.getMonth() === currentMonth && 
               p.scheduledDate.getFullYear() === currentYear;
    }).sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime());

    if (postsToExport.length === 0) {
        alert("Nenhum post agendado para este mês/cliente.");
        return;
    }

    const clientName = filterClientId ? getClientById(filterClientId)?.name : 'Múltiplos Clientes';
    const agencyName = user?.agencyName || 'Done Flow Agência';
    
    // 2. Open Print Window
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // 3. Generate HTML
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Calendário Editorial - ${clientName}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&display=swap');
                body { font-family: 'Manrope', sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                @media print { 
                    .no-print { display: none; } 
                    .page-break { page-break-inside: avoid; }
                }
            </style>
        </head>
        <body class="bg-white p-8 md:p-12">
            <div class="max-w-5xl mx-auto">
                <!-- Header -->
                <div class="flex justify-between items-end mb-12 border-b-4 border-slate-900 pb-6">
                    <div>
                        <div class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Calendário de Conteúdo</div>
                        <h1 class="text-4xl font-extrabold text-slate-900">${clientName}</h1>
                        <p class="text-slate-600 font-bold text-lg mt-2 capitalize">${currentMonthName}</p>
                    </div>
                    <div class="text-right">
                        <div class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Agência Responsável</div>
                        <div class="font-extrabold text-slate-800 text-xl">${agencyName}</div>
                        <div class="text-slate-500 text-sm mt-1">Gerado em ${new Date().toLocaleDateString('pt-BR')}</div>
                    </div>
                </div>

                <!-- Posts Grid -->
                <div class="grid grid-cols-1 gap-12">
                    ${postsToExport.map((post, i) => {
                        const client = getClientById(post.clientId);
                        return `
                        <div class="flex flex-col md:flex-row gap-8 p-0 page-break">
                            <!-- Image Section -->
                            <div class="w-full md:w-64 shrink-0">
                                <div class="aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm relative">
                                    ${post.image 
                                        ? `<img src="${post.image}" class="w-full h-full object-cover" />` 
                                        : `<div class="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mb-2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                                            <span class="text-xs font-bold uppercase">Sem Mídia</span>
                                           </div>`
                                    }
                                    <div class="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-[10px] font-bold shadow-sm">
                                        Post #${i + 1}
                                    </div>
                                </div>
                            </div>

                            <!-- Content Section -->
                            <div class="flex-1">
                                <div class="flex flex-wrap gap-4 items-center mb-4 pb-4 border-b border-slate-100">
                                    <div class="flex items-center gap-2">
                                        <div class="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide">
                                            ${new Date(post.scheduledDate).toLocaleDateString('pt-BR')}
                                        </div>
                                        <div class="text-slate-500 font-bold text-sm">
                                            ${new Date(post.scheduledDate).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                                        </div>
                                    </div>
                                    <div class="flex gap-1">
                                        ${post.platforms.map(p => `<span class="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-[10px] font-bold text-slate-600">${p}</span>`).join('')}
                                    </div>
                                    <div class="ml-auto text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        ${post.status}
                                    </div>
                                </div>

                                <div class="mb-6">
                                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Título / Conceito</div>
                                    <h3 class="font-bold text-slate-900 text-lg leading-tight">${post.title}</h3>
                                </div>

                                <div class="bg-slate-50 p-6 rounded-2xl border border-slate-100 relative">
                                    <div class="absolute -top-2.5 left-4 bg-white px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-slate-100 rounded">Legenda</div>
                                    <p class="text-slate-700 text-sm whitespace-pre-line leading-relaxed font-medium">${post.content || '<em class="text-slate-400">Texto pendente...</em>'}</p>
                                </div>
                            </div>
                        </div>
                        <hr class="border-slate-100 my-8"/>
                        `;
                    }).join('')}
                </div>

                <!-- Signature Section -->
                <div class="mt-16 pt-12 border-t-2 border-slate-900 page-break">
                    <h3 class="text-lg font-bold text-slate-900 mb-8 uppercase tracking-wide">Aprovação</h3>
                    <div class="flex flex-col md:flex-row gap-12 justify-between items-end">
                        <div class="flex-1 w-full">
                            <div class="border-b border-slate-400 pb-2 mb-2"></div>
                            <p class="text-xs font-bold text-slate-500 uppercase">Assinatura do Cliente</p>
                        </div>
                         <div class="w-full md:w-48">
                            <div class="border-b border-slate-400 pb-2 mb-2"></div>
                            <p class="text-xs font-bold text-slate-500 uppercase">Data</p>
                        </div>
                    </div>
                    <div class="mt-8 flex gap-4">
                        <div class="flex items-center gap-2 text-sm font-bold text-slate-600">
                            <div class="w-4 h-4 border border-slate-400 rounded"></div> Aprovado
                        </div>
                        <div class="flex items-center gap-2 text-sm font-bold text-slate-600">
                            <div class="w-4 h-4 border border-slate-400 rounded"></div> Aprovado com alterações
                        </div>
                        <div class="flex items-center gap-2 text-sm font-bold text-slate-600">
                            <div class="w-4 h-4 border border-slate-400 rounded"></div> Reprovado
                        </div>
                    </div>
                </div>
            </div>
            <script>
                // Auto-print when loaded
                window.onload = () => { 
                    setTimeout(() => {
                        window.print();
                    }, 500);
                }
            </script>
        </body>
        </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const updatePostStatus = (postId: string, newStatus: PostStatus) => {
      const updatedPosts = posts.map(p => p.id === postId ? { ...p, status: newStatus } : p);
      setPosts(updatedPosts);
      if (previewPost && previewPost.id === postId) setPreviewPost({ ...previewPost, status: newStatus });
      
      // Also save to backend if we were in production
      const userId = getCurrentUserId();
      if (userId) {
          const post = updatedPosts.find(p => p.id === postId);
          if (post) savePostToFirestore(userId, post);
      }
  };

  const handleDeletePost = (postId: string, skipConfirm: boolean = false) => {
    if (skipConfirm || window.confirm("Tem certeza que deseja excluir este post?")) {
      // Optimistic update
      setPosts(posts.filter(p => p.id !== postId));
      setPreviewPost(null);

      // Backend Update
      const userId = getCurrentUserId();
      if (userId) {
          deletePostFromFirestore(userId, postId);
      }
    }
  };

  const handleEmptyTrash = () => {
    // Permanently delete all items currently in trash
    const userId = getCurrentUserId();
    if (userId) {
        trashedPostIds.forEach(id => {
            deletePostFromFirestore(userId, id);
        });
    }

    setPosts(posts.filter(p => !trashedPostIds.includes(p.id)));
    setTrashedPostIds([]);
    setShowTrashConfirm(false);
    setPreviewPost(null);
  };

  const handleRestoreTrash = () => {
    // Restore items (clear the trash list without deleting from main state)
    setTrashedPostIds([]);
    setShowTrashConfirm(false);
  };

  // IMAGE UPLOAD HANDLER (PREVIEW MODAL)
  const handlePreviewImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && previewPost) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            
            // Update Preview State
            setPreviewPost({ ...previewPost, image: base64String });
            
            // Update Main Posts State
            const updatedPosts = posts.map(p => p.id === previewPost.id ? { ...p, image: base64String } : p);
            setPosts(updatedPosts);

            // Save to backend
            const userId = getCurrentUserId();
            if (userId) {
                 const updatedPost = updatedPosts.find(p => p.id === previewPost.id);
                 if (updatedPost) savePostToFirestore(userId, updatedPost);
            }
        };
        reader.readAsDataURL(file);
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  // DRAG AND DROP HANDLERS (Calendar)
  const handleDragStart = (e: React.DragEvent, postId: string) => {
    setDraggedPostId(postId);
    e.dataTransfer.effectAllowed = "move";
  };
  const handleCalendarDragOver = (e: React.DragEvent, dateKey: string) => {
    e.preventDefault(); e.dataTransfer.dropEffect = "move"; setDragOverDate(dateKey);
  };
  const handleCalendarDragLeave = (e: React.DragEvent) => {
    e.preventDefault(); setDragOverDate(null);
  };
  const handleCalendarDrop = (e: React.DragEvent, day: number, monthIndex: number, year: number) => {
    e.preventDefault(); setDragOverDate(null);
    if (!draggedPostId) return;
    
    const newDate = new Date(year, monthIndex, day);
    const today = new Date();
    today.setHours(0,0,0,0);

    if (newDate < today) {
        alert("Não é possível mover um post para uma data passada.");
        return;
    }

    const updatedPosts = posts.map(p => {
      if (p.id === draggedPostId) {
        const originalTime = isValidDate(p.scheduledDate) ? {h: p.scheduledDate.getHours(), m: p.scheduledDate.getMinutes()} : {h: 10, m: 0};
        const dateWithTime = new Date(year, monthIndex, day, originalTime.h, originalTime.m);
        const newStatus = p.status === PostStatus.DRAFT ? PostStatus.SCHEDULED : p.status;
        return { ...p, scheduledDate: dateWithTime, status: newStatus };
      }
      return p;
    });
    setPosts(updatedPosts);
    
    // Save moved post
    const userId = getCurrentUserId();
    if (userId) {
        const post = updatedPosts.find(p => p.id === draggedPostId);
        if (post) savePostToFirestore(userId, post);
    }
    
    setDraggedPostId(null);
  };

  // Trash Drop Handlers
  const handleTrashDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsOverTrash(true);
  };

  const handleTrashDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOverTrash(false);
  };

  const handleTrashDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOverTrash(false);
    
    const idToDelete = draggedPostId || draggedFeedPost;

    if (idToDelete && !trashedPostIds.includes(idToDelete)) {
        // Instead of deleting immediately, add to the trash accumulation list
        setTrashedPostIds(prev => [...prev, idToDelete]);
        setDraggedPostId(null);
        setDraggedFeedPost(null);
    }
  };

  // DRAG AND DROP HANDLERS (Feed)
  const handleFeedDragStart = (e: React.DragEvent, postId: string) => {
    setDraggedFeedPost(postId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleFeedDrop = (e: React.DragEvent, targetPostId: string) => {
      e.preventDefault();
      if (!draggedFeedPost || draggedFeedPost === targetPostId) return;

      const sourcePost = posts.find(p => p.id === draggedFeedPost);
      const targetPost = posts.find(p => p.id === targetPostId);

      if (sourcePost && targetPost) {
          // SWAP DATES LOGIC
          const sourceDate = new Date(sourcePost.scheduledDate);
          const targetDate = new Date(targetPost.scheduledDate);

          const updatedPosts = posts.map(p => {
              if (p.id === draggedFeedPost) return { ...p, scheduledDate: targetDate };
              if (p.id === targetPostId) return { ...p, scheduledDate: sourceDate };
              return p;
          });
          
          setPosts(updatedPosts);
          
          // Save swapped posts
          const userId = getCurrentUserId();
          if (userId) {
             const p1 = updatedPosts.find(p => p.id === draggedFeedPost);
             const p2 = updatedPosts.find(p => p.id === targetPostId);
             if (p1) savePostToFirestore(userId, p1);
             if (p2) savePostToFirestore(userId, p2);
          }
      }
      setDraggedFeedPost(null);
  };

  return (
    <div className="p-6 md:p-10 h-full flex flex-col max-w-[1600px] mx-auto animate-fade-in">
      {/* Hidden File Input for Preview Modal */}
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePreviewImageUpload} />

      {/* Top Navigation Bar */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Calendário</h2>
          <p className="text-slate-500 font-medium mt-1">Organize o futuro da sua marca.</p>
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-center w-full xl:w-auto justify-end">
           
           {/* View Toggle */}
           <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
              <button 
                  onClick={() => setViewMode('calendar')} 
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${viewMode === 'calendar' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                  <Calendar size={16} /> Calendário
              </button>
              <button 
                  onClick={() => setViewMode('feed')} 
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${viewMode === 'feed' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                  <Smartphone size={16} /> Feed Preview
              </button>
           </div>

          {/* Client Filter */}
          <div className="flex items-center gap-3 bg-white p-2 border border-slate-200 rounded-2xl shadow-sm overflow-x-auto max-w-full scrollbar-hide">
             <div className="flex items-center px-1 gap-2">
               <button 
                onClick={() => setFilterClientId('')} 
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all relative group shrink-0 ${filterClientId === '' ? 'border-brand-600 bg-brand-50 text-brand-600 z-10 shadow-sm scale-105' : 'border-transparent bg-slate-100 text-slate-400 hover:bg-slate-200'}`} 
                title="Todos"
               >
                  <LayoutGrid size={16} />
               </button>
               {clients.map(client => (
                 <button 
                    key={client.id} 
                    onClick={() => setFilterClientId(client.id)} 
                    className={`w-9 h-9 rounded-full border-2 overflow-hidden transition-all relative group bg-white shrink-0 ${filterClientId === client.id ? 'border-brand-600 z-10 shadow-sm scale-105' : 'border-transparent grayscale opacity-70 hover:grayscale-0 hover:opacity-100'}`} 
                    title={client.name}
                 >
                   <img src={client.logo} alt={client.name} className="w-full h-full object-cover" />
                 </button>
               ))}
            </div>
          </div>

          <div className="flex gap-3 flex-wrap justify-end">
            <button 
               onClick={handleExportPDF}
               className="bg-white border border-slate-200 hover:border-brand-300 text-slate-700 hover:text-brand-700 px-4 py-3 rounded-2xl flex items-center gap-2 shadow-sm transition-all font-bold text-xs"
               title="Exportar Calendário para PDF"
            >
              <FileText size={18} /> Exportar PDF
            </button>

            <button onClick={() => setShowDraftsSidebar(!showDraftsSidebar)} className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-all font-medium whitespace-nowrap ${showDraftsSidebar ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              <Layers size={20} />
            </button>
            <button 
              onClick={() => onNavigate && onNavigate('studio')} 
              className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-brand-500/20 transition-all font-bold whitespace-nowrap hover:-translate-y-0.5"
            >
              <Plus size={20} /> Novo Post
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-8 flex-1 overflow-hidden">
        {/* Main Content Area: Calendar or Feed */}
        {viewMode === 'calendar' ? (
            <div className="bg-white rounded-[32px] shadow-card border border-slate-100 flex-1 p-6 md:p-10 overflow-hidden flex flex-col relative z-10 group/calendar">
                {/* Calendar Navigation */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            {/* Native Month Picker */}
                            <input 
                                type="month" 
                                value={currentDate.toISOString().slice(0, 7)}
                                onChange={handleMonthSelect}
                                className="absolute inset-0 opacity-0 cursor-pointer z-20 w-full"
                            />
                            <h3 className="text-2xl font-extrabold text-slate-800 capitalize flex items-center gap-2 cursor-pointer group-hover:text-brand-600 transition-colors">
                                {currentMonthName} <Calendar size={20} className="text-slate-300 group-hover:text-brand-400" />
                            </h3>
                        </div>
                        <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
                            <button onClick={handlePrevMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-500"><ChevronLeft size={20} /></button>
                            <button onClick={handleNextMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-500"><ChevronRight size={20} /></button>
                        </div>
                    </div>
                </div>

                {/* Scrollable Calendar Container for Mobile Responsiveness */}
                <div className="flex-1 overflow-auto custom-scrollbar relative bg-white rounded-2xl">
                    <div className="min-w-[800px] h-full">
                        <div className="grid grid-cols-7 gap-px bg-slate-100 border border-slate-200 rounded-t-2xl overflow-hidden mb-4">
                            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                                <div key={day} className="bg-slate-50 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">{day}</div>
                            ))}
                        </div>
                        
                        <div className="grid grid-cols-7 gap-4 auto-rows-fr min-h-[600px]">
                            {/* Empty slots for start of month */}
                            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                                <div key={`empty-${i}`} className="bg-transparent p-2"></div>
                            ))}
                            
                            {/* Days */}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1;
                                const dateKey = `${day}-${currentMonth}`;
                                
                                const dayPosts = calendarPosts.filter(p => {
                                    if (!isValidDate(p.scheduledDate)) return false;
                                    return p.scheduledDate.getDate() === day && p.scheduledDate.getMonth() === currentMonth && p.scheduledDate.getFullYear() === currentYear;
                                });
                                
                                // Use timezone aware current date for highlighting 'today'
                                const today = new Date();
                                const isToday = today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear;
                                
                                // Past Date Visual Cue
                                const isPast = new Date(currentYear, currentMonth, day).getTime() < new Date().setHours(0,0,0,0);
                                
                                const isDragOver = dragOverDate === dateKey;

                                return (
                                <div 
                                    key={i} 
                                    onDragOver={(e) => handleCalendarDragOver(e, dateKey)}
                                    onDragLeave={handleCalendarDragLeave}
                                    onDrop={(e) => handleCalendarDrop(e, day, currentMonth, currentYear)}
                                    className={`border rounded-2xl p-3 transition-all relative flex flex-col gap-2 min-h-[140px] group ${
                                        isDragOver ? 'bg-brand-50 border-brand-400 border-dashed scale-[1.02] z-10 shadow-lg' : 
                                        isToday ? 'border-brand-200 bg-white shadow-card ring-4 ring-brand-50/50' : 
                                        isPast ? 'bg-slate-50/50 border-slate-100' : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-sm'
                                    }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <span className={`text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full ${isToday ? 'bg-brand-600 text-white' : isPast ? 'text-slate-400' : 'text-slate-700 bg-slate-100'}`}>{day}</span>
                                        <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-brand-600 transition-all p-1 hover:bg-slate-100 rounded-lg">
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                    
                                    {dayPosts.map((post) => {
                                        const postClient = getClientById(post.clientId);
                                        const borderColor = postClient?.brandColor || '#3b82f6';
                                        
                                        return (
                                        <div 
                                            key={post.id} 
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, post.id)}
                                            onClick={() => setPreviewPost(post)}
                                            className={`p-2.5 rounded-xl shadow-sm text-xs cursor-grab active:cursor-grabbing hover:shadow-md transition-all flex gap-2.5 items-center bg-white border border-slate-100 hover:border-brand-200 group/card relative overflow-hidden hover:-translate-y-0.5`}
                                        >
                                            <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: borderColor }}></div>
                                            {post.image ? (
                                                <div className="w-9 h-9 rounded-lg bg-slate-100 shrink-0 overflow-hidden">
                                                    <img src={post.image} className="w-full h-full object-cover" alt="" />
                                                </div>
                                            ) : (
                                                <div className="w-9 h-9 rounded-lg bg-slate-100 shrink-0 flex items-center justify-center text-slate-400">
                                                    <ImageIcon size={14} />
                                                </div>
                                            )}
                                            
                                            <div className="min-w-0 flex-1">
                                                <p className="font-bold text-slate-800 truncate leading-tight mb-0.5">{postClient?.name || 'Sem Marca'}</p>
                                                <p className="text-[10px] text-slate-500 truncate">{post.title}</p>
                                            </div>

                                            {post.status === PostStatus.REVIEW && <div className="w-2 h-2 rounded-full bg-yellow-400 shrink-0 animate-pulse shadow-sm" />}
                                        </div>
                                        );
                                    })}
                                </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                
                 {/* Trash Bin Drop Zone */}
                <div 
                    onDragOver={handleTrashDragOver}
                    onDragLeave={handleTrashDragLeave}
                    onDrop={handleTrashDrop}
                    onClick={() => trashedPostIds.length > 0 && setShowTrashConfirm(true)}
                    className={`absolute bottom-6 right-6 p-6 rounded-full border-2 transition-all duration-300 flex items-center justify-center z-30 ${
                        isOverTrash 
                        ? 'bg-red-500 border-red-600 scale-125 shadow-xl text-white' 
                        : trashedPostIds.length > 0
                            ? 'bg-white border-red-200 text-red-500 scale-100 shadow-xl cursor-pointer hover:scale-105 hover:bg-red-50'
                            : draggedPostId 
                                ? 'bg-white border-red-200 text-red-300 scale-100 shadow-lg translate-y-0' 
                                : 'bg-transparent border-transparent text-transparent scale-50 translate-y-20 pointer-events-none'
                    }`}
                >
                    <Trash2 size={32} strokeWidth={2.5} className={isOverTrash ? 'animate-bounce' : ''} />
                    {trashedPostIds.length > 0 && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-600 text-white text-xs font-bold flex items-center justify-center rounded-full shadow-sm animate-scale-up">
                            {trashedPostIds.length}
                        </div>
                    )}
                </div>

            </div>
        ) : (
            // FEED PREVIEW MODE (Aesthetics Upgrade)
            <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-[32px] shadow-card flex-1 p-4 md:p-8 overflow-hidden flex flex-col items-center justify-center relative z-10">
                {filterClientId ? (
                    <div className="relative animate-fade-in w-full flex justify-center h-full overflow-y-auto custom-scrollbar">
                        {/* iPhone Frame - Responsive Scaling for Mobile */}
                        <div className="w-[380px] h-[800px] bg-slate-900 rounded-[3.5rem] p-3 shadow-2xl ring-4 ring-slate-200 relative transform scale-[0.85] sm:scale-100 transition-transform origin-top mt-4 mb-20 border-[6px] border-slate-900">
                             {/* Notch */}
                             <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-7 w-40 bg-slate-900 rounded-b-3xl z-30 flex justify-center items-center">
                                 <div className="w-20 h-4 bg-black rounded-b-2xl"></div>
                             </div>

                             <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden flex flex-col relative">
                                 
                                 {/* iOS Status Bar Mock */}
                                 <div className="h-12 bg-white flex justify-between items-end px-6 pb-2 shrink-0 z-20 select-none">
                                     <span className="text-[12px] font-bold text-slate-900">9:41</span>
                                     <div className="flex gap-1.5 items-center">
                                         <div className="h-2.5 w-4 bg-slate-900 rounded-[2px]"></div>
                                         <div className="h-2.5 w-3.5 bg-slate-900 rounded-[2px]"></div>
                                         <div className="h-2.5 w-5 bg-slate-300 rounded-[2px] relative border border-slate-900">
                                             <div className="absolute inset-0.5 bg-slate-900 w-[70%]"></div>
                                         </div>
                                     </div>
                                 </div>

                                 {/* Instagram Header */}
                                 <div className="h-12 border-b border-slate-50 flex items-center justify-between px-4 bg-white shrink-0 z-10">
                                     <div className="w-8"></div> {/* Spacer */}
                                     <div className="flex flex-col items-center">
                                         <span className="text-xs font-bold text-slate-900 flex items-center gap-1 uppercase tracking-wide">
                                            {getClientById(filterClientId)?.name.toLowerCase().replace(/\s/g, '')} <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                         </span>
                                     </div>
                                     <MoreHorizontal size={20} className="text-slate-900" />
                                 </div>

                                 {/* Profile Stats (Mock) */}
                                 <div className="px-4 py-4 flex items-center gap-6 border-b border-slate-50 bg-white shrink-0 z-10">
                                    <div className="w-20 h-20 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-purple-600 shrink-0">
                                        <img src={getClientById(filterClientId)?.logo} className="w-full h-full rounded-full border-2 border-white object-cover" />
                                    </div>
                                    <div className="flex-1 flex justify-around text-center">
                                        <div>
                                            <div className="text-sm font-bold text-slate-900">{feedPosts.length}</div>
                                            <div className="text-[10px] text-slate-500 font-medium">Posts</div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-900">14.2K</div>
                                            <div className="text-[10px] text-slate-500 font-medium">Seguidores</div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-900">120</div>
                                            <div className="text-[10px] text-slate-500 font-medium">Seguindo</div>
                                        </div>
                                    </div>
                                 </div>

                                 {/* Bio (Mock) */}
                                 <div className="px-4 pb-4 bg-white text-xs shrink-0 z-10 space-y-1">
                                     <p className="font-bold text-slate-900 text-sm">{getClientById(filterClientId)?.name}</p>
                                     <p className="text-slate-500 font-medium">{getClientById(filterClientId)?.industry} • Agência Criativa</p>
                                     <p className="text-slate-800">Helping brands grow through AI-driven content strategies. 🚀</p>
                                     <p className="text-blue-900 font-bold">www.{getClientById(filterClientId)?.name.toLowerCase().replace(/\s/g, '')}.com</p>
                                 </div>

                                 {/* Tabs */}
                                 <div className="flex border-t border-slate-100 shrink-0">
                                     <div className="flex-1 py-2 flex justify-center border-b-2 border-black"><LayoutGrid size={20} /></div>
                                     <div className="flex-1 py-2 flex justify-center text-slate-400"><Smartphone size={20} /></div>
                                 </div>
                                 
                                 {/* Feed Grid */}
                                 <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
                                     <div className="grid grid-cols-3 gap-0.5 pb-20">
                                         {feedPosts.map(post => (
                                             <div 
                                                key={post.id} 
                                                className={`aspect-square bg-slate-100 relative group cursor-grab active:cursor-grabbing overflow-hidden ${draggedFeedPost === post.id ? 'opacity-50 ring-4 ring-brand-500 z-20' : ''}`}
                                                draggable
                                                onDragStart={(e) => handleFeedDragStart(e, post.id)}
                                                onDragOver={(e) => e.preventDefault()}
                                                onDrop={(e) => handleFeedDrop(e, post.id)}
                                                onClick={() => setPreviewPost(post)}
                                            >
                                                 {post.image ? (
                                                     <img src={post.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                 ) : (
                                                     <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                                                         <ImageIcon size={20} />
                                                     </div>
                                                 )}
                                                 
                                                 {/* Hover Overlay Info */}
                                                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-2">
                                                     <Heart size={16} className="fill-white mb-1" />
                                                     <span className="text-[10px] font-bold">
                                                         {post.scheduledDate.toLocaleDateString(undefined, {day: '2-digit', month: '2-digit'})}
                                                     </span>
                                                 </div>
                                                 
                                                 {/* Review Indicator */}
                                                 {post.status === PostStatus.REVIEW && (
                                                    <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full shadow-sm border border-white z-10"></div>
                                                 )}
                                             </div>
                                         ))}
                                         
                                         {/* Placeholders to fill grid if few posts */}
                                         {Array.from({ length: Math.max(0, 12 - feedPosts.length) }).map((_, i) => (
                                             <div key={`ph-${i}`} className="aspect-square bg-slate-50 opacity-40 border border-white"></div>
                                         ))}
                                     </div>
                                 </div>

                                 {/* Bottom Nav Mockup */}
                                 <div className="h-16 bg-white border-t border-slate-100 flex justify-around items-center px-2 shrink-0 absolute bottom-0 w-full z-20">
                                     <div className="p-2"><div className="w-6 h-6 bg-slate-900 rounded-lg"></div></div>
                                     <div className="p-2"><div className="w-6 h-6 bg-slate-300 rounded-full"></div></div>
                                     <div className="p-2"><div className="w-6 h-6 bg-slate-300 rounded-lg"></div></div>
                                     <div className="p-2"><div className="w-6 h-6 bg-slate-300 rounded-full"></div></div>
                                     <div className="p-2"><div className="w-6 h-6 rounded-full bg-slate-200 border border-slate-300"></div></div>
                                 </div>
                             </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center p-12 bg-white rounded-[2.5rem] shadow-floating border border-slate-100 max-w-md animate-fade-in">
                        <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-600">
                            <LayoutGrid size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">Visualizar Feed</h3>
                        <p className="text-slate-500 font-medium mb-8 leading-relaxed">Selecione um cliente para ver como o grid vai ficar. Arraste e solte posts para reorganizar o visual.</p>
                        <div className="flex justify-center -space-x-4 hover:space-x-1 transition-all duration-300">
                            {clients.slice(0, 5).map(c => (
                                <button key={c.id} onClick={() => setFilterClientId(c.id)} className="w-12 h-12 rounded-full border-4 border-white overflow-hidden hover:scale-110 hover:z-10 transition-transform shadow-md relative group" title={c.name}>
                                    <img src={c.logo} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                
                 {/* Trash Bin Drop Zone (Feed View) */}
                 <div 
                    onDragOver={handleTrashDragOver}
                    onDragLeave={handleTrashDragLeave}
                    onDrop={handleTrashDrop}
                    onClick={() => trashedPostIds.length > 0 && setShowTrashConfirm(true)}
                    className={`absolute bottom-6 right-6 p-6 rounded-full border-2 transition-all duration-300 flex items-center justify-center z-30 ${
                        isOverTrash 
                        ? 'bg-red-500 border-red-600 scale-125 shadow-xl text-white' 
                        : trashedPostIds.length > 0
                            ? 'bg-white border-red-200 text-red-500 scale-100 shadow-xl cursor-pointer hover:scale-105 hover:bg-red-50'
                            : draggedFeedPost 
                                ? 'bg-white border-red-200 text-red-300 scale-100 shadow-lg translate-y-0' 
                                : 'bg-transparent border-transparent text-transparent scale-50 translate-y-20 pointer-events-none'
                    }`}
                >
                    <Trash2 size={32} strokeWidth={2.5} className={isOverTrash ? 'animate-bounce' : ''} />
                    {trashedPostIds.length > 0 && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-600 text-white text-xs font-bold flex items-center justify-center rounded-full shadow-sm animate-scale-up">
                            {trashedPostIds.length}
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* Unified Sidebar */}
        {showDraftsSidebar && (
            <div className="w-80 bg-white/90 backdrop-blur-md border-l border-white/20 rounded-2xl flex-col animate-fade-in transition-all hidden lg:flex shadow-2xl shadow-slate-200/50 z-10 h-full">
                <div className="flex border-b border-slate-100">
                  <button onClick={() => setSidebarTab('draft')} className={`flex-1 py-4 text-xs font-bold uppercase tracking-wide flex flex-col items-center gap-1 border-b-2 transition-colors ${sidebarTab === 'draft' ? 'border-brand-600 text-brand-600 bg-brand-50/20' : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}> Rascunhos</button>
                  <button onClick={() => setSidebarTab('review')} className={`flex-1 py-4 text-xs font-bold uppercase tracking-wide flex flex-col items-center gap-1 border-b-2 transition-colors ${sidebarTab === 'review' ? 'border-yellow-500 text-yellow-600 bg-yellow-50/20' : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}> Review</button>
                  <button onClick={() => setSidebarTab('scheduled')} className={`flex-1 py-4 text-xs font-bold uppercase tracking-wide flex flex-col items-center gap-1 border-b-2 transition-colors ${sidebarTab === 'scheduled' ? 'border-green-500 text-green-600 bg-green-50/20' : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}> Agenda</button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3 bg-slate-50/30">
                    {sidebarList.length === 0 ? (
                        <div className="text-center py-20 text-slate-400">
                            <Layers size={40} className="mx-auto mb-4 opacity-20" />
                            <p className="text-sm font-bold">Nenhum post aqui.</p>
                        </div>
                    ) : sidebarList.map(post => (
                        <div key={post.id} draggable onDragStart={(e) => handleDragStart(e, post.id)} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-brand-300 cursor-grab active:cursor-grabbing group relative transition-all hover:-translate-y-0.5" onClick={() => setPreviewPost(post)}>
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2">
                                    <img src={getClientById(post.clientId)?.logo} className="w-6 h-6 rounded-full object-cover border border-slate-100" alt="" />
                                    <span className="text-xs font-bold text-slate-800">{getClientById(post.clientId)?.name}</span>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); handleDeletePost(post.id); }} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><X size={14} /></button>
                            </div>
                            <h4 className="text-sm font-bold text-slate-800 mb-1 line-clamp-1 leading-tight">{post.title}</h4>
                            <p className="text-xs text-slate-500 line-clamp-2 mb-3 font-medium leading-relaxed">{post.content || 'Sem conteúdo...'}</p>
                            
                            <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                {isValidDate(post.scheduledDate) ? (
                                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 bg-slate-50 px-2 py-1 rounded">
                                        <Calendar size={10} /> {post.scheduledDate.toLocaleDateString('pt-BR')}
                                    </span>
                                ) : <span className="text-[10px] font-bold text-slate-300 italic">Sem data</span>}
                                {post.image && <ImageIcon size={14} className="text-slate-300" />}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>

      {/* Preview Modal (with Upload Feature) */}
      {previewPost && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
           <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] relative">
              <button onClick={() => setPreviewPost(null)} className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 z-20"><X size={24} /></button>
              
              <div className="flex-1 p-8 md:p-12 flex flex-col overflow-y-auto">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${previewPost.status === PostStatus.DRAFT ? 'bg-slate-100 text-slate-600' : previewPost.status === PostStatus.SCHEDULED ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>{previewPost.status}</span>
                        <span className="text-slate-400 text-xs font-bold">•</span>
                        <span className="text-slate-500 text-xs font-bold">{isValidDate(previewPost.scheduledDate) ? previewPost.scheduledDate.toLocaleString() : 'Data não definida'}</span>
                    </div>
                    <h3 className="text-3xl font-extrabold text-slate-900 leading-tight">{previewPost.title}</h3>
                </div>
                
                <div className="space-y-8 flex-1">
                   <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-base text-slate-700 whitespace-pre-line font-medium leading-relaxed shadow-inner">
                        {previewPost.content}
                   </div>

                   <div className="mt-auto">
                       <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Ações Rápidas</h4>
                       <div className="grid grid-cols-3 gap-3">
                          <button onClick={() => updatePostStatus(previewPost.id, PostStatus.DRAFT)} className={`py-3 rounded-xl text-sm font-bold border transition-all ${previewPost.status === PostStatus.DRAFT ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>Rascunho</button>
                          <button onClick={() => updatePostStatus(previewPost.id, PostStatus.REVIEW)} className={`py-3 rounded-xl text-sm font-bold border transition-all ${previewPost.status === PostStatus.REVIEW ? 'bg-yellow-400 text-yellow-900 border-yellow-400 shadow-lg' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>Revisão</button>
                          <button onClick={() => updatePostStatus(previewPost.id, PostStatus.SCHEDULED)} className={`py-3 rounded-xl text-sm font-bold border transition-all ${previewPost.status === PostStatus.SCHEDULED ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>Agendar</button>
                       </div>
                   </div>
                </div>
              </div>

              <div className="w-full md:w-[420px] bg-slate-50 p-8 md:p-12 flex items-center justify-center border-l border-slate-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-brand-100 rounded-full blur-3xl opacity-50 -mr-16 -mt-16 pointer-events-none"></div>
                  
                  <div className="relative w-[320px] bg-white rounded-[2rem] border border-slate-200 shadow-2xl overflow-hidden flex flex-col z-10 hover:scale-105 transition-transform duration-500">
                      {/* Header Mock */}
                      <div className="p-3 flex items-center gap-3 border-b border-slate-50">
                          <img src={getClientById(previewPost.clientId)?.logo} className="w-8 h-8 rounded-full object-cover border border-slate-100" />
                          <span className="text-sm font-bold text-slate-800">{getClientById(previewPost.clientId)?.name}</span>
                          <MoreHorizontal size={16} className="ml-auto text-slate-400" />
                      </div>

                      {/* Upload Overlay Feature */}
                      <div className="aspect-square bg-slate-100 relative group cursor-pointer" onClick={triggerUpload}>
                          {previewPost.image ? (
                              <img src={previewPost.image} className="w-full h-full object-cover" />
                          ) : (
                              <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300">
                                  <ImageIcon size={48} opacity={0.5} />
                              </div>
                          )}
                          
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                               <div className="bg-white text-slate-900 px-5 py-2.5 rounded-full font-bold text-xs flex items-center gap-2 shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                   <Upload size={14} /> Trocar Mídia
                               </div>
                          </div>
                      </div>

                      {/* Actions Mock */}
                      <div className="p-3 flex justify-between">
                          <div className="flex gap-3 text-slate-800">
                              <Heart size={22} />
                              <MessageCircle size={22} />
                              <SendIcon size={22} />
                          </div>
                          <Bookmark size={22} className="text-slate-800" />
                      </div>

                      <div className="px-3 pb-5 text-xs flex-1 overflow-y-auto custom-scrollbar max-h-[120px]">
                          <p className="text-slate-900 font-bold mb-1">1.234 curtidas</p>
                          <p className="text-slate-800 leading-snug">
                              <span className="font-bold mr-1.5">{getClientById(previewPost.clientId)?.name}</span>
                              {previewPost.content || <span className="text-slate-400 italic">Sem legenda...</span>}
                          </p>
                      </div>
                  </div>
              </div>
           </div>
        </div>
      )}

      {/* Trash Confirmation Modal */}
      {showTrashConfirm && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-[2rem] shadow-2xl p-8 max-w-sm w-full text-center">
                  <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
                      <Trash2 size={36} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">Lixeira ({trashedPostIds.length})</h3>
                  <p className="text-slate-500 font-medium mb-8">
                      Você tem {trashedPostIds.length} itens na lixeira. O que deseja fazer?
                  </p>
                  
                  <div className="flex flex-col gap-3">
                      <button 
                          onClick={handleEmptyTrash}
                          className="w-full py-3.5 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-500/30 hover:bg-red-700 transition-all"
                      >
                          Esvaziar Lixeira
                      </button>
                      <button 
                          onClick={handleRestoreTrash}
                          className="w-full py-3.5 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                      >
                          <RefreshCcw size={18} /> Restaurar Tudo
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Scheduler;
