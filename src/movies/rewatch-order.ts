export interface MovieNode {
  id: string;
  title: string;
  releaseYear: number;
  runtime: number;
  watched: boolean;
  prerequisiteIds: string[];
}

export interface RewatchOrder {
  movies: MovieNode[];
  totalCount: number;
  watchedCount: number;
  unwatchedRuntime: number;
}

/**
 * Returns true if giving `movieId` the prerequisites `newPrerequisiteIds`
 * would make it depend on itself, directly or through other movies.
 *
 * `graph` maps each movie id to the ids of its prerequisites.
 * We walk the prerequisites (and theirs, and so on); if we ever reach
 * `movieId` again, there is a cycle.
 */
export function wouldCreateCycle(
  movieId: string,
  newPrerequisiteIds: string[],
  graph: Map<string, string[]>,
): boolean {
  const visited = new Set<string>();
  const toVisit = [...newPrerequisiteIds];

  while (toVisit.length > 0) {
    const current = toVisit.pop()!;
    if (current === movieId) return true;
    if (visited.has(current)) continue;

    visited.add(current);
    toVisit.push(...(graph.get(current) ?? []));
  }

  return false;
}

/**
 * Returns every movie that must be watched before `targetId`, each exactly
 * once, with every movie placed after all of its prerequisites.
 *
 * How it works (depth-first search):
 *   to "visit" a movie, first visit all of its prerequisites, then add it.
 * That guarantees prerequisites always come first. Prerequisites are visited
 * oldest-first (then by title) so the result is stable and reads naturally.
 */
export function computeRewatchOrder(
  targetId: string,
  movies: Map<string, MovieNode>,
): RewatchOrder {
  const order: MovieNode[] = [];
  const visited = new Set<string>([targetId]); // never include the target

  const prerequisitesOf = (movie: MovieNode): MovieNode[] =>
    movie.prerequisiteIds
      .map((id) => movies.get(id))
      .filter((m): m is MovieNode => m !== undefined)
      .sort(
        (a, b) =>
          a.releaseYear - b.releaseYear || a.title.localeCompare(b.title),
      );

  const visit = (movie: MovieNode): void => {
    if (visited.has(movie.id)) return;
    visited.add(movie.id);
    prerequisitesOf(movie).forEach(visit);
    order.push(movie);
  };

  const target = movies.get(targetId);
  if (target) prerequisitesOf(target).forEach(visit);

  return {
    movies: order,
    totalCount: order.length,
    watchedCount: order.filter((m) => m.watched).length,
    unwatchedRuntime: order
      .filter((m) => !m.watched)
      .reduce((sum, m) => sum + m.runtime, 0),
  };
}
