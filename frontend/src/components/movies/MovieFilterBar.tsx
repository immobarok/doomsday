export type MovieFilter = 'all' | 'unwatched' | 'watched';

interface Props {
  total: number;
  watchedCount: number;
  filter: MovieFilter;
  onFilterChange: (filter: MovieFilter) => void;
}

export function MovieFilterBar({
  total,
  watchedCount,
  filter,
  onFilterChange,
}: Props) {
  const tabs: { id: MovieFilter; label: string }[] = [
    { id: 'all', label: `All (${total})` },
    { id: 'unwatched', label: `To Watch (${total - watchedCount})` },
    { id: 'watched', label: `Watched (${watchedCount})` },
  ];

  return (
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
      <div>
        <h2 className="text-2xl tracking-wide text-slate-900">
          Movie Catalog ({total})
        </h2>
        <p className="text-xs text-slate-500">
          {watchedCount} watched &bull; {total - watchedCount} remaining
        </p>
      </div>

      <div className="flex gap-1 self-start rounded-xl border border-slate-200 bg-white p-1 shadow-2xs sm:self-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onFilterChange(tab.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              filter === tab.id
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
