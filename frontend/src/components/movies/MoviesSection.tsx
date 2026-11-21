import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getErrorMessage, moviesApi } from '../../api/client';
import type { Movie } from '../../types';
import { Loader } from '../common/Loader';
import { AddMovieForm } from './AddMovieForm';
import { MovieCard } from './MovieCard';
import { type MovieFilter, MovieFilterBar } from './MovieFilterBar';

export function MoviesSection() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<MovieFilter>('all');

  const loadMovies = useCallback(async () => {
    const data = await moviesApi.getAll();
    setMovies(data);
  }, []);

  useEffect(() => {
    moviesApi
      .getAll()
      .then((data) => setMovies(data))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreated(title: string) {
    toast.success(`Added "${title}" to the rewatch catalog.`);
    await loadMovies();
  }

  async function handleToggleWatched(movie: Movie) {
    setSavingId(movie.id);
    try {
      await moviesApi.update(movie.id, { watched: !movie.watched });
      await loadMovies();
      toast.success(
        !movie.watched
          ? `Marked "${movie.title}" as watched.`
          : `Marked "${movie.title}" as unwatched.`,
      );
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingId(null);
    }
  }

  async function handleSavePrerequisites(
    movieId: string,
    prerequisiteIds: string[],
  ): Promise<boolean> {
    setSavingId(movieId);
    try {
      await moviesApi.update(movieId, { prerequisiteIds });
      toast.success('Prerequisites updated successfully.');
      await loadMovies();
      return true;
    } catch (err) {
      toast.error(getErrorMessage(err));
      return false;
    } finally {
      setSavingId(null);
    }
  }

  if (loading) {
    return <Loader />;
  }

  const movieMap = new Map(movies.map((m) => [m.id, m]));
  const watchedCount = movies.filter((m) => m.watched).length;
  const filteredMovies = movies.filter((m) => {
    if (filter === 'watched') return m.watched;
    if (filter === 'unwatched') return !m.watched;
    return true;
  });

  return (
    <div className="space-y-8">
      <AddMovieForm
        movies={movies}
        onCreated={handleCreated}
        onError={(msg) => toast.error(msg)}
      />

      <div className="space-y-4">
        <MovieFilterBar
          total={movies.length}
          watchedCount={watchedCount}
          filter={filter}
          onFilterChange={setFilter}
        />

        {filteredMovies.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            No movies match this filter.
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                allMovies={movies}
                movieMap={movieMap}
                saving={savingId === movie.id}
                onToggleWatched={handleToggleWatched}
                onSavePrerequisites={handleSavePrerequisites}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
