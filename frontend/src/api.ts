import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

export interface Movie {
  id: string;
  title: string;
  releaseYear: number;
  runtime: number;
  watched: boolean;
  prerequisiteIds: string[];
}

export interface RewatchPlan {
  target: Movie;
  movies: Movie[];
  totalCount: number;
  watchedCount: number;
  unwatchedRuntime: number;
}

export interface Cinema {
  id: string;
  name: string;
  bundleSizes: number[];
}

export interface BookingQuote {
  cinema: Cinema;
  possible: boolean;
  groupSize: number;
  totalBundles: number;
  bundles: { size: number; count: number }[];
  message?: string;
}

/** Extracts a readable error message from an Axios API error response. */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error) && error.response?.data) {
    const data = error.response.data as {
      statusCode?: number;
      code?: string;
      message?: string | string[];
    };
    const msg = Array.isArray(data.message)
      ? data.message.join(', ')
      : data.message || 'Request failed';

    if (data.code === 'CIRCULAR_DEPENDENCY') {
      return `409 CIRCULAR_DEPENDENCY: ${msg}`;
    }
    return data.code ? `${data.code}: ${msg}` : msg;
  }
  return error instanceof Error ? error.message : 'Something went wrong';
}

/** Formats minutes like 143 -> "143 min (2h 23m)". */
export function formatRuntime(minutes: number): string {
  if (minutes <= 0) return '0 min';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${minutes} min (${h}h)`;
  return `${minutes} min (${h}h ${m}m)`;
}
