import { Injectable, InternalServerErrorException } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';

export type MappingRequest = {
  sheetName: string;
  headers: string[];
  sampleRows: Record<string, unknown>[];
};

export type MappingResult = {
  headerRowIndex: number;
  sheetName: string;
  fields: {
    code: string;
    description: string;
    unitCost: string;
    currentStock?: string;
    packaging?: string;
    totalConsumption?: string;
    annualRotation?: string;
  };
  confidence: number;
  warnings: string[];
};

@Injectable()
export class ClaudeMappingService {
  private readonly client: Anthropic | null;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    this.client = apiKey ? new Anthropic({ apiKey }) : null;
  }

  async inferMapping(input: MappingRequest): Promise<MappingResult> {
    if (!this.client) {
      return this.heuristicMapping(input);
    }

    const mappingSchema = {
      type: 'object',
      additionalProperties: false,
      required: ['headerRowIndex', 'sheetName', 'fields', 'confidence', 'warnings'],
      properties: {
        headerRowIndex: { type: 'integer', minimum: 0 },
        sheetName: { type: 'string' },
        fields: {
          type: 'object',
          additionalProperties: false,
          required: ['code', 'description', 'unitCost'],
          properties: {
            code: { type: 'string' },
            description: { type: 'string' },
            unitCost: { type: 'string' },
            currentStock: { type: 'string' },
            packaging: { type: 'string' },
            totalConsumption: { type: 'string' },
            annualRotation: { type: 'string' }
          }
        },
        confidence: { type: 'number', minimum: 0, maximum: 1 },
        warnings: { type: 'array', items: { type: 'string' } }
      }
    };

    const message = await this.client.messages.create({
      model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-5',
      max_tokens: 2500,
      tools: [
        {
          name: 'return_excel_mapping',
          description: 'Return the Excel column mapping to the canonical article schema.',
          input_schema: mappingSchema as any,
        },
      ],
      tool_choice: { type: 'tool', name: 'return_excel_mapping' },
      messages: [
        {
          role: 'user',
          content: [
            'Infer the mapping between an uploaded Excel article list and this canonical schema:',
            '- code: unique article code',
            '- description: article name or description',
            '- unitCost: numeric unit cost',
            '- currentStock: optional current stock',
            '- packaging: optional packaging/logistic unit',
            '- totalConsumption: optional total consumed in the selected period',
            '- annualRotation: optional annualized rotation or units per year',
            'Return only the tool result. Use exact header names from the input.',
            JSON.stringify(input, null, 2)
          ].join('\n')
        }
      ]
    });

    const toolUse = message.content.find((block: any) => block.type === 'tool_use' && block.name === 'return_excel_mapping') as any;
    if (!toolUse?.input) {
      throw new InternalServerErrorException('Claude did not return a valid mapping');
    }
    return toolUse.input as MappingResult;
  }

  private heuristicMapping(input: MappingRequest): MappingResult {
    const pick = (...needles: string[]) => {
      const normalized = input.headers.map((h) => ({ original: h, value: h.toLowerCase() }));
      const found = normalized.find((h) => needles.some((n) => h.value.includes(n)));
      return found?.original;
    };

    const code = pick('codi', 'codigo', 'code', 'article', 'referencia') || input.headers[0];
    const description = pick('descrip', 'name', 'article') || input.headers[1] || input.headers[0];
    const unitCost = pick('cost', 'preu', 'precio', 'unit') || input.headers[input.headers.length - 1];
    const totalConsumption = pick('consum total', 'total consum', 'consumo total', 'rotacio', 'rotacion');
    const annualRotation = pick('unitats any', 'unidades ano', 'annual', 'any');
    const currentStock = pick('stock', 'existencia');

    return {
      headerRowIndex: 0,
      sheetName: input.sheetName,
      fields: {
        code,
        description,
        unitCost,
        ...(currentStock ? { currentStock } : {}),
        ...(totalConsumption ? { totalConsumption } : {}),
        ...(annualRotation ? { annualRotation } : {}),
      },
      confidence: 0.55,
      warnings: ['Heuristic mapping used because ANTHROPIC_API_KEY is not configured. Review mapping before import.'],
    };
  }
}
