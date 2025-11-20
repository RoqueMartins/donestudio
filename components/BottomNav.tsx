interface BottomNavProps {
  sections: { id: string; label: string; href: string; icon: string }[];
}

export function BottomNav({ sections }: BottomNavProps) {
  return (
    <nav className="sm:hidden fixed bottom-0 inset-x-0 bg-white/90 dark:bg-slate-950/95 border-t border-slate-200 dark:border-slate-800 backdrop-blur z-20">
      <div className="grid grid-cols-4 text-xs text-center">
        {sections.map((item) => (
          <a
            key={item.id}
            href={item.href}
            className="flex flex-col items-center gap-1 py-3 text-slate-600 dark:text-slate-200 hover:text-brand-600"
          >
            <span className="text-lg" aria-hidden>{item.icon}</span>
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
