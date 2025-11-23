
import React, { useState, useMemo } from 'react';
import { MoreHorizontal, Plus, GripVertical, Calendar, Clock, Filter, LayoutGrid } from 'lucide-react';
import { Client, Post, PostStatus } from '../types';

interface WorkflowProps {
  clients: Client[];
  posts: Post[];
  setPosts: (posts: Post[]) => void;
}

const Workflow: React.FC<WorkflowProps> = ({ clients, posts, setPosts }) => {
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [draggedPostId, setDraggedPostId] = useState<string | null>(null);

  // Map internal PostStatus to Kanban Columns
  const columns = [
    { id: PostStatus.DRAFT, title: 'Rascunhos / Ideias', color: 'text-slate-600', badge: 'bg-slate-100 text-slate-600' },
    { id: PostStatus.REVIEW, title: 'Em Aprovação', color: 'text-yellow-600', badge: 'bg-yellow-100 text-yellow-600' },
    { id: PostStatus.SCHEDULED, title: 'Agendados', color: 'text-blue-600', badge: 'bg-blue-100 text-blue-600' },
    { id: PostStatus.PUBLISHED, title: 'Publicados', color: 'text-green-600', badge: 'bg-green-100 text-green-600' },
  ];

  const filteredPosts = useMemo(() => {
    if (!selectedClientId) return posts;
    return posts.filter(p => p.clientId === selectedClientId);
  }, [posts, selectedClientId]);

  const handleDragStart = (e: React.DragEvent, postId: string) => {
    setDraggedPostId(postId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); 
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, newStatus: PostStatus) => {
    e.preventDefault();
    if (!draggedPostId) return;

    const updatedPosts = posts.map(post => {
      if (post.id === draggedPostId) {
        return { ...post, status: newStatus };
      }
      return post;
    });

    setPosts(updatedPosts);
    setDraggedPostId(null);
  };

  const getClientLogo = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.logo || `https://picsum.photos/seed/${clientId}/30/30`;
  };

  return (
    <div className="p-6 md:p-10 h-full flex flex-col overflow-hidden animate-fade-in">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Workflow</h2>
          <p className="text-slate-500 font-medium mt-1">Gerencie o status das produções. Arraste os cards para mover.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 border border-slate-200 rounded-2xl shadow-sm overflow-x-auto max-w-full">
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
                 <LayoutGrid size={16} />
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
        </div>
      </div>

      <div className="flex-1 overflow-x-auto custom-scrollbar pb-4">
        <div className="flex gap-6 h-full min-w-[1200px]">
          {columns.map((col) => {
            const colPosts = filteredPosts.filter(p => p.status === col.id);
            
            return (
              <div 
                key={col.id} 
                className="flex-1 rounded-3xl flex flex-col min-w-[300px] bg-white/50 backdrop-blur-md border border-white/50 shadow-sm"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id as PostStatus)}
              >
                {/* Column Header */}
                <div className="p-4 flex justify-between items-center border-b border-slate-100/50">
                  <div className="flex items-center gap-2">
                     <h3 className={`font-extrabold text-sm uppercase tracking-wide ${col.color}`}>{col.title}</h3>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${col.badge}`}>
                    {colPosts.length}
                  </span>
                </div>

                {/* Drop Zone / Post List */}
                <div className="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar">
                  {colPosts.map((post) => (
                    <div 
                      key={post.id} 
                      draggable
                      onDragStart={(e) => handleDragStart(e, post.id)}
                      className="bg-white p-4 rounded-2xl shadow-card border border-slate-100 hover:shadow-lg hover:border-brand-200 transition-all cursor-grab active:cursor-grabbing group relative hover:-translate-y-1"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <img src={getClientLogo(post.clientId)} alt="" className="w-6 h-6 rounded-full object-cover border border-slate-100" />
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate max-w-[120px]">
                            {clients.find(c => c.id === post.clientId)?.name}
                          </span>
                        </div>
                        <GripVertical size={16} className="text-slate-300 opacity-0 group-hover:opacity-100" />
                      </div>

                      <h4 className="font-bold text-slate-800 mb-3 text-sm leading-snug line-clamp-2">{post.title}</h4>
                      
                      <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                        <div className="flex gap-1">
                           {post.platforms.map(p => (
                             <span key={p} className="w-6 h-6 bg-slate-50 rounded-lg flex items-center justify-center text-[10px] font-bold text-slate-500 border border-slate-100" title={p}>
                               {p[0]}
                             </span>
                           ))}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                           <Calendar size={12} />
                           <span>{post.scheduledDate ? post.scheduledDate.toLocaleDateString('pt-BR') : 'Sem Data'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {colPosts.length === 0 && (
                    <div className="h-32 border-2 border-dashed border-slate-200/50 rounded-2xl flex flex-col items-center justify-center text-slate-400 text-xs font-medium opacity-70">
                      <span>Arraste posts para cá</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Workflow;
