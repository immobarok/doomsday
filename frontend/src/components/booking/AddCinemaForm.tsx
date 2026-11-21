import { type FormEvent, useState } from 'react';
import { cinemasApi, getErrorMessage } from '../../api/client';
import type { Cinema } from '../../types';
import { Spinner } from '../common/Loader';

interface Props {
  onCreated: (cinema: Cinema) => Promise<void>;
  onError: (msg: string) => void;
}

export function AddCinemaForm({ onCreated, onError }: Props) {
  const [name, setName] = useState('');
  const [bundlesText, setBundlesText] = useState('');
  const [creating, setCreating] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsedSizes = bundlesText
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => !Number.isNaN(n) && n > 0);

    setCreating(true);
    try {
      const created = await cinemasApi.create({
        name: name.trim(),
        bundleSizes: parsedSizes,
      });
      setName('');
      setBundlesText('');
      await onCreated(created);
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
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            value={bundlesText}
            onChange={(e) => setBundlesText(e.target.value)}
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
  );
}
