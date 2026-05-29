import { Module } from '@nestjs/common';
import { KanbanConfigController } from './kanban-config.controller';
import { KanbanConfigService } from './kanban-config.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [KanbanConfigController],
  providers: [KanbanConfigService, PrismaService],
  exports: [KanbanConfigService],
})
export class ConfigModule {}
