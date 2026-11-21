import { useEffect, useState } from 'react';
import {
  api,
  formatRuntime,
  getErrorMessage,
  type Movie,
  type RewatchPlan,
} from '../api';

interface Props {
  movies: Movie[];
  onRefreshMovies: () => Promise<void>;
}

export function RewatchPlanView({ movies, onRefreshMovies }: Props) {
  const defaultTarget =
    movies.find((m) => m.title.includes('Doomsday'))?.id ??
    movies[movies.length - 1]?.id ??
    '';

  const [selectedId, setSelectedId] = useState<string>('');
  const targetId = selectedId || defaultTarget;

  const [plan, setPlan] = useState<RewatchPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const movieMap = new Map(movies.map((m) => [m.id, m]));

  useEffect(() => {
    if (!targetId) return;
    let cancelled = false;

    async function fetchPlan() {
      try {
        const res = await api.get<RewatchPlan>(
          `/movies/${targetId}/rewatch-order`,
        );
        if (!cancelled) {
          setPlan(res.data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchPlan();
    return () => {
      cancelled = true;
    };
  }, [targetId]);

  function handleSelectTarget(nextId: string) {
    setSelectedId(nextId);
    setLoading(true);
    setError(null);
  }

  async function handleToggleWatched(movie: Movie) {
    setTogglingId(movie.id);
    setError(null);
    try {
      await api.patch(`/movies/${movie.id}`, { watched: !movie.watched });
      const [planRes] = await Promise.all([
        api.get<RewatchPlan>(`/movies/${targetId}/rewatch-order`),
        onRefreshMovies(),
      ]);
      setPlan(planRes.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setTogglingId(null);
    }
  }

  const progressPercent =
    plan && plan.totalCount > 0
      ? Math.round((plan.watchedCount / plan.totalCount) * 100)
      : 100;

  return (
    <div className="space-y-6">
      {/* Target Movie Picker Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="w-full sm:max-w-md">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Target Movie
            </label>
            <select
              value={targetId}
              onChange={(e) => handleSelectTarget(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-2xs focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/15 focus:outline-none"
            >
              {movies.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title} ({m.releaseYear})
                </option>
              ))}
            </select>
          </div>

          {/* Quick Presets from Assessment Brief */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-xs font-medium text-slate-400">
              Quick pick:
            </span>
            {movies
              .filter(
                (m) =>
                  m.title.includes('Doomsday') ||
                  m.title.includes('Civil War') ||
                  m.title.includes('Ragnarok'),
              )
              .map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleSelectTarget(m.id)}
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
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && !plan ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-xs">
          Calculating prerequisite rewatch order...
        </div>
      ) : plan ? (
        <>
          {/* Summary Stats & Progress Bar Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                <div className="text-xs font-medium text-slate-500">
                  Target Movie
                </div>
                <div className="mt-1 text-base font-bold text-slate-900">
                  {plan.target.title}
                </div>
                <div className="mt-0.5 text-xs text-slate-500">
                  {plan.target.releaseYear} &bull;{' '}
                  {formatRuntime(plan.target.runtime)}
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                <div className="text-xs font-medium text-slate-500">
                  Rewatch Progress
                </div>
                <div className="mt-1 text-base font-bold text-indigo-600">
                  {plan.watchedCount} of {plan.totalCount} watched
                </div>
                <div className="mt-0.5 text-xs text-slate-500">
                  {plan.totalCount === 0
                    ? 'No prerequisites required'
                    : `${progressPercent}% completed`}
                </div>
              </div>

              <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 p-4">
                <div className="text-xs font-medium text-amber-800">
                  Remaining Watch Time
                </div>
                <div className="mt-1 text-base font-bold text-amber-900">
                  {formatRuntime(plan.unwatchedRuntime)}
                </div>
                <div className="mt-0.5 text-xs text-amber-700">
                  {plan.totalCount - plan.watchedCount} unwatched{' '}
                  {plan.totalCount - plan.watchedCount === 1
                    ? 'movie'
                    : 'movies'}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>
                  {plan.totalCount === 0
                    ? 'Ready to watch!'
                    : `${plan.watchedCount} of ${plan.totalCount} watched`}
                </span>
                <span className="text-emerald-600">{progressPercent}%</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200/70">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Ordered Prerequisite Movies List */}
          {plan.totalCount === 0 ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-8 text-center">
              <div className="text-base font-bold text-emerald-900">
                No prerequisites needed for {plan.target.title}!
              </div>
              <p className="mt-1 text-xs text-emerald-700">
                You can jump straight into watching {plan.target.title}.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Ordered Watch List (every movie after its prerequisites,
                  excluding {plan.target.title})
                </h3>
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
                        onChange={() => handleToggleWatched(movie)}
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
                      onClick={() => handleToggleWatched(movie)}
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
          )}
        </>
      ) : null}
    </div>
  );
}
