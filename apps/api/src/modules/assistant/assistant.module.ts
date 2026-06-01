import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AssistantService } from './assistant.service';
import { AssistantController } from './assistant.controller';

@Module({
  providers: [PrismaService, AssistantService],
  controllers: [AssistantController],
})
export class AssistantModule {}
