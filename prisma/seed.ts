import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

interface SeedMovie {
  title: string;
  releaseYear: number;
  runtime: number;
  watched: boolean;
  prerequisites: string[];
}

const SAMPLE_MOVIES: SeedMovie[] = [
  {
    title: 'Iron Man',
    releaseYear: 2008,
    runtime: 126,
    watched: false,
    prerequisites: [],
  },
  {
    title: 'Captain America: The First Avenger',
    releaseYear: 2011,
    runtime: 124,
    watched: false,
    prerequisites: [],
  },
  {
    title: 'The Avengers',
    releaseYear: 2012,
    runtime: 143,
    watched: false,
    prerequisites: ['Iron Man', 'Captain America: The First Avenger'],
  },
  {
    title: 'Captain America: Civil War',
    releaseYear: 2016,
    runtime: 147,
    watched: false,
    prerequisites: ['The Avengers'],
  },
  {
    title: 'Thor: Ragnarok',
    releaseYear: 2017,
    runtime: 130,
    watched: false,
    prerequisites: [],
  },
  {
    title: 'Avengers: Infinity War',
    releaseYear: 2018,
    runtime: 149,
    watched: false,
    prerequisites: ['Captain America: Civil War', 'Thor: Ragnarok'],
  },
  {
    title: 'Avengers: Endgame',
    releaseYear: 2019,
    runtime: 181,
    watched: false,
    prerequisites: ['Avengers: Infinity War'],
  },
  {
    title: 'Avengers: Doomsday',
    releaseYear: 2026,
    runtime: 150,
    watched: false,
    prerequisites: ['Avengers: Endgame'],
  },
];

const SAMPLE_CINEMAS = [
  {
    name: 'Stark IMAX',
    bundleSizes: [1, 3, 4],
  },
  {
    name: 'Avengers Multiplex',
    bundleSizes: [2, 5],
  },
  {
    name: 'Sanctum Cinema',
    bundleSizes: [6, 9, 20],
  },
];

async function main() {
  console.log('Seeding Doomsday Ready database...');

  // 1. Upsert all sample movies
  const titleToId = new Map<string, string>();
  for (const movie of SAMPLE_MOVIES) {
    const record = await prisma.movie.upsert({
      where: { title: movie.title },
      update: {
        releaseYear: movie.releaseYear,
        runtime: movie.runtime,
      },
      create: {
        title: movie.title,
        releaseYear: movie.releaseYear,
        runtime: movie.runtime,
        watched: movie.watched,
      },
    });
    titleToId.set(movie.title, record.id);
  }

  // 2. Upsert prerequisite links idempotently
  for (const movie of SAMPLE_MOVIES) {
    const movieId = titleToId.get(movie.title)!;
    for (const prereqTitle of movie.prerequisites) {
      const prerequisiteId = titleToId.get(prereqTitle)!;
      await prisma.moviePrerequisite.upsert({
        where: {
          movieId_prerequisiteId: { movieId, prerequisiteId },
        },
        update: {},
        create: { movieId, prerequisiteId },
      });
    }
  }

  // 3. Upsert sample cinemas
  for (const cinema of SAMPLE_CINEMAS) {
    await prisma.cinema.upsert({
      where: { name: cinema.name },
      update: { bundleSizes: cinema.bundleSizes },
      create: {
        name: cinema.name,
        bundleSizes: cinema.bundleSizes,
      },
    });
  }

  console.log(
    `Seeded ${SAMPLE_MOVIES.length} MCU movies (with prerequisites) and ${SAMPLE_CINEMAS.length} cinemas.`,
  );
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
