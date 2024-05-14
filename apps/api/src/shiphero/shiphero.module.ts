import { Module } from '@nestjs/common';
import { ShipheroService } from './shiphero.service';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [ShipheroService, PrismaService],
})
export class ShipheroModule {}
