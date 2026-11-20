import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { CircularDependencyException } from '../common/exceptions/circular-dependency.exception.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateMovieDto } from './dto/create-movie.dto.js';
import { UpdateMovieDto } from './dto/update-movie.dto.js';
import {
  computeRewatchOrder,
  MovieNode,
  wouldCreateCycle,
} from './rewatch-order.js';

/** Load each movie together with the ids of its prerequisites. */
const withPrerequisites = {
  prerequisites: { select: { prerequisiteId: true } },
} satisfies Prisma.MovieInclude;

type MovieWithPrerequisites = Prisma.MovieGetPayload<{
  include: typeof withPrerequisites;
}>;

/** Flatten `prerequisites: [{ prerequisiteId }]` into `prerequisiteIds: string[]`. */
function toMovieResponse({ prerequisites, ...movie }: MovieWithPrerequisites) {
  return {
    ...movie,
    prerequisiteIds: prerequisites.map((p) => p.prerequisiteId),
  };
}

@Injectable()
export class MoviesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMovieDto) {
    const { prerequisiteIds = [], ...data } = dto;
    await this.assertMoviesExist(this.prisma, prerequisiteIds);

    // A brand-new movie has no dependents yet, so it cannot close a cycle.
    const movie = await this.prisma.movie.create({
      data: {
        ...data,
        prerequisites: {
          create: prerequisiteIds.map((prerequisiteId) => ({ prerequisiteId })),
        },
      },
      include: withPrerequisites,
    });

    return toMovieResponse(movie);
  }

  async findAll() {
    const movies = await this.prisma.movie.findMany({
      orderBy: [{ releaseYear: 'asc' }, { title: 'asc' }],
      include: withPrerequisites,
    });
    return movies.map(toMovieResponse);
  }

  async update(id: string, dto: UpdateMovieDto) {
    const { prerequisiteIds, ...data } = dto;

    // Serializable: two concurrent updates can't sneak a cycle in together.
    const movie = await this.prisma.$transaction(
      async (tx) => {
        const existing = await tx.movie.findUnique({ where: { id } });
        if (!existing) {
          throw new NotFoundException(`Movie with id "${id}" not found`);
        }

        // `prerequisiteIds` replaces the whole list when it is provided.
        if (prerequisiteIds) {
          await this.assertMoviesExist(tx, prerequisiteIds);
          await this.assertNoCycle(tx, id, prerequisiteIds);

          await tx.moviePrerequisite.deleteMany({ where: { movieId: id } });
          await tx.moviePrerequisite.createMany({
            data: prerequisiteIds.map((prerequisiteId) => ({
              movieId: id,
              prerequisiteId,
            })),
          });
        }

        return tx.movie.update({
          where: { id },
          data,
          include: withPrerequisites,
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    return toMovieResponse(movie);
  }

  async getRewatchOrder(id: string) {
    const all = await this.prisma.movie.findMany({
      include: withPrerequisites,
    });

    const movies = new Map<string, MovieNode>();
    for (const movie of all) {
      const { createdAt: _c, updatedAt: _u, ...node } = toMovieResponse(movie);
      movies.set(movie.id, node);
    }

    const target = movies.get(id);
    if (!target) {
      throw new NotFoundException(`Movie with id "${id}" not found`);
    }

    return { target, ...computeRewatchOrder(id, movies) };
  }

  /** 400 if any of the given prerequisite ids is not an existing movie. */
  private async assertMoviesExist(
    db: Prisma.TransactionClient,
    ids: string[],
  ): Promise<void> {
    if (ids.length === 0) return;

    const found = await db.movie.count({ where: { id: { in: ids } } });
    if (found !== ids.length) {
      throw new BadRequestException(
        'One or more prerequisite movie IDs do not exist.',
      );
    }
  }

  /** 409 CIRCULAR_DEPENDENCY if the new prerequisites would form a loop. */
  private async assertNoCycle(
    db: Prisma.TransactionClient,
    movieId: string,
    prerequisiteIds: string[],
  ): Promise<void> {
    // Every edge except this movie's current ones (they're being replaced).
    const edges = await db.moviePrerequisite.findMany({
      where: { movieId: { not: movieId } },
      select: { movieId: true, prerequisiteId: true },
    });

    const graph = new Map<string, string[]>();
    for (const { movieId: from, prerequisiteId } of edges) {
      graph.set(from, [...(graph.get(from) ?? []), prerequisiteId]);
    }

    if (wouldCreateCycle(movieId, prerequisiteIds, graph)) {
      throw new CircularDependencyException();
    }
  }
}
