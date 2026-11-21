import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage, moviesApi } from '../../api/client';
import type { Movie, RewatchPlan } from '../../types';
import { Alert } from '../common/Alert';
import { Loader } from '../common/Loader';
import { RewatchOrderList } from './RewatchOrderList';
import { RewatchSummaryCard } from './RewatchSummaryCard';
import { TargetMoviePicker } from './TargetMoviePicker';

export function RewatchPlanSection() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [plan, setPlan] = useState<RewatchPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadMovies = useCallback(async () => {
    const data = await moviesApi.getAll();
    setMovies(data);
  }, []);

  useEffect(() => {
    moviesApi
      .getAll()
      .then((data) => setMovies(data))
      .catch((err) => {
        setError(getErrorMessage(err));
        setLoading(false);
      });
  }, []);

  const defaultTarget =
    movies.find((m) => m.title.includes('Doomsday'))?.id ??
    movies[movies.length - 1]?.id ??
    '';

  const targetId = selectedId || defaultTarget;
  const movieMap = new Map(movies.map((m) => [m.id, m]));

  useEffect(() => {
    if (!targetId) return;
    let cancelled = false;

    async function fetchPlan() {
      try {
        const data = await moviesApi.getRewatchOrder(targetId);
        if (!cancelled) {
          setPlan(data);
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
      await moviesApi.update(movie.id, { watched: !movie.watched });
      const [updatedPlan] = await Promise.all([
        moviesApi.getRewatchOrder(targetId),
        loadMovies(),
      ]);
      setPlan(updatedPlan);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <TargetMoviePicker
        movies={movies}
        targetId={targetId}
        onSelect={handleSelectTarget}
      />

      {error && (
        <Alert type="error" message={error} onDismiss={() => setError(null)} />
      )}

      {loading && !plan ? (
        <Loader />
      ) : plan ? (
        <>
          <RewatchSummaryCard plan={plan} />
          <RewatchOrderList
            plan={plan}
            movieMap={movieMap}
            togglingId={togglingId}
            onToggleWatched={handleToggleWatched}
          />
        </>
      ) : null}
    </div>
  );
}
