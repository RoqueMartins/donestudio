import { InboxMessage } from '../types';

const messages: InboxMessage[] = [
  { id: '1', channel: 'Instagram', author: 'Lia (cliente)', preview: 'Vocês conseguem antecipar o post de sexta?', timeAgo: '2m', priority: 'alta' },
  { id: '2', channel: 'TikTok', author: 'Equipe Creator', preview: 'Prontos para a live? Link atualizado.', timeAgo: '7m' },
  { id: '3', channel: 'Twitter', author: 'Suporte', preview: 'Thread com perguntas sobre o produto', timeAgo: '11m' },
  { id: '4', channel: 'LinkedIn', author: 'Recrutador', preview: 'Parabéns pelo case! Vamos conversar?', timeAgo: '18m' },
];

const channelColor: Record<InboxMessage['channel'], string> = {
  Instagram: 'bg-gradient-to-r from-pink-500 to-amber-500',
  TikTok: 'bg-gradient-to-r from-slate-900 to-fuchsia-600',
  Twitter: 'bg-sky-500',
  LinkedIn: 'bg-blue-600',
};

export function Inbox() {
  return (
    <div id="inbox" className="glass-card rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm uppercase tracking-wide text-brand-600 font-semibold">SAC 2.0</p>
          <h2 className="text-xl font-bold">Inbox unificado</h2>
        </div>
        <span className="badge">Prioridades</span>
      </div>

      <div className="space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-4 flex items-center gap-3"
          >
            <span className={`h-10 w-10 rounded-full ${channelColor[message.channel]} flex items-center justify-center text-white font-semibold`}>
              {message.channel[0]}
            </span>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-slate-900 dark:text-white">{message.author}</p>
                {message.priority === 'alta' && <span className="badge">Alta</span>}
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300">{message.preview}</p>
              <p className="text-xs text-slate-500">{message.channel} • {message.timeAgo}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
