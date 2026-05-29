import { Body, Controller, Get, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImportsService } from './imports.service';

@Controller('imports')
export class ImportsController {
  constructor(private readonly importsService: ImportsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 15 * 1024 * 1024 } }))
  async uploadExcel(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { sheetName?: string; periodStart?: string; periodEnd?: string; periodWorkingDays?: string; workingDaysPerYear?: string },
  ) {
    return this.importsService.uploadAndNormalize(file, {
      sheetName: body.sheetName,
      periodStart: body.periodStart ? new Date(body.periodStart) : undefined,
      periodEnd: body.periodEnd ? new Date(body.periodEnd) : undefined,
      periodWorkingDays: body.periodWorkingDays ? Number(body.periodWorkingDays) : undefined,
      workingDaysPerYear: body.workingDaysPerYear ? Number(body.workingDaysPerYear) : 220,
    });
  }

  @Get()
  async listImports() {
    return this.importsService.listImports();
  }

  @Get(':id')
  async getImport(@Param('id') id: string) {
    return this.importsService.getImport(id);
  }
}
