import { Module } from '@nestjs/common';
import { CinemasController } from './cinemas.controller.js';
import { CinemasService } from './cinemas.service.js';

@Module({
  controllers: [CinemasController],
  providers: [CinemasService],
  exports: [CinemasService],
})
export class CinemasModule {}
