import { Module } from '@nestjs/common';
import { ImportsController } from './imports.controller';
import { ImportsService } from './imports.service';
import { ClaudeModule } from '../claude/claude.module';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  imports: [ClaudeModule],
  controllers: [ImportsController],
  providers: [ImportsService, PrismaService],
  exports: [ImportsService],
})
export class ImportsModule {}
