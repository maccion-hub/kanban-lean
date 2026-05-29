import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { KanbanService } from './kanban.service';

@Controller('kanban')
export class KanbanController {
  constructor(private readonly service: KanbanService) {}

  @Post('generate')
  generate(@Body() dto: { importBatchId?: string; configId?: string; name?: string }) {
    return this.service.generateProposal(dto);
  }

  @Get('proposals')
  listProposals() {
    return this.service.listProposals();
  }

  @Get('proposals/:id')
  getProposal(@Param('id') id: string) {
    return this.service.getProposal(id);
  }

  @Get('proposals/:id/export-json')
  exportJson(@Param('id') id: string) {
    return this.service.exportProposalJson(id);
  }
}
