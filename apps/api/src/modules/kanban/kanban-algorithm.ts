export type RoundingRule = { upTo: number | null; multiple: number };

export type KanbanConfigValues = {
  leadTimeDays: number;
  safetyStockDays: number;
  lowCostMax: number;
  mediumCostMax: number;
  lowCostLotDays: number;
  mediumCostLotDays: number;
  highCostLotDays: number;
  validationUnitCostMin: number;
  validationKmaxValueMin: number;
  roundingRules: RoundingRule[];
};

export type KanbanInputArticle = {
  articleId: string;
  code: string;
  description: string;
  unitCost: number;
  avgDailyDemand: number;
};

export type KanbanResult = {
  articleId: string;
  code: string;
  description: string;
  unitCost: number;
  avgDailyDemand: number;
  kminRaw: number;
  klotRaw: number;
  kmin: number;
  klot: number;
  kmax: number;
  lotCoverageDays: number;
  valueAtKmin: number;
  valueAtKmax: number;
  averageStockUnits: number;
  averageStockValue: number;
  controlType: 'PHYSICAL_SIMPLE' | 'VALIDATION_REQUIRED' | 'COST_ZERO_EXCEPTION';
  rationale: string;
};

export function calculateKanban(article: KanbanInputArticle, config: KanbanConfigValues): KanbanResult {
  const avgDaily = Math.max(0, article.avgDailyDemand);
  const kminCoverageDays = config.leadTimeDays + config.safetyStockDays;
  const kminRaw = avgDaily * kminCoverageDays;
  const lotCoverageDays = selectLotCoverageDays(article.unitCost, config);
  const klotRaw = avgDaily * lotCoverageDays;
  const kmin = roundUpPractical(kminRaw, config.roundingRules);
  const klot = Math.max(1, roundUpPractical(klotRaw, config.roundingRules));
  const kmax = kmin + klot;
  const valueAtKmin = roundMoney(kmin * article.unitCost);
  const valueAtKmax = roundMoney(kmax * article.unitCost);
  const averageStockUnits = kmin + klot / 2;
  const averageStockValue = roundMoney(averageStockUnits * article.unitCost);
  const controlType = selectControlType(article.unitCost, valueAtKmax, config);
  const rationale = buildRationale(article.unitCost, kminCoverageDays, lotCoverageDays, controlType);

  return {
    articleId: article.articleId,
    code: article.code,
    description: article.description,
    unitCost: article.unitCost,
    avgDailyDemand: round(avgDaily, 6),
    kminRaw: round(kminRaw, 3),
    klotRaw: round(klotRaw, 3),
    kmin,
    klot,
    kmax,
    lotCoverageDays,
    valueAtKmin,
    valueAtKmax,
    averageStockUnits: round(averageStockUnits, 3),
    averageStockValue,
    controlType,
    rationale,
  };
}

export function selectLotCoverageDays(unitCost: number, config: KanbanConfigValues): number {
  if (unitCost < config.lowCostMax) return config.lowCostLotDays;
  if (unitCost < config.mediumCostMax) return config.mediumCostLotDays;
  return config.highCostLotDays;
}

export function roundUpPractical(value: number, rules: RoundingRule[]): number {
  if (value <= 0) return 0;
  const rule = rules.find((r) => r.upTo === null || value <= r.upTo) || { multiple: 1 };
  return Math.ceil(value / rule.multiple) * rule.multiple;
}

function selectControlType(unitCost: number, valueAtKmax: number, config: KanbanConfigValues) {
  if (unitCost === 0) return 'COST_ZERO_EXCEPTION' as const;
  if (unitCost >= config.validationUnitCostMin || valueAtKmax >= config.validationKmaxValueMin) return 'VALIDATION_REQUIRED' as const;
  return 'PHYSICAL_SIMPLE' as const;
}

function buildRationale(unitCost: number, kminDays: number, lotDays: number, controlType: string): string {
  if (controlType === 'COST_ZERO_EXCEPTION') return 'Article with unit cost 0. Keep as exception until cost is validated.';
  const mode = controlType === 'VALIDATION_REQUIRED' ? 'Kanban with responsible validation' : 'Simple physical Kanban';
  return `${mode}. Kmin covers ${kminDays} working days. Klot covers ${lotDays} working days based on unit cost tier.`;
}

function roundMoney(v: number): number {
  return Math.round(v * 100) / 100;
}

function round(v: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(v * factor) / factor;
}
