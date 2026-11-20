import { PartialType } from '@nestjs/mapped-types';
import { CreateMovieDto } from './create-movie.dto.js';

/** Same rules as creating a movie, but every field is optional. */
export class UpdateMovieDto extends PartialType(CreateMovieDto) {}
