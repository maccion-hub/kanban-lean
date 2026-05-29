import { Injectable, NotFoundException } from '@nestjs/common';
import { createHash } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { KanbanConfigService } from '../config/kanban-config.service';
import { calculateKanban, KanbanConfigValues } from './kanban-algorithm';

@Injectable()
export class KanbanService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: KanbanConfigService,
  ) {}

  async generateProposal(dto: { importBatchId?: string; configId?: string; name?: string }) {
    const config = dto.configId ? await this.configService.get(dto.configId) : await this.configService.getOrCreateDefault();
    const sourceImport = dto.importBatchId
      ? await this.prisma.importBatch.findUnique({ where: { id: dto.importBatchId } })
      : await this.prisma.importBatch.findFirst({ where: { status: 'NORMALIZED' }, orderBy: { createdAt: 'desc' } });
    if (!sourceImport) throw new NotFoundException('No normalized import found');

    const metrics = await this.prisma.articleMetric.findMany({
      where: { importBatchId: sourceImport.id, avgDailyDemand: { gt: 0 } },
      include: { article: true },
      orderBy: { avgDailyDemand: 'desc' },
    });

    const configValues = this.toConfigValues(config);
    const calculated = metrics.map((m) => calculateKanban({
      articleId: m.article.id,
      code: m.article.code,
      description: m.article.description,
      unitCost: Number(m.article.unitCost),
      avgDailyDemand: Number(m.avgDailyDemand),
    }, configValues));

    const summary = {
      itemCount: calculated.length,
      simplePhysicalCount: calculated.filter((i) => i.controlType === 'PHYSICAL_SIMPLE').length,
      validationRequiredCount: calculated.filter((i) => i.controlType === 'VALIDATION_REQUIRED').length,
      costZeroExceptionCount: calculated.filter((i) => i.controlType === 'COST_ZERO_EXCEPTION').length,
      totalValueAtKmax: roundMoney(calculated.reduce((s, i) => s + i.valueAtKmax, 0)),
      averageInventoryValue: roundMoney(calculated.reduce((s, i) => s + i.averageStockValue, 0)),
      top10ByKmaxValue: [...calculated].sort((a, b) => b.valueAtKmax - a.valueAtKmax).slice(0, 10).map((i) => ({ code: i.code, description: i.description, valueAtKmax: i.valueAtKmax })),
    };

    const sourceHash = createHash('sha256').update(JSON.stringify({ importId: sourceImport.id, importHash: sourceImport.fileHash, config: configValues, calculated })).digest('hex');
    const previous = await this.prisma.kanbanProposal.findFirst({ orderBy: { versionNumber: 'desc' }, include: { items: true } });
    const existing = await this.prisma.kanbanProposal.findUnique({ where: { sourceHash } });
    if (existing) return { proposalId: existing.id, unchanged: true, summary: existing.summaryJson };

    const versionNumber = (previous?.versionNumber || 0) + 1;
    const proposal = await this.prisma.kanbanProposal.create({
      data: {
        versionNumber,
        name: dto.name || `Kanban proposal v${versionNumber}`,
        sourceImportId: sourceImport.id,
        configId: config.id,
        sourceHash,
        configSnapshot: configValues as any,
        summaryJson: summary as any,
      },
    });

    const previousByCode = new Map((previous?.items || []).map((i) => [i.code, i]));
    for (const item of calculated) {
      const prev = previousByCode.get(item.code);
      const diffJson = prev ? {
        kminDelta: item.kmin - prev.kmin,
        klotDelta: item.klot - prev.klot,
        kmaxDelta: item.kmax - prev.kmax,
        unitCostDelta: item.unitCost - Number(prev.unitCost),
        avgDailyDemandDelta: item.avgDailyDemand - Number(prev.avgDailyDemand),
      } : { newItem: true };

      await this.prisma.kanbanProposalItem.create({
        data: {
          proposalId: proposal.id,
          articleId: item.articleId,
          code: item.code,
          description: item.description,
          unitCost: item.unitCost,
          avgDailyDemand: item.avgDailyDemand,
          kminRaw: item.kminRaw,
          klotRaw: item.klotRaw,
          kmin: item.kmin,
          klot: item.klot,
          kmax: item.kmax,
          lotCoverageDays: item.lotCoverageDays,
          valueAtKmin: item.valueAtKmin,
          valueAtKmax: item.valueAtKmax,
          averageStockUnits: item.averageStockUnits,
          averageStockValue: item.averageStockValue,
          controlType: item.controlType,
          rationale: item.rationale,
          diffJson: diffJson as any,
        },
      });
    }

    return { proposalId: proposal.id, versionNumber, summary };
  }

  async listProposals() {
    return this.prisma.kanbanProposal.findMany({ orderBy: { versionNumber: 'desc' }, take: 50 });
  }

  async getProposal(id: string) {
    const proposal = await this.prisma.kanbanProposal.findUnique({
      where: { id },
      include: { items: { orderBy: { valueAtKmax: 'desc' } } },
    });
    if (!proposal) throw new NotFoundException('Proposal not found');
    return proposal;
  }

  async exportProposalJson(id: string) {
    return this.getProposal(id);
  }

  private toConfigValues(config: any): KanbanConfigValues {
    return {
      leadTimeDays: Number(config.leadTimeDays),
      safetyStockDays: Number(config.safetyStockDays),
      lowCostMax: Number(config.lowCostMax),
      mediumCostMax: Number(config.mediumCostMax),
      lowCostLotDays: Number(config.lowCostLotDays),
      mediumCostLotDays: Number(config.mediumCostLotDays),
      highCostLotDays: Number(config.highCostLotDays),
      validationUnitCostMin: Number(config.validationUnitCostMin),
      validationKmaxValueMin: Number(config.validationKmaxValueMin),
      roundingRules: config.roundingJson as any,
    };
  }
}

function roundMoney(v: number) {
  return Math.round(v * 100) / 100;
}
