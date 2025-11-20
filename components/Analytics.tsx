import { MetricCard } from '../types';

const metrics: MetricCard[] = [
  { label: 'Engajamento médio', value: '5,8%', change: '+0,8% vs semana passada' },
  { label: 'Taxa de aprovação', value: '92%', change: '+5% vs mês passado' },
  { label: 'Tempo de resposta SAC', value: '6 min', change: '-3 min com Inbox unificado' },
];

export function Analytics() {
  return (
    <div id="analytics" className="glass-card rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm uppercase tracking-wide text-brand-600 font-semibold">Análises</p>
          <h2 className="text-xl font-bold">Analytics & Insights</h2>
        </div>
        <span className="badge">IA + Dados</span>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">{metric.label}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{metric.value}</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-300">{metric.change}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-dashed border-brand-200 dark:border-brand-800 bg-brand-50/60 dark:bg-brand-950/30 p-4">
        <h3 className="section-title mb-2">Análise de concorrência em tempo real</h3>
        <div className="grid md:grid-cols-4 gap-3 text-xs text-slate-700 dark:text-slate-200">
          {[12, 18, 9, 22].map((value, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between">
                <span>Concorrente {index + 1}</span>
                <span className="font-semibold text-brand-700 dark:text-brand-300">+{value}%</span>
              </div>
              <div className="h-2 rounded-full bg-brand-100 dark:bg-brand-900/40 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-brand-500 to-brand-700" style={{ width: `${value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
