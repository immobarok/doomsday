import { type FormEvent, useState } from 'react';
import { getErrorMessage, moviesApi } from '../../api/client';
import type { Movie } from '../../types';
import { Spinner } from '../common/Loader';

interface Props {
  movies: Movie[];
  onCreated: (title: string) => Promise<void>;
  onError: (msg: string) => void;
}

export function AddMovieForm({ movies, onCreated, onError }: Props) {
  const [title, setTitle] = useState('');
  const [releaseYear, setReleaseYear] = useState(2026);
  const [runtime, setRuntime] = useState(140);
  const [watched, setWatched] = useState(false);
  const [prerequisiteIds, setPrerequisiteIds] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  const togglePrereq = (id: string) =>
    setPrerequisiteIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const trimmed = title.trim();
      await moviesApi.create({
        title: trimmed,
        releaseYear: Number(releaseYear),
        runtime: Number(runtime),
        watched,
        prerequisiteIds,
      });
      setTitle('');
      setReleaseYear(2026);
      setRuntime(140);
      setWatched(false);
      setPrerequisiteIds([]);
      await onCreated(trimmed);
    } catch (err) {
      onError(getErrorMessage(err));
    } finally {
      setCreating(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs"
    >
      <div className="mb-5 border-b border-slate-100 pb-4">
        <h2 className="text-2xl tracking-wide text-slate-900">
          Add a New MCU Movie
        </h2>
        <p className="text-xs text-slate-500">
          Title must be unique; runtime must be between 1 and 300 minutes.
        </p>
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
            className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/15 focus:outline-none"
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
            className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/15 focus:outline-none"
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
            className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/15 focus:outline-none"
          />
        </div>
      </div>

      {movies.length > 0 && (
        <div className="mt-5">
          <label className="mb-2 block text-xs font-semibold text-slate-700">
            Prerequisites (movies to watch first — optional)
          </label>
          <div className="flex flex-wrap gap-2">
            {movies.map((m) => {
              const checked = prerequisiteIds.includes(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => togglePrereq(m.id)}
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
          className="flex h-10 min-w-34 items-center justify-center rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-700 disabled:opacity-50"
        >
          {creating ? <Spinner /> : '+ Add Movie'}
        </button>
      </div>
    </form>
  );
}
