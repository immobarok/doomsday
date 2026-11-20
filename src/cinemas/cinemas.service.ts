import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { computeBookingQuote } from './booking-quote.js';
import { CreateCinemaDto } from './dto/create-cinema.dto.js';

@Injectable()
export class CinemasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCinemaDto) {
    const sortedSizes = [...dto.bundleSizes].sort((a, b) => a - b);

    return this.prisma.cinema.create({
      data: {
        name: dto.name.trim(),
        bundleSizes: sortedSizes,
      },
    });
  }

  async findAll() {
    return this.prisma.cinema.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async getBookingQuote(id: string, groupSize: number) {
    const cinema = await this.prisma.cinema.findUnique({
      where: { id },
    });

    if (!cinema) {
      throw new NotFoundException(`Cinema with id "${id}" not found`);
    }

    const quote = computeBookingQuote(cinema.bundleSizes, groupSize);

    return {
      cinema: {
        id: cinema.id,
        name: cinema.name,
        bundleSizes: cinema.bundleSizes,
      },
      ...quote,
    };
  }
}
