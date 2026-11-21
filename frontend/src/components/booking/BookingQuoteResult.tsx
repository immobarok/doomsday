import type { BookingQuote } from '../../types';

interface Props {
  quote: BookingQuote;
}

export function BookingQuoteResult({ quote }: Props) {
  if (!quote.possible) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6 shadow-xs">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
          No Exact Match
        </span>
        <h3 className="mt-0.5 text-2xl tracking-wide text-amber-900">
          Not possible
        </h3>
        <p className="mt-1 text-sm text-amber-800">
          No combination of bundles [{quote.cinema.bundleSizes.join(', ')}] adds
          up to exactly <strong>{quote.groupSize}</strong> seats without empty
          seats.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Optimal Bundle Combination
          </span>
          <h3 className="mt-0.5 text-2xl tracking-wide text-slate-900">
            {quote.totalBundles}{' '}
            {quote.totalBundles === 1 ? 'bundle' : 'bundles'}:{' '}
            <span className="text-emerald-700">
              {quote.bundles.map((b) => `${b.size} × ${b.count}`).join(', ')}
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
  );
}
