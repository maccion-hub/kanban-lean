import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { SettingsModule } from './modules/settings/settings.module';
import { ImportsModule } from './modules/imports/imports.module';
import { ClaudeModule } from './modules/claude/claude.module';
import { ConfigModule } from './modules/config/config.module';
import { KanbanModule } from './modules/kanban/kanban.module';
import { ArticlesModule } from './modules/articles/articles.module';
import { AssistantModule } from './modules/assistant/assistant.module';

@Module({
  imports: [
    SettingsModule,   // global — must be first so AppSettingsService is available
    ClaudeModule,     // global — depends on AppSettingsService
    ImportsModule,
    ConfigModule,
    KanbanModule,
    ArticlesModule,
    AssistantModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
