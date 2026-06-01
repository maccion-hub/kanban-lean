import { BadRequestException, Injectable } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { PrismaService } from '../../prisma/prisma.service';
import { AppSettingsService } from '../settings/app-settings.service';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

@Injectable()
export class AssistantService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settings: AppSettingsService,
  ) {}

  async ask(messages: ChatMessage[]): Promise<{ answer: string; cached: boolean }> {
    if (!messages.length || messages[messages.length - 1].role !== 'user') {
      throw new BadRequestException('El darrer missatge ha de ser de l\'usuari');
    }

    const apiKey = process.env.ANTHROPIC_API_KEY || await this.settings.get('anthropic_api_key');
    if (!apiKey) {
      throw new BadRequestException(
        'API key de Claude no configurada. Ves a Ajustos per configurar-la.',
      );
    }

    const systemPrompt = await this.buildSystemPrompt();
    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      system: [
        {
          type: 'text',
          text: systemPrompt,
          // Cache the system prompt (context + instructions) for 5 min.
          // Repeated questions within the same window skip re-processing.
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    const answer = textBlock?.type === 'text' ? textBlock.text : '';
    const cached = (response.usage.cache_read_input_tokens ?? 0) > 0;

    return { answer, cached };
  }

  private async buildSystemPrompt(): Promise<string> {
    const [config, lastProposal, totalArticles, exceptionArticles, lastImport] =
      await Promise.all([
        this.prisma.kanbanConfig.findFirst({ where: { isDefault: true } }),
        this.prisma.kanbanProposal.findFirst({
          orderBy: { versionNumber: 'desc' },
          include: { items: { orderBy: { valueAtKmax: 'desc' }, take: 20 } },
        }),
        this.prisma.article.count(),
        this.prisma.article.count({ where: { isCostException: true } }),
        this.prisma.importBatch.findFirst({
          orderBy: { createdAt: 'desc' },
          select: { originalName: true, rowCount: true, status: true, createdAt: true },
        }),
      ]);

    const lines: string[] = [
      'Ets un assistent expert en Kanban Lean per a manteniment industrial a SABEMSA.',
      'Respon sempre en català, de forma clara i concisa.',
      'Usa les dades del sistema per respondre. Quan cites xifres, usa els valors reals.',
      '',
      '# DADES ACTUALS DEL SISTEMA',
      '',
    ];

    if (config) {
      lines.push('## CONFIGURACIÓ KANBAN ACTIVA');
      lines.push(`- Dies laborables/any: ${config.workingDaysPerYear}`);
      lines.push(`- Lead time: ${config.leadTimeDays} dies | Safety stock: ${config.safetyStockDays} dies`);
      lines.push(`- Klot per trams: <${config.lowCostMax}€→${config.lowCostLotDays}d | ${config.lowCostMax}–${config.mediumCostMax}€→${config.mediumCostLotDays}d | ≥${config.mediumCostMax}€→${config.highCostLotDays}d`);
      lines.push(`- Llindar validació manual: cost≥${config.validationUnitCostMin}€ o valor Kmax≥${config.validationKmaxValueMin}€`);
      lines.push('');
    }

    lines.push('## ARTICLES MASTER DATA');
    lines.push(`- Total articles: ${totalArticles}`);
    lines.push(`- Articles cost zero (excepció): ${exceptionArticles}`);
    lines.push('');

    if (lastImport) {
      lines.push('## ÚLTIM IMPORT');
      lines.push(`- Fitxer: ${lastImport.originalName} (${lastImport.rowCount} files, estat: ${lastImport.status})`);
      lines.push(`- Data: ${lastImport.createdAt.toLocaleDateString('ca-ES')}`);
      lines.push('');
    }

    if (lastProposal) {
      const s = lastProposal.summaryJson as Record<string, unknown>;
      lines.push(`## ÚLTIMA PROPOSTA KANBAN (v${lastProposal.versionNumber} — ${lastProposal.name})`);
      lines.push(`- Data: ${lastProposal.createdAt.toLocaleDateString('ca-ES')}`);
      lines.push(`- Articles analitzats: ${s.itemCount ?? '?'}`);
      lines.push(`- Kanban físic simple: ${s.simplePhysicalCount ?? '?'} | Validació manual: ${s.validationRequiredCount ?? '?'} | Cost zero: ${s.costZeroExceptionCount ?? '?'}`);
      lines.push(`- Valor Kmax total: ${s.totalValueAtKmax ?? '?'} € | Estoc mig: ${s.averageInventoryValue ?? '?'} €`);
      lines.push('');

      if (lastProposal.items.length > 0) {
        const top10 = lastProposal.items.slice(0, 10);
        lines.push('### TOP 10 ARTICLES PER VALOR KMAX');
        top10.forEach((item, i) => {
          lines.push(`${i + 1}. ${item.code} — ${item.description}: Kmin=${item.kmin} Klot=${item.klot} Kmax=${item.kmax} (${Number(item.valueAtKmax).toFixed(0)}€) [${item.controlType}]`);
        });
        lines.push('');

        const validation = lastProposal.items.filter((i) => i.controlType === 'VALIDATION_REQUIRED');
        if (validation.length > 0) {
          lines.push('### ARTICLES QUE NECESSITEN VALIDACIÓ MANUAL');
          validation.slice(0, 8).forEach((item) => {
            lines.push(`- ${item.code}: ${item.description} | cost ${Number(item.unitCost).toFixed(2)}€ | Kmax=${item.kmax} (${Number(item.valueAtKmax).toFixed(0)}€)`);
          });
          if (validation.length > 8) lines.push(`- ... i ${validation.length - 8} articles més`);
          lines.push('');
        }

        const zeros = lastProposal.items.filter((i) => i.controlType === 'COST_ZERO_EXCEPTION');
        if (zeros.length > 0) {
          lines.push('### ARTICLES EXCEPCIÓ COST 0');
          zeros.forEach((item) => lines.push(`- ${item.code}: ${item.description}`));
          lines.push('');
        }
      }
    } else {
      lines.push('## PROPOSTES\nEncara no s\'ha generat cap proposta Kanban.');
      lines.push('');
    }

    return lines.join('\n');
  }
}
