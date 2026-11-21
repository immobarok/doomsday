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
