import { formatRuntime } from '../../api/client';
import type { Movie, RewatchPlan } from '../../types';

interface Props {
  plan: RewatchPlan;
  movieMap: Map<string, Movie>;
  togglingId: string | null;
  onToggleWatched: (movie: Movie) => Promise<void>;
}

export function RewatchOrderList({
  plan,
  movieMap,
  togglingId,
  onToggleWatched,
}: Props) {
  if (plan.totalCount === 0) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-8 text-center">
        <div className="text-base font-bold text-emerald-900">
          No prerequisites needed for {plan.target.title}!
        </div>
        <p className="mt-1 text-xs text-emerald-700">
          You can jump straight into watching {plan.target.title}.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Ordered Watch List (excluding {plan.target.title})
        </span>
        <span className="text-xs text-slate-500">
          Tick movies as you watch them
        </span>
      </div>

      <ol className="space-y-2.5">
        {plan.movies.map((movie, index) => (
          <li
            key={movie.id}
            className={`flex flex-col justify-between gap-3 rounded-2xl border bg-white p-4 shadow-2xs transition sm:flex-row sm:items-center ${
              movie.watched
                ? 'border-emerald-200 bg-emerald-50/20'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start gap-3.5 sm:items-center">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                  movie.watched
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-indigo-50 text-indigo-700'
                }`}
              >
                {index + 1}
              </span>

              <input
                type="checkbox"
                checked={movie.watched}
                disabled={togglingId === movie.id}
                onChange={() => void onToggleWatched(movie)}
                className="mt-1 h-5 w-5 cursor-pointer rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 sm:mt-0"
              />

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-sm font-bold ${
                      movie.watched
                        ? 'text-slate-500 line-through decoration-emerald-500'
                        : 'text-slate-900'
                    }`}
                  >
                    {movie.title}
                  </span>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {movie.releaseYear}
                  </span>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {formatRuntime(movie.runtime)}
                  </span>
                </div>

                {movie.prerequisiteIds.length > 0 && (
                  <p className="mt-1 text-xs text-slate-500">
                    Follows:{' '}
                    {movie.prerequisiteIds
                      .map((id) => movieMap.get(id)?.title ?? 'Unknown')
                      .join(', ')}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              disabled={togglingId === movie.id}
              onClick={() => void onToggleWatched(movie)}
              className={`self-end rounded-xl border px-3 py-1.5 text-xs font-semibold transition sm:self-center ${
                movie.watched
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  : 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              {movie.watched ? 'Watched ✓' : 'To Watch'}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
