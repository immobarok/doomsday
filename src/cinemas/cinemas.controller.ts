import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CinemasService } from './cinemas.service.js';
import { BookingQueryDto } from './dto/booking-query.dto.js';
import { CreateCinemaDto } from './dto/create-cinema.dto.js';

@Controller('cinemas')
export class CinemasController {
  constructor(private readonly cinemasService: CinemasService) {}

  @Post()
  create(@Body() dto: CreateCinemaDto) {
    return this.cinemasService.create(dto);
  }

  @Get()
  findAll() {
    return this.cinemasService.findAll();
  }

  @Get(':id/booking')
  getBookingQuote(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Query() query: BookingQueryDto,
  ) {
    return this.cinemasService.getBookingQuote(id, query.groupSize);
  }
}
