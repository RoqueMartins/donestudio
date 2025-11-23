import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Dashboard from '../components/Dashboard';
import Scheduler from '../components/Scheduler';
import Planner from '../components/Planner';
import Workflow from '../components/Workflow';
import Analytics from '../components/Analytics';
import Inbox from '../components/Inbox';
import Clients from '../components/Clients';
import Settings from '../components/Settings';
import AdminPanel from '../components/AdminPanel';
import Studio from '../components/Studio';
import { Client, Post, InboxMessage, ChatHistories, ChatHistoryItem, User } from '../types';
import { Menu, Loader2 } from 'lucide-react';

// Adapter Imports
import { observeAuth, logout, getDocument, subscribeToSubcollection } from '../services/firebase';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Data State
  const [user, setUser] = useState<User | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  
  // Admin / Extra State
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [inboxMessages, setInboxMessages] = useState<InboxMessage[]>([]);
  const [chatHistories, setChatHistories] = useState<ChatHistories>({});

  // --- AUTH & DATA SYNC ---
  useEffect(() => {
    const unsubscribeAuth = observeAuth(async (firebaseUser) => {
      if (firebaseUser) {
        setIsAuthenticated(true);
        
        // 1. Fetch User Profile
        const userData = await getDocument("users", firebaseUser.uid);
        
        if (userData) {
            setUser({
                ...userData,
                lastLogin: new Date()
            });
        } else {
            // Fallback for mock users or first login
            setUser({
                id: firebaseUser.uid,
                name: firebaseUser.displayName || 'Usuário',
                email: firebaseUser.email || '',
                avatar: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${firebaseUser.email}&background=random`,
                role: 'Social Media',
                agencyName: 'Minha Agência',
                plan: 'Trial',
                subscriptionStatus: 'trial',
                isAdmin: false,
                lastLogin: new Date()
            });
        }

        // 2. Realtime Listeners for Subcollections
        const unsubClients = subscribeToSubcollection(firebaseUser.uid, 'clients', (data) => {
             const loadedClients = data.map(d => ({
                 ...d,
                 nextPost: d.nextPost ? new Date(d.nextPost) : undefined
             }));
             setClients(loadedClients);
        });

        const unsubPosts = subscribeToSubcollection(firebaseUser.uid, 'posts', (data) => {
             const loadedPosts = data.map(d => ({
                 ...d,
                 scheduledDate: d.scheduledDate ? new Date(d.scheduledDate) : new Date(),
             }));
             setPosts(loadedPosts);
        });

        setIsLoadingAuth(false);

        return () => {
            unsubClients();
            unsubPosts();
        };

      } else {
        // Logged out
        setIsAuthenticated(false);
        setUser(null);
        setClients([]);
        setPosts([]);
        setIsLoadingAuth(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      navigate('/login');
    }
  }, [isLoadingAuth, isAuthenticated, navigate]);

  const handleLogout = async () => {
    try {
        await logout();
        navigate('/login');
    } catch (error) {
        console.error("Error signing out", error);
    }
  };

  // --- HANDLERS FOR INBOX (Mocked locally for now) ---
  const handleSendChatMessage = (messageId: string, text: string) => {
    const newMessage: ChatHistoryItem = { id: Date.now().toString(), text, isUser: true, timestamp: new Date() };
    setChatHistories(prev => ({ ...prev, [messageId]: [...(prev[messageId] || []), newMessage] }));
    setInboxMessages(prev => prev.map(m => m.id === messageId ? { ...m, read: true } : m));
  };

  const handleReceiveChatMessage = (messageId: string, text: string) => {
    const newMessage: ChatHistoryItem = { id: Date.now().toString(), text, isUser: false, timestamp: new Date() };
    setChatHistories(prev => ({ ...prev, [messageId]: [...(prev[messageId] || []), newMessage] }));
  };

  const renderView = () => {
    if (!user) return null;

    if (currentView === 'admin' && !user.isAdmin) {
        setCurrentView('dashboard');
        return <Dashboard clients={clients} posts={posts} onNavigate={setCurrentView} user={user} />;
    }

    switch (currentView) {
      case 'dashboard': return <Dashboard clients={clients} posts={posts} onNavigate={setCurrentView} user={user} />;
      case 'clients': return <Clients clients={clients} setClients={setClients} />;
      case 'planner': return <Planner clients={clients} posts={posts} setPosts={setPosts} onNavigate={setCurrentView} />;
      case 'studio': return <Studio clients={clients} posts={posts} setPosts={setPosts} onNavigate={setCurrentView} />;
      case 'scheduler': return <Scheduler clients={clients} posts={posts} setPosts={setPosts} onNavigate={setCurrentView} user={user} />;
      case 'workflow': return <Workflow clients={clients} posts={posts} setPosts={setPosts} />;
      case 'analytics': return <Analytics clients={clients} />;
      case 'inbox': return <Inbox messages={inboxMessages} chatHistories={chatHistories} onSendMessage={handleSendChatMessage} onReceiveMessage={handleReceiveChatMessage} />;
      case 'settings': return <Settings user={user} setUser={setUser} onLogout={handleLogout} onNavigate={setCurrentView} />;
      case 'admin': return <AdminPanel allUsers={allUsers} setAllUsers={setAllUsers} currentUser={user} />;
      default: return <Dashboard clients={clients} posts={posts} onNavigate={setCurrentView} user={user} />;
    }
  };

  if (isLoadingAuth) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
              <Loader2 size={48} className="text-brand-600 animate-spin" />
              <p className="text-slate-500 font-medium">Conectando ao Done Flow...</p>
          </div>
      );
  }

  if (!isAuthenticated) return null; // Will redirect via useEffect

  return (
    <div className="min-h-screen flex font-sans overflow-hidden relative bg-slate-50">
      {user && (
          <Sidebar 
            currentView={currentView} 
            setCurrentView={(view) => { setCurrentView(view); setIsMobileMenuOpen(false); }}
            isMobileOpen={isMobileMenuOpen}
            setIsMobileOpen={setIsMobileMenuOpen}
            user={user}
          />
      )}
      <main className="flex-1 md:ml-80 h-screen overflow-hidden flex flex-col transition-all duration-300 relative z-10">
        <div className="md:hidden bg-white/80 backdrop-blur-md p-4 border-b border-white/20 flex items-center justify-between shadow-sm z-20 sticky top-0">
           <div className="flex items-center gap-2"><span className="font-bold text-brand-600 text-lg tracking-tight">Done Flow</span></div>
           <button onClick={() => setIsMobileMenuOpen(true)} className="text-slate-600 p-2 hover:bg-slate-100 rounded-lg"><Menu size={24} /></button>
        </div>
        <div className="flex-1 overflow-auto custom-scrollbar relative">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
