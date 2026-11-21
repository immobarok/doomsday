import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getErrorMessage, moviesApi } from '../../api/client';
import type { Movie, RewatchPlan } from '../../types';
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

  const loadMovies = useCallback(async () => {
    const data = await moviesApi.getAll();
    setMovies(data);
  }, []);

  useEffect(() => {
    moviesApi
      .getAll()
      .then((data) => setMovies(data))
      .catch((err) => {
        toast.error(getErrorMessage(err));
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
        }
      } catch (err) {
        if (!cancelled) {
          toast.error(getErrorMessage(err));
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
  }

  async function handleToggleWatched(movie: Movie) {
    setTogglingId(movie.id);
    try {
      await moviesApi.update(movie.id, { watched: !movie.watched });
      const [updatedPlan] = await Promise.all([
        moviesApi.getRewatchOrder(targetId),
        loadMovies(),
      ]);
      setPlan(updatedPlan);
      toast.success(
        !movie.watched
          ? `Marked "${movie.title}" as watched.`
          : `Marked "${movie.title}" as unwatched.`,
      );
    } catch (err) {
      toast.error(getErrorMessage(err));
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
