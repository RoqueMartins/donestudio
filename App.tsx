import React, { useEffect, useMemo, useState } from 'react';
import { collection, addDoc, onSnapshot, serverTimestamp, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from './services/firebase';
import { ScheduledPost } from './types';
import { ThemeToggle } from './components/ThemeToggle';
import { BottomNav } from './components/BottomNav';
import { PostScheduling } from './components/PostScheduling';
import { Dashboard } from './components/Dashboard';
import { Analytics } from './components/Analytics';
import { Inbox } from './components/Inbox';

const sections = [
  { id: 'dashboard', label: 'Dashboard', href: '#dashboard', icon: '🏠' },
  { id: 'agendamento', label: 'Agendar', href: '#agendamento', icon: '🗓️' },
  { id: 'analytics', label: 'Analytics', href: '#analytics', icon: '📊' },
  { id: 'inbox', label: 'Inbox', href: '#inbox', icon: '💬' },
];

const teamUsers = ['Gerente', 'Planner', 'Social'];

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [aiCaption, setAiCaption] = useState<string>('');
  const [aiArtPreview, setAiArtPreview] = useState<string>('');
  const [activeUser] = useState(() => teamUsers[Math.floor(Math.random() * teamUsers.length)]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  useEffect(() => {
    const scheduledPostsRef = collection(db, 'scheduled_posts');
    const q = query(scheduledPostsRef, orderBy('scheduledAt'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      })) as ScheduledPost[];
      setPosts(data);
    });

    return () => unsubscribe();
  }, []);

  const handleSchedulePost = async (data: { caption: string; scheduledAt: string; platforms: string[]; aiCaption?: string }) => {
    await addDoc(collection(db, 'scheduled_posts'), {
      caption: data.caption,
      aiCaption: aiCaption || data.aiCaption,
      scheduledAt: data.scheduledAt,
      platforms: data.platforms,
      status: 'pending',
      createdAt: serverTimestamp(),
      owner: activeUser,
    });
  };

  const handleApprovePost = async (postId: string) => {
    await updateDoc(doc(db, 'scheduled_posts', postId), {
      status: 'approved',
      approvedAt: serverTimestamp(),
      approver: activeUser,
    });
  };

  const handleGenerateAiCaption = async (draft: string) => {
    const basePrompt = draft || 'Crie uma legenda curta com CTA e hashtags inteligentes';
    // Simula a chamada ao gemini-2.5-flash-preview-09-2025
    await new Promise((resolve) => setTimeout(resolve, 600));
    const suggestion = `${basePrompt} · otimizada por gemini-2.5-flash-preview-09-2025 ✨`;
    setAiCaption(suggestion);
    return suggestion;
  };

  const handleGenerateAiArt = async (prompt: string) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const render = `Nanobanana 3 gerou um moodboard para: "${prompt}". Cores neon, contraste alto e layout pronto para Reels.`;
    setAiArtPreview(render);
    return render;
  };

  const approvedCount = useMemo(() => posts.filter((post) => post.status === 'approved').length, [posts]);

  return (
    <div className="pb-20 sm:pb-6">
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-950/70 backdrop-blur border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl" role="img" aria-label="DoneFlow">📱</span>
            <div>
              <p className="text-sm uppercase tracking-wide text-brand-600 font-semibold">DoneFlow 2.0</p>
              <p className="text-xs text-slate-500">Workflow social • multi-equipe • IA + dados</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 hidden sm:block">{activeUser} online</span>
            <span className="badge hidden sm:inline-flex">{approvedCount} aprovados</span>
            <ThemeToggle theme={theme} setTheme={setTheme} />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <PostScheduling
              onSchedule={handleSchedulePost}
              onGenerateCaption={handleGenerateAiCaption}
              onGenerateArt={handleGenerateAiArt}
              aiCaption={aiCaption}
            />
            <Dashboard posts={posts} onApprove={handleApprovePost} />
          </div>
          <div className="space-y-4">
            <Analytics />
            <Inbox />
            <div className="glass-card rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="section-title">Laboratório de IA</p>
                <span className="badge">Beta</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Consolide legendas do gemini, aprovação em um clique e pré-visualização do Nanobanana 3.
              </p>
              {aiCaption && (
                <div className="rounded-lg border border-brand-200 dark:border-brand-900 bg-brand-50/60 dark:bg-brand-950/50 p-3 text-sm text-brand-900 dark:text-brand-100">
                  <p className="font-semibold">Legenda otimizada</p>
                  <p>{aiCaption}</p>
                </div>
              )}
              {aiArtPreview && (
                <div className="rounded-lg border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-3 text-xs">
                  {aiArtPreview}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <BottomNav sections={sections} />
    </div>
  );
}

export default App;
