import { useState } from 'react';
import { clsx } from 'clsx';

interface PostSchedulingProps {
  onSchedule: (data: { caption: string; scheduledAt: string; platforms: string[]; aiCaption?: string }) => Promise<void>;
  onGenerateCaption: (draft: string) => Promise<string>;
  onGenerateArt: (prompt: string) => Promise<string>;
  aiCaption?: string;
}

const platforms = ['Instagram', 'TikTok', 'Twitter', 'LinkedIn'];

export function PostScheduling({ onSchedule, onGenerateCaption, onGenerateArt, aiCaption }: PostSchedulingProps) {
  const [caption, setCaption] = useState('');
  const [scheduledAt, setScheduledAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['Instagram', 'TikTok']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCaptionLoading, setIsCaptionLoading] = useState(false);
  const [aiArtPrompt, setAiArtPrompt] = useState('campanha cápsula com mood futurista e minimalista');
  const [aiArtResult, setAiArtResult] = useState('Pronto para gerar uma arte conceitual com o modelo Nanobanana 3.');

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    await onSchedule({ caption: caption || aiCaption || 'Post sem legenda', scheduledAt, platforms: selectedPlatforms, aiCaption });
    setIsSubmitting(false);
    setCaption('');
  };

  const handleAiCaption = async () => {
    setIsCaptionLoading(true);
    const suggestion = await onGenerateCaption(caption);
    setCaption(suggestion);
    setIsCaptionLoading(false);
  };

  const handleAiArt = async () => {
    const generated = await onGenerateArt(aiArtPrompt);
    setAiArtResult(generated);
  };

  return (
    <div id="agendamento" className="glass-card rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm uppercase tracking-wide text-brand-600 font-semibold">Agendamento</p>
          <h2 className="text-xl font-bold">Post Scheduling</h2>
        </div>
        <span className="badge">Multi-plataforma</span>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-2 gap-3">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Legenda</span>
            <textarea
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-3 focus:ring-2 focus:ring-brand-500"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Escreva a legenda ou deixe que a IA otimize para você"
              rows={3}
            />
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleAiCaption}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                disabled={isCaptionLoading}
              >
                {isCaptionLoading ? 'Chamando gemini-2.5...' : 'Otimizar com IA'}
              </button>
              {aiCaption && <span className="text-xs text-slate-500">Sugestão da IA aplicada</span>}
            </div>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Data e hora</span>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-3 focus:ring-2 focus:ring-brand-500"
            />
          </label>
        </div>

        <div className="space-y-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Plataformas</span>
          <div className="flex flex-wrap gap-2">
            {platforms.map((platform) => (
              <button
                type="button"
                key={platform}
                onClick={() => togglePlatform(platform)}
                className={clsx(
                  'rounded-full px-4 py-2 text-sm border transition',
                  selectedPlatforms.includes(platform)
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-200 hover:border-brand-400'
                )}
              >
                {platform}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-3 font-semibold shadow"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Agendando...' : 'Agendar post'}
          </button>
          <p className="text-xs text-slate-500">Todos os posts são enviados ao Firestore em tempo real.</p>
        </div>
      </form>

      <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="section-title">Geração de Arte (Nanobanana 3)</h3>
          <span className="badge">IA criativa</span>
        </div>
        <div className="grid md:grid-cols-2 gap-3 items-start">
          <div className="space-y-2">
            <textarea
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-3 focus:ring-2 focus:ring-brand-500"
              value={aiArtPrompt}
              onChange={(e) => setAiArtPrompt(e.target.value)}
              rows={3}
              placeholder="Descreva a arte que o Nanobanana 3 deve gerar"
            />
            <button
              type="button"
              onClick={handleAiArt}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-500 to-brand-700 px-3 py-2 text-sm font-semibold text-white hover:opacity-95"
            >
              Renderizar moodboard
            </button>
          </div>
          <div className="rounded-xl border border-dashed border-brand-200 dark:border-brand-800 bg-brand-50/60 dark:bg-brand-900/30 p-4 text-sm text-brand-900 dark:text-brand-100">
            {aiArtResult}
          </div>
        </div>
      </div>
    </div>
  );
}
