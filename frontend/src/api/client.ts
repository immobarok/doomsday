import axios from 'axios';
import type { BookingQuote, Cinema, Movie, RewatchPlan } from '../types';

export const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    (import.meta.env.DEV ? 'http://localhost:3000/api' : '/api'),
});

export const moviesApi = {
  getAll: () => api.get<Movie[]>('/movies').then((r) => r.data),
  create: (payload: {
    title: string;
    releaseYear: number;
    runtime: number;
    watched?: boolean;
    prerequisiteIds?: string[];
  }) => api.post<Movie>('/movies', payload).then((r) => r.data),
  update: (
    id: string,
    payload: {
      watched?: boolean;
      prerequisiteIds?: string[];
    },
  ) => api.patch<Movie>(`/movies/${id}`, payload).then((r) => r.data),
  getRewatchOrder: (id: string) =>
    api.get<RewatchPlan>(`/movies/${id}/rewatch-order`).then((r) => r.data),
};

export const cinemasApi = {
  getAll: () => api.get<Cinema[]>('/cinemas').then((r) => r.data),
  create: (payload: { name: string; bundleSizes: number[] }) =>
    api.post<Cinema>('/cinemas', payload).then((r) => r.data),
  getBookingQuote: (id: string, groupSize: number) =>
    api
      .get<BookingQuote>(`/cinemas/${id}/booking`, { params: { groupSize } })
      .then((r) => r.data),
};

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
