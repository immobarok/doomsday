import { describe, expect, it } from 'vitest';
import {
  computeRewatchOrder,
  MovieNode,
  wouldCreateCycle,
} from './rewatch-order.js';

// Sample data from the assessment brief (Iron Man, First Avenger and Ragnarok are watched).
const SAMPLE: MovieNode[] = [
  {
    id: 'iron-man',
    title: 'Iron Man',
    releaseYear: 2008,
    runtime: 126,
    watched: true,
    prerequisiteIds: [],
  },
  {
    id: 'first-avenger',
    title: 'Captain America: The First Avenger',
    releaseYear: 2011,
    runtime: 124,
    watched: true,
    prerequisiteIds: [],
  },
  {
    id: 'avengers',
    title: 'The Avengers',
    releaseYear: 2012,
    runtime: 143,
    watched: false,
    prerequisiteIds: ['iron-man', 'first-avenger'],
  },
  {
    id: 'civil-war',
    title: 'Captain America: Civil War',
    releaseYear: 2016,
    runtime: 147,
    watched: false,
    prerequisiteIds: ['avengers'],
  },
  {
    id: 'ragnarok',
    title: 'Thor: Ragnarok',
    releaseYear: 2017,
    runtime: 130,
    watched: true,
    prerequisiteIds: [],
  },
  {
    id: 'infinity-war',
    title: 'Avengers: Infinity War',
    releaseYear: 2018,
    runtime: 149,
    watched: false,
    prerequisiteIds: ['civil-war', 'ragnarok'],
  },
  {
    id: 'endgame',
    title: 'Avengers: Endgame',
    releaseYear: 2019,
    runtime: 181,
    watched: false,
    prerequisiteIds: ['infinity-war'],
  },
  {
    id: 'doomsday',
    title: 'Avengers: Doomsday',
    releaseYear: 2026,
    runtime: 150,
    watched: false,
    prerequisiteIds: ['endgame'],
  },
];

const movies = new Map(SAMPLE.map((m) => [m.id, m]));
const graph = new Map(SAMPLE.map((m) => [m.id, m.prerequisiteIds]));

describe('computeRewatchOrder', () => {
  it('Avengers: Doomsday -> all 7 other movies, prerequisites first', () => {
    const result = computeRewatchOrder('doomsday', movies);

    expect(result.movies.map((m) => m.id)).toEqual([
      'iron-man',
      'first-avenger',
      'avengers',
      'civil-war',
      'ragnarok',
      'infinity-war',
      'endgame',
    ]);
    expect(result.totalCount).toBe(7);
    expect(result.watchedCount).toBe(3);
    expect(result.unwatchedRuntime).toBe(143 + 147 + 149 + 181);
  });

  it('Captain America: Civil War -> Iron Man & First Avenger (any order), then The Avengers', () => {
    const ids = computeRewatchOrder('civil-war', movies).movies.map(
      (m) => m.id,
    );

    expect(ids).toHaveLength(3);
    expect(ids.slice(0, 2).sort()).toEqual(['first-avenger', 'iron-man']);
    expect(ids[2]).toBe('avengers');
  });

  it('Thor: Ragnarok -> empty list', () => {
    expect(computeRewatchOrder('ragnarok', movies)).toEqual({
      movies: [],
      totalCount: 0,
      watchedCount: 0,
      unwatchedRuntime: 0,
    });
  });

  it('includes a shared prerequisite only once (diamond shape)', () => {
    const ids = computeRewatchOrder('infinity-war', movies).movies.map(
      (m) => m.id,
    );
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('wouldCreateCycle', () => {
  it('rejects a movie depending on itself', () => {
    expect(wouldCreateCycle('iron-man', ['iron-man'], graph)).toBe(true);
  });

  it('rejects making Avengers: Endgame a prerequisite of Iron Man', () => {
    expect(wouldCreateCycle('iron-man', ['endgame'], graph)).toBe(true);
  });

  it('allows a valid prerequisite', () => {
    expect(wouldCreateCycle('ragnarok', ['iron-man'], graph)).toBe(false);
  });
});
