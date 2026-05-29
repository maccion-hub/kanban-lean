import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { KanbanConfigService } from './kanban-config.service';

@Controller('kanban-configs')
export class KanbanConfigController {
  constructor(private readonly service: KanbanConfigService) {}

  @Get()
  list() {
    return this.service.list();
  }

  @Get('default')
  getDefault() {
    return this.service.getOrCreateDefault();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.get(id);
  }

  @Post()
  create(@Body() dto: any) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.service.update(id, dto);
  }
}
