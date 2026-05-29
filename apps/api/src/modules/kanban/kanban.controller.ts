import { Body, Controller, Get, Header, Param, Post, Res, StreamableFile } from '@nestjs/common';
import type { Response } from 'express';
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

  @Get('proposals/:id/export-xlsx')
  async exportXlsx(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const proposal = await this.service.getProposal(id);
    const buffer = await this.service.exportProposalXlsx(id);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="kanban-v${proposal.versionNumber}-${id.slice(0, 8)}.xlsx"`,
    });
    return new StreamableFile(buffer);
  }

  @Get('proposals/:id/export-json')
  exportJson(@Param('id') id: string) {
    return this.service.getProposal(id);
  }
}
