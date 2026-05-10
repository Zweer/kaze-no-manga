import { createFileRoute } from '@tanstack/react-router';
import { Search, Wind } from 'lucide-react';

import { AppShell } from '~/components/app-shell';

export const Route = createFileRoute('/_authed/')({
  component: Home,
});

function Home() {
  return (
    <AppShell>
      <div className="watermark">風の漫画</div>

      <section className="flex flex-col items-center justify-center text-center mb-16 pt-12 md:pt-8">
        <h1 className="md:hidden font-heading text-6xl leading-none text-on-surface font-black mb-2">
          Kaze
        </h1>
        <p className="md:hidden font-heading text-xl font-bold text-primary/80 tracking-[0.2em] mb-12">
          風の漫画
        </p>

        <div className="w-full max-w-2xl relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary transition-colors">
            <Search size={24} />
          </div>
          <input
            type="text"
            placeholder="Search by title..."
            autoComplete="off"
            className="w-full h-14 pl-14 pr-4 rounded-xl bg-surface-container/60 backdrop-blur-2xl border border-white/10 text-on-surface placeholder-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-base font-medium"
          />
        </div>
      </section>

      <div className="w-full max-w-4xl mx-auto ink-divider mb-12" />

      <section className="flex flex-col items-center justify-center py-20 text-center">
        <Wind size={80} className="text-primary opacity-20 mb-6" />
        <h2 className="font-heading text-2xl font-bold text-on-surface-variant mb-2">
          Search for your next journey
        </h2>
        <p className="text-base text-on-surface-variant/60 max-w-md">
          Discover worlds of ink and wind. Enter a title above to begin.
        </p>
      </section>
    </AppShell>
  );
}
