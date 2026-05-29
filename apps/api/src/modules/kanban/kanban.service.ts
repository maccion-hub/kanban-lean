import { Injectable, NotFoundException } from '@nestjs/common';
import { createHash } from 'crypto';
import * as XLSX from 'xlsx';
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
    const config = dto.configId
      ? await this.configService.get(dto.configId)
      : await this.configService.getOrCreateDefault();
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
    const calculated = metrics.map((m) =>
      calculateKanban(
        {
          articleId: m.article.id,
          code: m.article.code,
          description: m.article.description,
          unitCost: Number(m.article.unitCost),
          avgDailyDemand: Number(m.avgDailyDemand),
        },
        configValues,
      ),
    );

    const summary = {
      itemCount: calculated.length,
      simplePhysicalCount: calculated.filter((i) => i.controlType === 'PHYSICAL_SIMPLE').length,
      validationRequiredCount: calculated.filter((i) => i.controlType === 'VALIDATION_REQUIRED').length,
      costZeroExceptionCount: calculated.filter((i) => i.controlType === 'COST_ZERO_EXCEPTION').length,
      totalValueAtKmax: roundMoney(calculated.reduce((s, i) => s + i.valueAtKmax, 0)),
      averageInventoryValue: roundMoney(calculated.reduce((s, i) => s + i.averageStockValue, 0)),
      top10ByKmaxValue: [...calculated]
        .sort((a, b) => b.valueAtKmax - a.valueAtKmax)
        .slice(0, 10)
        .map((i) => ({ code: i.code, description: i.description, valueAtKmax: i.valueAtKmax })),
    };

    const sourceHash = createHash('sha256')
      .update(JSON.stringify({ importId: sourceImport.id, importHash: sourceImport.fileHash, config: configValues, calculated }))
      .digest('hex');
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
      const diffJson = prev
        ? {
            kminDelta: item.kmin - prev.kmin,
            klotDelta: item.klot - prev.klot,
            kmaxDelta: item.kmax - prev.kmax,
            unitCostDelta: item.unitCost - Number(prev.unitCost),
            avgDailyDemandDelta: item.avgDailyDemand - Number(prev.avgDailyDemand),
          }
        : { newItem: true };

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

  async exportProposalXlsx(id: string): Promise<Buffer> {
    const proposal = await this.getProposal(id);
    const summary = proposal.summaryJson as Record<string, unknown>;
    const config = proposal.configSnapshot as Record<string, unknown>;
    const items = proposal.items;

    const wb = XLSX.utils.book_new();

    // ── Full 1: Resum ─────────────────────────────────────────────────────
    const resumData = [
      ['PROPOSTA KANBAN LEAN — RESUM', ''],
      ['', ''],
      ['Versió', `v${proposal.versionNumber}`],
      ['Nom', proposal.name],
      ['Data generació', proposal.createdAt.toLocaleString('ca-ES')],
      ['', ''],
      ['Total articles analitzats', summary.itemCount],
      ['Kanban físic simple', summary.simplePhysicalCount],
      ['Control especial (validació)', summary.validationRequiredCount],
      ['Excepció cost 0', summary.costZeroExceptionCount],
      ['', ''],
      ['Valor total a Kmax (€)', summary.totalValueAtKmax],
      ['Valor estoc mitjà estimat (€)', summary.averageInventoryValue],
      ['', ''],
      ['TOP 10 articles per valor Kmax', ''],
      ['Codi', 'Valor Kmax (€)'],
      ...((summary.top10ByKmaxValue as { code: string; description: string; valueAtKmax: number }[]) || []).map((t) => [
        `${t.code} — ${t.description}`,
        t.valueAtKmax,
      ]),
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(resumData), 'Resum');

    // ── Full 2: Paràmetres ────────────────────────────────────────────────
    const paramsData = [
      ['PARÀMETRES DE CONFIGURACIÓ', ''],
      ['', ''],
      ['Dies laborables any', config.workingDaysPerYear],
      ['Lead time (dies)', config.leadTimeDays],
      ['Safety stock (dies)', config.safetyStockDays],
      ['', ''],
      ['Cost baix — fins a (€)', config.lowCostMax],
      ['Cost baix — dies lot', config.lowCostLotDays],
      ['Cost mig — fins a (€)', config.mediumCostMax],
      ['Cost mig — dies lot', config.mediumCostLotDays],
      ['Cost alt — dies lot', config.highCostLotDays],
      ['', ''],
      ['Llindar cost unitari validació (€)', config.validationUnitCostMin],
      ['Llindar valor Kmax validació (€)', config.validationKmaxValueMin],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(paramsData), 'Paràmetres');

    // ── Full 3: Kanban (articles principals) ──────────────────────────────
    const mainItems = items.filter((i) => i.controlType !== 'COST_ZERO_EXCEPTION');
    const kanbanHeader = [
      'Codi', 'Descripció', 'Cost unit. (€)', 'Dem. diària',
      'Kmin', 'Klot', 'Kmax',
      'Valor Kmin (€)', 'Valor Kmax (€)', 'Estoc mig ud.', 'Estoc mig (€)',
      'Dies lot', 'Tipus control', 'Justificació',
    ];
    const kanbanRows = mainItems.map((i) => [
      i.code, i.description,
      Number(i.unitCost), Number(i.avgDailyDemand),
      i.kmin, i.klot, i.kmax,
      Number(i.valueAtKmin), Number(i.valueAtKmax),
      Number(i.averageStockUnits), Number(i.averageStockValue),
      i.lotCoverageDays, i.controlType, i.rationale,
    ]);
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([kanbanHeader, ...kanbanRows]), 'Kanban');

    // ── Full 4: Excepcions (cost 0) ───────────────────────────────────────
    const exceptions = items.filter((i) => i.controlType === 'COST_ZERO_EXCEPTION');
    const excHeader = ['Codi', 'Descripció', 'Dem. diària', 'Kmin', 'Klot', 'Kmax', 'Justificació'];
    const excRows = exceptions.map((i) => [
      i.code, i.description, Number(i.avgDailyDemand),
      i.kmin, i.klot, i.kmax, i.rationale,
    ]);
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([excHeader, ...excRows]), 'Excepcions');

    // ── Full 5: Guia ──────────────────────────────────────────────────────
    const guiaData = [
      ['GUIA D\'ÚS — KANBAN LEAN'],
      [''],
      ['FÓRMULES'],
      ['Kmin = Demanda diària × (Lead time + Safety stock)'],
      ['  Kmin respon a: quan he de reposar?'],
      [''],
      ['Klot = Demanda diària × Dies de cobertura del lot'],
      ['  Dies de cobertura depèn del tram de cost:'],
      ['  · Cost baix (< ' + config.lowCostMax + '€): ' + config.lowCostLotDays + ' dies'],
      ['  · Cost mig (' + config.lowCostMax + '€ – ' + config.mediumCostMax + '€): ' + config.mediumCostLotDays + ' dies'],
      ['  · Cost alt (≥ ' + config.mediumCostMax + '€): ' + config.highCostLotDays + ' dies'],
      [''],
      ['Kmax = Kmin + Klot'],
      ['  Kmax respon a: quin nivell ha de quedar després de reposar?'],
      [''],
      ['TIPUS DE CONTROL'],
      ['· PHYSICAL_SIMPLE: Kanban físic estàndard'],
      ['· VALIDATION_REQUIRED: requereix validació per cost o valor elevat'],
      ['· COST_ZERO_EXCEPTION: cost unitari 0, pendent de validació'],
      [''],
      ['ARRODONIMENT PRÀCTIC (per defecte)'],
      ['· Quantitat ≤ 5 → arrodonir a múltiple d\'1'],
      ['· Quantitat ≤ 20 → arrodonir a múltiple de 5'],
      ['· Quantitat ≤ 100 → arrodonir a múltiple de 10'],
      ['· Quantitat ≤ 500 → arrodonir a múltiple de 25'],
      ['· Quantitat > 500 → arrodonir a múltiple de 50'],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(guiaData), 'Guia');

    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
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
