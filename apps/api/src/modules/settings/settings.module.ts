import { Global, Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AppSettingsService } from './app-settings.service';
import { SettingsController } from './settings.controller';

@Global()
@Module({
  providers: [PrismaService, AppSettingsService],
  controllers: [SettingsController],
  exports: [AppSettingsService],
})
export class SettingsModule {}
