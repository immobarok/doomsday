import type { Movie } from '../../types';

interface Props {
  movies: Movie[];
  targetId: string;
  onSelect: (id: string) => void;
}

export function TargetMoviePicker({ movies, targetId, onSelect }: Props) {
  const quickPicks = movies.filter(
    (m) =>
      m.title.includes('Doomsday') ||
      m.title.includes('Civil War') ||
      m.title.includes('Ragnarok'),
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
      <div className="mb-4 border-b border-slate-100 pb-3">
        <h2 className="text-2xl tracking-wide text-slate-900">
          Rewatch Order Planner
        </h2>
        <p className="text-xs text-slate-500">
          Pick a target movie to see every prerequisite movie in valid watch
          order, your watched progress, and remaining watch time.
        </p>
      </div>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="w-full sm:max-w-md">
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
            Target Movie
          </label>
          <select
            value={targetId}
            onChange={(e) => onSelect(e.target.value)}
            className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 shadow-2xs focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/15 focus:outline-none"
          >
            {movies.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title} ({m.releaseYear})
              </option>
            ))}
          </select>
        </div>

        {quickPicks.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-xs font-medium text-slate-400">
              Quick pick:
            </span>
            {quickPicks.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onSelect(m.id)}
                className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${
                  targetId === m.id
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {m.title}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
