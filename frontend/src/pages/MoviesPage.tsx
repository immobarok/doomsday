import { type FormEvent, useCallback, useEffect, useState } from 'react';
import { formatRuntime, getErrorMessage, moviesApi } from '../api/client';
import type { Movie } from '../types';

export function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  // Add-movie form state
  const [title, setTitle] = useState('');
  const [releaseYear, setReleaseYear] = useState(2026);
  const [runtime, setRuntime] = useState(140);
  const [watched, setWatched] = useState(false);
  const [selectedPrereqs, setSelectedPrereqs] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  // Edit prerequisites state
  const [editingMovieId, setEditingMovieId] = useState<string | null>(null);
  const [editPrereqIds, setEditPrereqIds] = useState<string[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);

  // Filter state
  const [filter, setFilter] = useState<'all' | 'unwatched' | 'watched'>('all');

  // Feedback alerts
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadMovies = useCallback(async () => {
    try {
      const data = await moviesApi.getAll();
      setMovies(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    moviesApi
      .getAll()
      .then((data) => setMovies(data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const movieMap = new Map(movies.map((m) => [m.id, m]));

  const toggleInList = (list: string[], id: string) =>
    list.includes(id) ? list.filter((item) => item !== id) : [...list, id];

  async function handleCreateMovie(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setCreating(true);

    try {
      await moviesApi.create({
        title,
        releaseYear: Number(releaseYear),
        runtime: Number(runtime),
        watched,
        prerequisiteIds: selectedPrereqs,
      });
      setTitle('');
      setReleaseYear(2026);
      setRuntime(140);
      setWatched(false);
      setSelectedPrereqs([]);
      setSuccess(`Added "${title.trim()}" to the rewatch catalog.`);
      await loadMovies();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setCreating(false);
    }
  }

  async function handleToggleWatched(movie: Movie) {
    setError(null);
    setSuccess(null);
    setSavingId(movie.id);

    try {
      await moviesApi.update(movie.id, { watched: !movie.watched });
      await loadMovies();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSavingId(null);
    }
  }

  function startEditingPrereqs(movie: Movie) {
    setError(null);
    setSuccess(null);
    setEditingMovieId(movie.id);
    setEditPrereqIds(movie.prerequisiteIds);
  }

  async function handleSavePrereqs(movieId: string) {
    setError(null);
    setSuccess(null);
    setSavingId(movieId);

    try {
      await moviesApi.update(movieId, {
        prerequisiteIds: editPrereqIds,
      });
      setEditingMovieId(null);
      setSuccess('Prerequisites updated successfully.');
      await loadMovies();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSavingId(null);
    }
  }

  const filteredMovies = movies.filter((m) => {
    if (filter === 'watched') return m.watched;
    if (filter === 'unwatched') return !m.watched;
    return true;
  });

  const watchedCount = movies.filter((m) => m.watched).length;

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 shadow-xs">
        Loading MCU movies...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Error / Success Alerts */}
      {error && (
        <div className="flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700 shadow-xs">
          <div>
            <strong className="font-semibold">Validation Error: </strong>
            {error}
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-xs font-semibold text-red-600 hover:text-red-800"
          >
            Dismiss
          </button>
        </div>
      )}
      {success && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow-xs">
          <span>{success}</span>
          <button
            type="button"
            onClick={() => setSuccess(null)}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Add Movie Card */}
      <form
        onSubmit={handleCreateMovie}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs"
      >
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-2xl tracking-wide text-slate-900">
              Add a New MCU Movie
            </h2>
            <p className="text-xs text-slate-500">
              Title must be unique; runtime must be between 1 and 300 minutes.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Movie Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Doctor Strange"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/15 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Release Year <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min={1888}
              max={2100}
              value={releaseYear}
              onChange={(e) => setReleaseYear(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/15 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Runtime in Minutes (1–300) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min={1}
              max={300}
              value={runtime}
              onChange={(e) => setRuntime(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/15 focus:outline-none"
            />
          </div>
        </div>

        {/* Optional Prerequisites */}
        {movies.length > 0 && (
          <div className="mt-5">
            <label className="mb-2 block text-xs font-semibold text-slate-700">
              Prerequisites (movies to watch first — optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {movies.map((m) => {
                const checked = selectedPrereqs.includes(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() =>
                      setSelectedPrereqs(toggleInList(selectedPrereqs, m.id))
                    }
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      checked
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-2xs'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {checked ? '✓ ' : '+ '}
                    {m.title}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={watched}
              onChange={(e) => setWatched(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            Mark as already watched
          </label>

          <button
            type="submit"
            disabled={creating}
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {creating ? 'Adding Movie...' : '+ Add Movie'}
          </button>
        </div>
      </form>

      {/* Movie List Section */}
      <div className="space-y-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl tracking-wide text-slate-900">
              Movie Catalog ({movies.length})
            </h2>
            <p className="text-xs text-slate-500">
              {watchedCount} watched &bull; {movies.length - watchedCount}{' '}
              remaining
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex gap-1 self-start rounded-xl border border-slate-200 bg-white p-1 shadow-2xs sm:self-auto">
            {(
              [
                { id: 'all', label: `All (${movies.length})` },
                {
                  id: 'unwatched',
                  label: `To Watch (${movies.length - watchedCount})`,
                },
                { id: 'watched', label: `Watched (${watchedCount})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
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

        {filteredMovies.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            No movies match this filter.
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredMovies.map((movie) => {
              const isEditing = editingMovieId === movie.id;
              const isSaving = savingId === movie.id;

              return (
                <div
                  key={movie.id}
                  className={`rounded-2xl border bg-white p-5 shadow-2xs transition ${
                    isEditing
                      ? 'border-indigo-300 ring-2 ring-indigo-500/10'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-start gap-3.5">
                      <input
                        type="checkbox"
                        checked={movie.watched}
                        disabled={isSaving}
                        onChange={() => handleToggleWatched(movie)}
                        className="mt-1 h-5 w-5 cursor-pointer rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        title="Tick as watched"
                      />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-base font-bold ${
                              movie.watched
                                ? 'text-slate-500 line-through decoration-emerald-500'
                                : 'text-slate-900'
                            }`}
                          >
                            {movie.title}
                          </span>
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                            {movie.releaseYear}
                          </span>
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                            {formatRuntime(movie.runtime)}
                          </span>
                          {movie.watched && (
                            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                              Watched ✓
                            </span>
                          )}
                        </div>

                        {/* Prerequisite tags */}
                        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs">
                          <span className="font-semibold text-slate-500">
                            Prerequisites:
                          </span>
                          {movie.prerequisiteIds.length === 0 ? (
                            <span className="rounded-md bg-slate-50 px-2 py-0.5 text-slate-400 italic">
                              None (can watch anytime)
                            </span>
                          ) : (
                            movie.prerequisiteIds.map((pid) => (
                              <span
                                key={pid}
                                className="rounded-md border border-indigo-100 bg-indigo-50/70 px-2.5 py-0.5 font-medium text-indigo-700"
                              >
                                {movieMap.get(pid)?.title ?? 'Unknown'}
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => handleToggleWatched(movie)}
                        className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                          movie.watched
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {movie.watched ? 'Watched ✓' : 'Mark Watched'}
                      </button>

                      {!isEditing && (
                        <button
                          type="button"
                          onClick={() => startEditingPrereqs(movie)}
                          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          Edit Prerequisites
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Inline Prerequisite Editor */}
                  {isEditing && (
                    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                      <p className="mb-2.5 text-xs font-semibold text-slate-700">
                        Select movies to watch before{' '}
                        <span className="text-indigo-600">{movie.title}</span>:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {movies.map((candidate) => {
                          const selected = editPrereqIds.includes(candidate.id);
                          return (
                            <button
                              key={candidate.id}
                              type="button"
                              onClick={() =>
                                setEditPrereqIds(
                                  toggleInList(editPrereqIds, candidate.id),
                                )
                              }
                              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                                selected
                                  ? 'border-indigo-600 bg-indigo-600 text-white shadow-2xs'
                                  : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                              }`}
                            >
                              {selected ? '✓ ' : '+ '}
                              {candidate.title}
                              {candidate.id === movie.id ? ' (self)' : ''}
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-4 flex items-center gap-2">
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => handleSavePrereqs(movie.id)}
                          className="rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-indigo-700 disabled:opacity-50"
                        >
                          {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingMovieId(null)}
                          className="rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
