import { createFileRoute } from '@tanstack/react-router';
import { BookOpen } from 'lucide-react';

import { AppShell } from '~/components/app-shell';

export const Route = createFileRoute('/_authed/library')({
  component: Library,
});

function Library() {
  return (
    <AppShell>
      <div className="watermark">まだ何もない</div>

      <header className="mb-8 relative inline-block pt-12 md:pt-0">
        <h1 className="font-heading text-5xl md:text-6xl font-black text-on-surface">Library</h1>
        <div className="h-1 w-12 bg-primary mt-2 rounded-full" />
      </header>

      {/* Filter Tabs */}
      <div className="mb-12 overflow-x-auto hide-scrollbar">
        <div className="bg-white/5 backdrop-blur-xl rounded-full p-1 border border-white/5 inline-flex">
          {['Reading', 'Completed', 'Plan to Read', 'Dropped', 'On Hold'].map((tab, i) => (
            <button
              key={tab}
              type="button"
              className={`px-5 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                i === 0
                  ? 'bg-surface-bright text-primary font-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      <section className="flex flex-col items-center justify-center py-20 text-center">
        <BookOpen size={64} className="text-primary opacity-20 mb-6" />
        <p className="text-on-surface-variant text-lg font-medium">Nothing here yet</p>
        <p className="text-on-surface-variant/60 text-sm mt-2">
          Search for manga and add them to your collection.
        </p>
      </section>
    </AppShell>
  );
}
