
import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, Send, Check, MessageCircle, MessageSquare, Clock, MoreVertical } from 'lucide-react';
import { InboxMessage, SocialPlatform, ChatHistories } from '../types';

interface InboxProps {
  messages: InboxMessage[];
  chatHistories: ChatHistories;
  onSendMessage: (id: string, text: string) => void;
  onReceiveMessage: (id: string, text: string) => void;
}

const Inbox: React.FC<InboxProps> = ({ messages, chatHistories, onSendMessage, onReceiveMessage }) => {
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(messages[0]?.id || null);
  const [replyText, setReplyText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedMessage = messages.find(m => m.id === selectedMessageId) || null;
  const currentHistory = selectedMessageId ? chatHistories[selectedMessageId] || [] : [];

  // Auto-scroll to bottom when history changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentHistory, isTyping, selectedMessageId]);

  const handleSendClick = () => {
    if (!replyText.trim() || !selectedMessageId) return;

    // 1. Send real message to parent
    onSendMessage(selectedMessageId, replyText);
    setReplyText('');
    
    // 2. Simulate "External User" Typing & Reply
    setIsTyping(true);
    setTimeout(() => {
      onReceiveMessage(selectedMessageId, "Obrigado pela resposta rápida! Vou conferir no site.");
      setIsTyping(false);
    }, 3000);
  };

  return (
    <div className="h-full p-6 md:p-10 max-w-[1600px] mx-auto animate-fade-in flex flex-col">
       
       <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">SAC 2.0</h2>
          <p className="text-slate-500 font-medium mt-1">Centralize o atendimento de todas as redes.</p>
       </div>

       <div className="flex-1 bg-white rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col md:flex-row">
          
          {/* Message List - Sidebar */}
          <div className="w-full md:w-96 bg-white border-r border-slate-100 flex flex-col h-full z-10">
            <div className="p-6 border-b border-slate-50">
              <div className="relative mb-4">
                <Search className="absolute left-4 top-3.5 text-slate-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Buscar mensagens..." 
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-transparent focus:bg-white focus:border-brand-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                />
              </div>
              <div className="flex gap-2">
                <button className="flex-1 py-2 text-xs font-bold bg-slate-900 text-white rounded-xl shadow-lg shadow-slate-900/10">Todos</button>
                <button className="flex-1 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-100 transition-colors">Não lidos</button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  onClick={() => setSelectedMessageId(msg.id)}
                  className={`p-5 border-b border-slate-50 cursor-pointer transition-all relative group hover:bg-slate-50 ${selectedMessageId === msg.id ? 'bg-brand-50/30' : ''}`}
                >
                  {selectedMessageId === msg.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500"></div>}
                  {!msg.read && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-brand-500 shadow-sm"></div>}
                  
                  <div className="flex justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        {msg.platform === SocialPlatform.INSTAGRAM ? <div className="w-2 h-2 rounded-full bg-pink-500"></div> : <div className="w-2 h-2 rounded-full bg-blue-600"></div>}
                        <span className={`text-sm font-bold ${!msg.read ? 'text-slate-900' : 'text-slate-700'}`}>@{msg.user}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">
                        {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <img src={msg.avatar} alt="" className="w-10 h-10 rounded-full mt-0.5 border border-slate-100" />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate leading-relaxed ${!msg.read ? 'text-slate-800 font-bold' : 'text-slate-500 font-medium'}`}>
                        {msg.content}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                        {msg.type === 'comment' ? <MessageCircle size={10} /> : <MessageSquare size={10} />}
                        <span className="capitalize">{msg.type === 'dm' ? 'Direct' : 'Comentário'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Conversation View */}
          <div className={`flex-1 flex flex-col bg-slate-50/30 relative ${selectedMessageId ? 'block' : 'hidden md:flex'}`}>
            {selectedMessage ? (
              <>
                <div className="p-6 bg-white/80 backdrop-blur-md border-b border-slate-100 flex justify-between items-center z-10 sticky top-0">
                  <div className="flex items-center gap-4">
                    <button className="md:hidden text-slate-400 hover:text-slate-800" onClick={() => setSelectedMessageId(null)}>←</button>
                    <div className="relative">
                       <img src={selectedMessage.avatar} alt="" className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
                       <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                          {selectedMessage.platform === SocialPlatform.INSTAGRAM ? <div className="w-3 h-3 rounded-full bg-pink-500"></div> : <div className="w-3 h-3 rounded-full bg-blue-600"></div>}
                       </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">@{selectedMessage.user}</h3>
                      <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                         <span className={`font-bold ${selectedMessage.platform === SocialPlatform.INSTAGRAM ? 'text-pink-600' : 'text-blue-600'}`}>{selectedMessage.platform}</span>
                         • {selectedMessage.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                      <button className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-green-600 hover:border-green-200 flex items-center justify-center transition-all shadow-sm" title="Resolver">
                        <Check size={20} />
                      </button>
                      <button className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-all shadow-sm">
                        <MoreVertical size={20} />
                      </button>
                  </div>
                </div>

                <div className="flex-1 p-8 overflow-y-auto space-y-6 custom-scrollbar">
                  {/* Context (Post Preview if comment) */}
                  {selectedMessage.type === 'comment' && (
                    <div className="flex gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm max-w-lg mx-auto mb-8 items-center">
                        <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                           <img src={`https://picsum.photos/seed/${selectedMessage.id}/100/100`} className="w-full h-full object-cover" alt="Post" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Contexto do Post</p>
                          <p className="text-sm text-slate-700 font-medium italic">"Coleção de Verão 2024 - Confira as novidades!"</p>
                        </div>
                    </div>
                  )}
                  
                  {/* Chat Bubbles */}
                  <div className="flex flex-col gap-6">
                    {currentHistory.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                          {!msg.isUser && <img src={selectedMessage.avatar} className="w-8 h-8 rounded-full mr-3 self-end mb-1 border border-white shadow-sm" />}
                          <div className={`max-w-[75%] p-4 rounded-[20px] text-sm shadow-sm relative group ${
                            msg.isUser 
                              ? 'bg-slate-900 text-white rounded-br-none' 
                              : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
                          }`}>
                            <p className="leading-relaxed font-medium">{msg.text}</p>
                            <p className={`text-[10px] mt-1 text-right font-bold opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-5 right-0 ${msg.isUser ? 'text-slate-400' : 'text-slate-400'}`}>
                              {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                          </div>
                      </div>
                    ))}
                    
                    {isTyping && (
                      <div className="flex justify-start">
                          <img src={selectedMessage.avatar} className="w-8 h-8 rounded-full mr-3 self-end mb-1" />
                          <div className="bg-white p-4 rounded-[20px] rounded-bl-none border border-slate-100 shadow-sm">
                            <div className="flex gap-1.5">
                              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                            </div>
                          </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Reply Input */}
                <div className="p-6 bg-white border-t border-slate-100">
                  <div className="flex gap-4 items-end bg-slate-50 p-2 rounded-[24px] border border-slate-200 focus-within:border-brand-300 focus-within:ring-4 focus-within:ring-brand-500/10 transition-all">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => {
                        if(e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendClick();
                        }
                      }}
                      placeholder="Escreva uma resposta..."
                      className="flex-1 bg-transparent border-none focus:ring-0 p-3 resize-none h-[50px] focus:h-[100px] transition-all custom-scrollbar text-sm font-medium text-slate-700 placeholder:text-slate-400"
                    />
                    <button 
                      onClick={handleSendClick}
                      disabled={!replyText.trim()}
                      className="bg-brand-600 text-white rounded-2xl w-12 h-12 flex items-center justify-center hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none mb-1 mr-1"
                    >
                      <Send size={20} className={replyText.trim() ? "ml-0.5" : ""} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 hidden md:flex opacity-60">
                <div className="w-24 h-24 bg-slate-100 rounded-[2rem] flex items-center justify-center mb-6 rotate-3">
                  <MessageCircle size={48} className="text-slate-300" />
                </div>
                <p className="font-bold text-lg">Selecione uma conversa</p>
                <p className="text-sm">Comece a atender seus clientes agora.</p>
              </div>
            )}
          </div>
       </div>
    </div>
  );
};

export default Inbox;
