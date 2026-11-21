import { type FormEvent, useCallback, useEffect, useState } from 'react';
import { cinemasApi, getErrorMessage } from '../api/client';
import { Spinner } from '../components/Loader';
import type { BookingQuote, Cinema } from '../types';

export function BookingPage() {
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [chosenCinemaId, setChosenCinemaId] = useState<string>('');
  const [groupSize, setGroupSize] = useState<number>(11);
  const [quote, setQuote] = useState<BookingQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add Cinema form state
  const [newName, setNewName] = useState('');
  const [newBundlesText, setNewBundlesText] = useState('');
  const [creating, setCreating] = useState(false);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  const loadCinemas = useCallback(async () => {
    try {
      const data = await cinemasApi.getAll();
      setCinemas(data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    cinemasApi
      .getAll()
      .then((data) => setCinemas(data))
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  const selectedCinemaId = chosenCinemaId || cinemas[0]?.id || '';

  useEffect(() => {
    if (!selectedCinemaId || groupSize < 1 || groupSize > 10000) return;
    let cancelled = false;

    async function fetchQuote() {
      try {
        const data = await cinemasApi.getBookingQuote(
          selectedCinemaId,
          groupSize,
        );
        if (!cancelled) {
          setQuote(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err));
        }
      }
    }

    void fetchQuote();
    return () => {
      cancelled = true;
    };
  }, [selectedCinemaId, groupSize]);

  async function handleCalculateQuote(e: FormEvent) {
    e.preventDefault();
    if (!selectedCinemaId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await cinemasApi.getBookingQuote(
        selectedCinemaId,
        Number(groupSize),
      );
      setQuote(data);
    } catch (err) {
      setError(getErrorMessage(err));
      setQuote(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateCinema(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setCreateSuccess(null);

    const parsedSizes = newBundlesText
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => !Number.isNaN(n) && n > 0);

    setCreating(true);
    try {
      const created = await cinemasApi.create({
        name: newName,
        bundleSizes: parsedSizes,
      });
      setNewName('');
      setNewBundlesText('');
      setCreateSuccess(`Added cinema "${created.name}".`);
      await loadCinemas();
      setChosenCinemaId(created.id);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setCreating(false);
    }
  }

  const selectedCinema = cinemas.find((c) => c.id === selectedCinemaId);

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <strong className="font-semibold">Error: </strong>
          {error}
        </div>
      )}
      {createSuccess && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {createSuccess}
        </div>
      )}

      {/* Watch-Party Booking Quote Calculator */}
      <form
        onSubmit={handleCalculateQuote}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs"
      >
        <div className="mb-5 border-b border-slate-100 pb-4">
          <h2 className="text-2xl tracking-wide text-slate-900">
            Opening-Night Watch-Party Booking Quote
          </h2>
          <p className="text-xs text-slate-500">
            Finds the fewest seat bundles that add up to your exact group size
            so nobody pays for an empty seat.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Select Cinema
            </label>
            <select
              value={selectedCinemaId}
              onChange={(e) => setChosenCinemaId(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/15 focus:outline-none"
            >
              {cinemas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — bundles [{c.bundleSizes.join(', ')}]
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Group Size (1–10,000 guests)
            </label>
            <input
              type="number"
              required
              min={1}
              max={10000}
              placeholder="e.g. 11"
              value={groupSize}
              onChange={(e) => setGroupSize(Number(e.target.value))}
              className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/15 focus:outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading || !selectedCinemaId}
              className="flex h-11 w-full items-center justify-center rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? <Spinner /> : 'Calculate Bundles'}
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-2">
          {selectedCinema && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
              <span className="font-medium">
                {selectedCinema.name} bundle sizes:
              </span>
              {selectedCinema.bundleSizes.map((size) => (
                <span
                  key={size}
                  className="rounded-md border border-indigo-100 bg-indigo-50 px-2.5 py-0.5 font-semibold text-indigo-700"
                >
                  {size} seats
                </span>
              ))}
            </div>
          )}

          {/* Quick sample group size buttons from assessment table */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400">Sample group sizes:</span>
            {[6, 11, 44, 7].map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => setGroupSize(sample)}
                className={`rounded-lg border px-2.5 py-1 font-semibold transition ${
                  groupSize === sample
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {sample}
              </button>
            ))}
          </div>
        </div>
      </form>

      {/* Quote Result Card */}
      {quote && (
        <div
          className={`rounded-2xl border p-6 shadow-xs ${
            quote.possible
              ? 'border-emerald-200 bg-emerald-50/50'
              : 'border-amber-200 bg-amber-50/60'
          }`}
        >
          {quote.possible ? (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                    Optimal Bundle Combination
                  </span>
                  <h3 className="mt-0.5 text-2xl tracking-wide text-slate-900">
                    {quote.totalBundles}{' '}
                    {quote.totalBundles === 1 ? 'bundle' : 'bundles'}:{' '}
                    <span className="text-emerald-700">
                      {quote.bundles
                        .map((b) => `${b.size} × ${b.count}`)
                        .join(', ')}
                    </span>
                  </h3>
                </div>

                <span className="rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-semibold text-emerald-700 shadow-2xs">
                  Exact Match &bull; {quote.groupSize} seats (0 empty)
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {quote.bundles.map((b) => (
                  <div
                    key={b.size}
                    className="rounded-xl border border-emerald-200/80 bg-white p-4 shadow-2xs"
                  >
                    <div className="text-xs font-medium text-slate-500">
                      {b.size}-Seat Bundle
                    </div>
                    <div className="mt-1 text-lg font-bold text-slate-900">
                      {b.size} &times; {b.count}
                    </div>
                    <div className="mt-0.5 text-xs font-semibold text-indigo-600">
                      Buy {b.count} {b.count === 1 ? 'bundle' : 'bundles'} (
                      {b.size * b.count} seats)
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                No Exact Match
              </span>
              <h3 className="mt-0.5 text-2xl tracking-wide text-amber-900">
                Not possible
              </h3>
              <p className="mt-1 text-sm text-amber-800">
                No combination of bundles [
                {quote.cinema.bundleSizes.join(', ')}] adds up to exactly{' '}
                <strong>{quote.groupSize}</strong> seats without empty seats.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Add a New Cinema */}
      <form
        onSubmit={handleCreateCinema}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs"
      >
        <div className="mb-4">
          <h3 className="text-2xl tracking-wide text-slate-900">
            Add a New Cinema
          </h3>
          <p className="text-xs text-slate-500">
            Enter 1 to 10 unique bundle sizes, each holding 1 to 500 seats.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Cinema Name (unique) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Wakanda Grand IMAX"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/15 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Bundle Sizes (comma-separated){' '}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 4, 6"
              value={newBundlesText}
              onChange={(e) => setNewBundlesText(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/15 focus:outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={creating}
              className="flex h-11 w-full items-center justify-center rounded-xl border border-slate-300 bg-slate-900 px-4 text-sm font-semibold text-white shadow-2xs transition hover:bg-slate-800 disabled:opacity-50"
            >
              {creating ? <Spinner /> : '+ Add Cinema'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
