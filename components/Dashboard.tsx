import { ScheduledPost, CompetitorInsight } from '../types';

interface DashboardProps {
  posts: ScheduledPost[];
  onApprove: (postId: string) => Promise<void>;
}

const competitorInsights: CompetitorInsight[] = [
  { competitor: 'Studio Aurora', highlight: 'Lives semanais aumentaram o CTR em 18%', delta: '+18%' },
  { competitor: 'Agency Nova', highlight: 'Trilhas de UGC com micro-influencers', delta: '+9%' },
  { competitor: 'Creator Loop', highlight: 'Dobrou o volume de Reels com IA generativa', delta: '+22%' },
];

export function Dashboard({ posts, onApprove }: DashboardProps) {
  const pending = posts.filter((post) => post.status === 'pending');

  return (
    <div id="dashboard" className="glass-card rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm uppercase tracking-wide text-brand-600 font-semibold">Workflow</p>
          <h2 className="text-xl font-bold">Dashboard</h2>
        </div>
        <span className="badge">Aprovação Pendente</span>
      </div>

      <div className="space-y-3">
        {pending.length === 0 && (
          <p className="text-sm text-slate-500">Nenhum post pendente. A equipe está em dia!</p>
        )}
        {pending.map((post) => (
          <div
            key={post.id}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-4 flex flex-col gap-2"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{post.caption}</p>
                <p className="text-xs text-slate-500">{new Date(post.scheduledAt).toLocaleString('pt-BR')}</p>
              </div>
              <button
                className="rounded-full bg-emerald-600 text-white text-sm px-4 py-2 font-semibold hover:bg-emerald-700"
                onClick={() => onApprove(post.id)}
              >
                Aprovar
              </button>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-300">
              {post.platforms.map((platform) => (
                <span key={platform} className="badge">{platform}</span>
              ))}
              {post.aiCaption && <span className="badge">IA ativa</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="section-title">Análise Rápida de Concorrentes</h3>
          <span className="badge">Insights de IA</span>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          {competitorInsights.map((insight) => (
            <div
              key={insight.competitor}
              className="rounded-xl border border-dashed border-brand-200 dark:border-brand-800 bg-brand-50/70 dark:bg-brand-950/40 p-4"
            >
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{insight.competitor}</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{insight.highlight}</p>
              <p className="text-xs font-semibold text-brand-700 dark:text-brand-200 mt-2">{insight.delta}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
