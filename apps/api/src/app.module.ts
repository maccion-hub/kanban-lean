import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { ImportsModule } from './modules/imports/imports.module';
import { ClaudeModule } from './modules/claude/claude.module';
import { ConfigModule } from './modules/config/config.module';
import { KanbanModule } from './modules/kanban/kanban.module';
import { ArticlesModule } from './modules/articles/articles.module';

@Module({
  imports: [ImportsModule, ClaudeModule, ConfigModule, KanbanModule, ArticlesModule],
  providers: [PrismaService],
})
export class AppModule {}
