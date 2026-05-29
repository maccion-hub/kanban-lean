import { Module } from '@nestjs/common';
import { KanbanController } from './kanban.controller';
import { KanbanService } from './kanban.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [ConfigModule],
  controllers: [KanbanController],
  providers: [KanbanService, PrismaService],
})
export class KanbanModule {}
