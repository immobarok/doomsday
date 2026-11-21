import { useState } from 'react';
import { formatRuntime } from '../../api/client';
import type { Movie } from '../../types';
import { Spinner } from '../common/Loader';

interface Props {
  movie: Movie;
  allMovies: Movie[];
  movieMap: Map<string, Movie>;
  saving: boolean;
  onToggleWatched: (movie: Movie) => Promise<void>;
  onSavePrerequisites: (movieId: string, prereqIds: string[]) => Promise<boolean>;
}

export function MovieCard({
  movie,
  allMovies,
  movieMap,
  saving,
  onToggleWatched,
  onSavePrerequisites,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draftPrereqs, setDraftPrereqs] = useState<string[]>([]);

  function openEditor() {
    setDraftPrereqs(movie.prerequisiteIds);
    setEditing(true);
  }

  function toggleCandidate(id: string) {
    setDraftPrereqs((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  async function handleSave() {
    const ok = await onSavePrerequisites(movie.id, draftPrereqs);
    if (ok) {
      setEditing(false);
    }
  }

  return (
    <div
      className={`rounded-2xl border bg-white p-5 shadow-2xs transition ${
        editing
          ? 'border-indigo-300 ring-2 ring-indigo-500/10'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3.5">
          <input
            type="checkbox"
            checked={movie.watched}
            disabled={saving}
            onChange={() => void onToggleWatched(movie)}
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
            disabled={saving}
            onClick={() => void onToggleWatched(movie)}
            className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
              movie.watched
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            {movie.watched ? 'Watched ✓' : 'Mark Watched'}
          </button>

          {!editing && (
            <button
              type="button"
              onClick={openEditor}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Edit Prerequisites
            </button>
          )}
        </div>
      </div>

      {editing && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
          <p className="mb-2.5 text-xs font-semibold text-slate-700">
            Select movies to watch before{' '}
            <span className="text-indigo-600">{movie.title}</span>:
          </p>
          <div className="flex flex-wrap gap-2">
            {allMovies.map((candidate) => {
              const selected = draftPrereqs.includes(candidate.id);
              return (
                <button
                  key={candidate.id}
                  type="button"
                  onClick={() => toggleCandidate(candidate.id)}
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
              disabled={saving}
              onClick={() => void handleSave()}
              className="flex min-w-28 items-center justify-center rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? <Spinner /> : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
