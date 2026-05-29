import { BadRequestException, Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import * as XLSX from 'xlsx';
import { PrismaService } from '../../prisma/prisma.service';
import { ClaudeMappingService, MappingResult } from '../claude/claude-mapping.service';

export type UploadOptions = {
  sheetName?: string;
  periodStart?: Date;
  periodEnd?: Date;
  periodWorkingDays?: number;
  workingDaysPerYear: number;
};

type ParsedSheet = {
  sheetName: string;
  headers: string[];
  rows: Record<string, unknown>[];
};

@Injectable()
export class ImportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly claudeMapping: ClaudeMappingService,
  ) {}

  async uploadAndNormalize(file: Express.Multer.File, options: UploadOptions) {
    if (!file) throw new BadRequestException('Excel file is required');
    if (!file.originalname.match(/\.xlsx?$/i)) throw new BadRequestException('Only .xlsx or .xls files are accepted');

    const fileHash = createHash('sha256').update(file.buffer).digest('hex');
    const parsed = this.parseWorkbook(file.buffer, options.sheetName);
    const mapping = await this.claudeMapping.inferMapping({
      sheetName: parsed.sheetName,
      headers: parsed.headers,
      sampleRows: parsed.rows.slice(0, 20),
    });

    const importBatch = await this.prisma.importBatch.create({
      data: {
        originalName: file.originalname,
        fileHash,
        sheetName: parsed.sheetName,
        mappingJson: mapping as any,
        rowCount: parsed.rows.length,
        status: 'MAPPING_INFERRED',
      },
    });

    const normalized = this.normalizeRows(parsed.rows, mapping, options);

    let imported = 0;
    for (const row of normalized) {
      const article = await this.prisma.article.upsert({
        where: { code: row.code },
        create: {
          code: row.code,
          description: row.description,
          unitCost: row.unitCost,
          currentStock: row.currentStock ?? null,
          packaging: row.packaging ?? null,
          isCostException: row.unitCost === 0,
          lastImportId: importBatch.id,
        },
        update: {
          description: row.description,
          unitCost: row.unitCost,
          currentStock: row.currentStock ?? null,
          packaging: row.packaging ?? null,
          isCostException: row.unitCost === 0,
          lastImportId: importBatch.id,
        },
      });

      await this.prisma.articleMetric.create({
        data: {
          articleId: article.id,
          importBatchId: importBatch.id,
          periodStart: options.periodStart,
          periodEnd: options.periodEnd,
          periodWorkingDays: options.periodWorkingDays,
          totalConsumption: row.totalConsumption ?? null,
          annualRotation: row.annualRotation ?? null,
          avgDailyDemand: row.avgDailyDemand,
          sourceRowNumber: row.sourceRowNumber,
        },
      });
      imported += 1;
    }

    await this.prisma.importBatch.update({
      where: { id: importBatch.id },
      data: { status: 'NORMALIZED', rowCount: imported },
    });

    return { importBatchId: importBatch.id, imported, mapping, warnings: mapping.warnings };
  }

  async listImports() {
    return this.prisma.importBatch.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });
  }

  async getImport(id: string) {
    return this.prisma.importBatch.findUnique({ where: { id }, include: { articleMetrics: { take: 20, include: { article: true } } } });
  }

  private parseWorkbook(buffer: Buffer, preferredSheet?: string): ParsedSheet {
    const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
    const sheetName = preferredSheet || workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) throw new BadRequestException(`Sheet not found: ${sheetName}`);

    const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null }) as unknown[][];
    const headerRowIndex = this.detectHeaderRow(matrix);
    const headers = matrix[headerRowIndex].map((v) => String(v ?? '').trim()).filter(Boolean);
    const dataRows = matrix.slice(headerRowIndex + 1);
    const rows = dataRows
      .map((cells, idx) => {
        const row: Record<string, unknown> = { __rowNumber: headerRowIndex + idx + 2 };
        headers.forEach((h, i) => (row[h] = cells[i] ?? null));
        return row;
      })
      .filter((r) => Object.values(r).some((v) => v !== null && v !== ''));

    return { sheetName, headers, rows };
  }

  private detectHeaderRow(matrix: unknown[][]): number {
    let best = 0;
    let bestScore = -1;
    matrix.slice(0, 10).forEach((row, idx) => {
      const textCells = row.filter((c) => typeof c === 'string' && String(c).trim().length > 0).length;
      if (textCells > bestScore) {
        bestScore = textCells;
        best = idx;
      }
    });
    return best;
  }

  private normalizeRows(rows: Record<string, unknown>[], mapping: MappingResult, options: UploadOptions) {
    return rows.map((r) => {
      const get = (field?: string) => (field ? r[field] : null);
      const code = String(get(mapping.fields.code) ?? '').trim();
      if (!code) return null;
      const description = String(get(mapping.fields.description) ?? code).trim();
      const unitCost = this.toNumber(get(mapping.fields.unitCost));
      const currentStock = mapping.fields.currentStock ? this.toNumber(get(mapping.fields.currentStock)) : null;
      const totalConsumption = mapping.fields.totalConsumption ? this.toNumber(get(mapping.fields.totalConsumption)) : null;
      const annualRotation = mapping.fields.annualRotation ? this.toNumber(get(mapping.fields.annualRotation)) : null;
      const packaging = mapping.fields.packaging ? String(get(mapping.fields.packaging) ?? '').trim() : null;

      let avgDailyDemand = 0;
      if (totalConsumption !== null && options.periodWorkingDays) {
        avgDailyDemand = totalConsumption / options.periodWorkingDays;
      } else if (annualRotation !== null) {
        avgDailyDemand = annualRotation / options.workingDaysPerYear;
      } else {
        avgDailyDemand = 0;
      }

      return {
        code,
        description,
        unitCost,
        currentStock,
        totalConsumption,
        annualRotation,
        avgDailyDemand,
        packaging,
        sourceRowNumber: Number(r.__rowNumber),
      };
    }).filter(Boolean) as Array<{
      code: string;
      description: string;
      unitCost: number;
      currentStock: number | null;
      totalConsumption: number | null;
      annualRotation: number | null;
      avgDailyDemand: number;
      packaging: string | null;
      sourceRowNumber: number;
    }>;
  }

  private toNumber(value: unknown): number | null {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    const normalized = String(value).replace(/\./g, '').replace(',', '.').replace(/[^0-9.-]/g, '');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }
}
