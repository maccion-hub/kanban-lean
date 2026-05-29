import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export const defaultRoundingRules = [
  { upTo: 5, multiple: 1 },
  { upTo: 20, multiple: 5 },
  { upTo: 100, multiple: 10 },
  { upTo: 500, multiple: 25 },
  { upTo: null, multiple: 50 },
];

@Injectable()
export class KanbanConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    return this.prisma.kanbanConfig.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async get(id: string) {
    const cfg = await this.prisma.kanbanConfig.findUnique({ where: { id } });
    if (!cfg) throw new NotFoundException('Kanban config not found');
    return cfg;
  }

  async getOrCreateDefault() {
    const existing = await this.prisma.kanbanConfig.findFirst({ where: { isDefault: true } });
    if (existing) return existing;
    return this.prisma.kanbanConfig.create({
      data: {
        name: 'Default Lean Kanban parameters',
        isDefault: true,
        roundingJson: defaultRoundingRules,
      },
    });
  }

  async create(dto: any) {
    return this.prisma.kanbanConfig.create({
      data: {
        name: dto.name || 'Kanban configuration',
        isDefault: Boolean(dto.isDefault),
        workingDaysPerYear: Number(dto.workingDaysPerYear || 220),
        leadTimeDays: Number(dto.leadTimeDays || 2),
        safetyStockDays: Number(dto.safetyStockDays || 5),
        lowCostMax: Number(dto.lowCostMax ?? 1),
        mediumCostMax: Number(dto.mediumCostMax ?? 10),
        lowCostLotDays: Number(dto.lowCostLotDays || 20),
        mediumCostLotDays: Number(dto.mediumCostLotDays || 15),
        highCostLotDays: Number(dto.highCostLotDays || 10),
        validationUnitCostMin: Number(dto.validationUnitCostMin || 50),
        validationKmaxValueMin: Number(dto.validationKmaxValueMin || 300),
        roundingJson: dto.roundingRules || defaultRoundingRules,
      },
    });
  }

  async update(id: string, dto: any) {
    return this.prisma.kanbanConfig.update({
      where: { id },
      data: {
        name: dto.name,
        isDefault: dto.isDefault,
        workingDaysPerYear: dto.workingDaysPerYear,
        leadTimeDays: dto.leadTimeDays,
        safetyStockDays: dto.safetyStockDays,
        lowCostMax: dto.lowCostMax,
        mediumCostMax: dto.mediumCostMax,
        lowCostLotDays: dto.lowCostLotDays,
        mediumCostLotDays: dto.mediumCostLotDays,
        highCostLotDays: dto.highCostLotDays,
        validationUnitCostMin: dto.validationUnitCostMin,
        validationKmaxValueMin: dto.validationKmaxValueMin,
        roundingJson: dto.roundingRules,
      },
    });
  }
}
