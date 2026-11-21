import { formatRuntime } from '../../api/client';
import type { RewatchPlan } from '../../types';

interface Props {
  plan: RewatchPlan;
}

export function RewatchSummaryCard({ plan }: Props) {
  const progressPercent =
    plan.totalCount > 0
      ? Math.round((plan.watchedCount / plan.totalCount) * 100)
      : 100;

  const unwatchedCount = plan.totalCount - plan.watchedCount;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
          <div className="text-xs font-medium text-slate-500">Target Movie</div>
          <div className="mt-1 text-base font-bold text-slate-900">
            {plan.target.title}
          </div>
          <div className="mt-0.5 text-xs text-slate-500">
            {plan.target.releaseYear} &bull; {formatRuntime(plan.target.runtime)}
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
          <div className="text-xs font-medium text-slate-500">
            Rewatch Progress
          </div>
          <div className="mt-1 text-base font-bold text-indigo-600">
            {plan.watchedCount} of {plan.totalCount} watched
          </div>
          <div className="mt-0.5 text-xs text-slate-500">
            {plan.totalCount === 0
              ? 'No prerequisites required'
              : `${progressPercent}% completed`}
          </div>
        </div>

        <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 p-4">
          <div className="text-xs font-medium text-amber-800">
            Remaining Watch Time
          </div>
          <div className="mt-1 text-base font-bold text-amber-900">
            {formatRuntime(plan.unwatchedRuntime)}
          </div>
          <div className="mt-0.5 text-xs text-amber-700">
            {unwatchedCount} unwatched{' '}
            {unwatchedCount === 1 ? 'movie' : 'movies'}
          </div>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-700">
          <span>
            {plan.totalCount === 0
              ? 'Ready to watch!'
              : `${plan.watchedCount} of ${plan.totalCount} watched`}
          </span>
          <span className="text-emerald-600">{progressPercent}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200/70">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
