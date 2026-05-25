import { createFileRoute, Link } from '@tanstack/react-router';
import { BookOpen } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { AppShell } from '~/components/app-shell';
import { getLibrary, updateLibraryStatus } from '~/server/functions/library';

type LibraryItem = Awaited<ReturnType<typeof getLibrary>>[number];
type Status = 'reading' | 'completed' | 'plan_to_read' | 'dropped' | 'on_hold';

const tabs: { label: string; value: Status | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Reading', value: 'reading' },
  { label: 'Completed', value: 'completed' },
  { label: 'Plan to Read', value: 'plan_to_read' },
  { label: 'Dropped', value: 'dropped' },
  { label: 'On Hold', value: 'on_hold' },
];

const statusLabels: Record<Status, string> = {
  reading: 'Reading',
  completed: 'Completed',
  plan_to_read: 'Plan to Read',
  dropped: 'Dropped',
  on_hold: 'On Hold',
};

export const Route = createFileRoute('/_authed/library')({
  loader: () => getLibrary(),
  component: Library,
});

function Library() {
  const initialItems = Route.useLoaderData();
  const [items, setItems] = useState<LibraryItem[]>(initialItems);
  const [activeTab, setActiveTab] = useState<Status | 'all'>('all');

  const filtered = activeTab === 'all' ? items : items.filter((i) => i.status === activeTab);

  const handleStatusChange = async (mangaId: string, status: Status) => {
    try {
      await updateLibraryStatus({ data: { mangaId, status } });
      setItems((prev) => prev.map((i) => (i.mangaId === mangaId ? { ...i, status } : i)));
      toast.success(`Status updated to "${statusLabels[status]}"`);
    } catch {
      toast.error('Failed to update status.');
    }
  };

  return (
    <AppShell>
      <header className="mb-8 pt-8 md:pt-0">
        <h1 className="font-heading text-5xl md:text-6xl font-black text-on-surface">Library</h1>
        <div className="h-1 w-12 bg-primary mt-2 rounded-full" />
      </header>

      {/* Filter Tabs */}
      <div className="mb-8 overflow-x-auto hide-scrollbar">
        <div className="bg-white/5 backdrop-blur-xl rounded-full p-1 border border-white/5 inline-flex">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={`px-5 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                activeTab === tab.value
                  ? 'bg-primary text-on-primary font-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length > 0 && (
        <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col rounded-xl overflow-hidden bg-surface-container/60 border border-white/5 hover:border-primary/30 transition-all hover:-translate-y-1"
            >
              <Link
                to="/manga/$source/$slug"
                params={{ source: item.source, slug: item.slug }}
                className="flex flex-col"
              >
                <div className="aspect-[3/4] relative overflow-hidden">
                  {item.coverR2 || item.cover ? (
                    <img
                      src={item.coverR2 || item.cover!}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
                      <span className="text-on-surface-variant/40 text-4xl font-heading font-black">
                        {item.title[0]}
                      </span>
                    </div>
                  )}
                  <div className="card-vignette absolute inset-0" />
                </div>
                <div className="p-3 pb-1">
                  <h3 className="text-sm font-semibold text-on-surface line-clamp-2 leading-tight">
                    {item.title}
                  </h3>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-primary/70">
                      {item.source}
                    </p>
                    {item.totalChapters - item.readChapters > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary text-on-primary">
                        {item.totalChapters - item.readChapters}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
              <div className="px-3 pb-3 pt-1">
                <select
                  value={item.status}
                  onChange={(e) => handleStatusChange(item.mangaId, e.target.value as Status)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full text-[11px] font-medium px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-on-surface-variant appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </section>
      )}

      {filtered.length === 0 && (
        <section className="flex flex-col items-center justify-center py-20 text-center">
          <BookOpen size={64} className="text-primary opacity-20 mb-6" />
          <p className="text-on-surface-variant text-lg font-medium">
            {activeTab === 'all'
              ? 'Nothing here yet'
              : `No manga with status "${statusLabels[activeTab as Status]}"`}
          </p>
          <p className="text-on-surface-variant/60 text-sm mt-2">
            Search for manga and add them to your collection.
          </p>
        </section>
      )}
    </AppShell>
  );
}
