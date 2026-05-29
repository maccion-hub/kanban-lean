import { Module } from '@nestjs/common';
import { ClaudeMappingService } from './claude-mapping.service';

@Module({
  providers: [ClaudeMappingService],
  exports: [ClaudeMappingService],
})
export class ClaudeModule {}
