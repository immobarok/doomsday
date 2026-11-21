import type { FormEvent } from 'react';
import type { Cinema } from '../../types';
import { Spinner } from '../common/Loader';

interface Props {
  cinemas: Cinema[];
  selectedCinemaId: string;
  groupSize: number;
  loading: boolean;
  onSelectCinema: (id: string) => void;
  onChangeGroupSize: (size: number) => void;
  onSubmit: (e: FormEvent) => Promise<void>;
}

const SAMPLE_GROUP_SIZES = [6, 11, 44, 7];

export function BookingQuoteForm({
  cinemas,
  selectedCinemaId,
  groupSize,
  loading,
  onSelectCinema,
  onChangeGroupSize,
  onSubmit,
}: Props) {
  const selectedCinema = cinemas.find((c) => c.id === selectedCinemaId);

  return (
    <form
      onSubmit={(e) => void onSubmit(e)}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs"
    >
      <div className="mb-5 border-b border-slate-100 pb-4">
        <h2 className="text-2xl tracking-wide text-slate-900">
          Opening-Night Watch-Party Booking Quote
        </h2>
        <p className="text-xs text-slate-500">
          Finds the fewest seat bundles that add up to your exact group size so
          nobody pays for an empty seat.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">
            Select Cinema
          </label>
          <select
            value={selectedCinemaId}
            onChange={(e) => onSelectCinema(e.target.value)}
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
            onChange={(e) => onChangeGroupSize(Number(e.target.value))}
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

        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400">Sample group sizes:</span>
          {SAMPLE_GROUP_SIZES.map((sample) => (
            <button
              key={sample}
              type="button"
              onClick={() => onChangeGroupSize(sample)}
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
  );
}
