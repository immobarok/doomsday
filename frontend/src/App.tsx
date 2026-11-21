import { useCallback, useEffect, useState } from 'react';
import { api, type Cinema, getErrorMessage, type Movie } from './api';
import { BookingView } from './components/BookingView';
import { MoviesView } from './components/MoviesView';
import { RewatchPlanView } from './components/RewatchPlanView';

type Tab = 'movies' | 'rewatch' | 'booking';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('movies');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMovies = useCallback(async () => {
    const res = await api.get<Movie[]>('/movies');
    setMovies(res.data);
  }, []);

  const loadCinemas = useCallback(async () => {
    const res = await api.get<Cinema[]>('/cinemas');
    setCinemas(res.data);
  }, []);

  useEffect(() => {
    async function init() {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([loadMovies(), loadCinemas()]);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    void init();
  }, [loadMovies, loadCinemas]);

  const watchedTotal = movies.filter((m) => m.watched).length;

  const tabs: { id: Tab; label: string; subtitle: string; badge?: string }[] = [
    {
      id: 'movies',
      label: '1. Movies',
      subtitle: 'Manage & Prerequisites',
      badge: `${watchedTotal}/${movies.length}`,
    },
    {
      id: 'rewatch',
      label: '2. Rewatch Plan',
      subtitle: 'Ordered Watch Guide',
    },
    {
      id: 'booking',
      label: '3. Booking',
      subtitle: 'Seat Bundle Quote',
      badge: `${cinemas.length}`,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Navbar */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-4 px-4 py-4 sm:flex-row sm:items-center sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-sm">
              DR
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                Doomsday <span className="text-indigo-600">Ready</span>
              </h1>
              <p className="text-xs text-slate-500">
                MCU Rewatch Planner &amp; Opening-Night Watch-Party Booking
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex gap-1.5 rounded-xl border border-slate-200 bg-slate-100/80 p-1">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition sm:text-sm ${
                    active
                      ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200/70'
                      : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        active
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'bg-slate-200/80 text-slate-600'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <strong className="font-semibold">API Connection Error:</strong>{' '}
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 shadow-sm">
            Loading Doomsday Ready...
          </div>
        ) : (
          <>
            {activeTab === 'movies' && (
              <MoviesView movies={movies} onRefresh={loadMovies} />
            )}
            {activeTab === 'rewatch' && (
              <RewatchPlanView movies={movies} onRefreshMovies={loadMovies} />
            )}
            {activeTab === 'booking' && (
              <BookingView cinemas={cinemas} onRefreshCinemas={loadCinemas} />
            )}
          </>
        )}
      </main>
    </div>
  );
}
