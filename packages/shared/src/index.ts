export type CanonicalArticleRow = {
  code: string;
  description: string;
  unitCost: number;
  currentStock?: number | null;
  packaging?: string | null;
  totalConsumption?: number | null;
  annualRotation?: number | null;
};

export type ExcelColumnMapping = {
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

export type KanbanConfigSnapshot = {
  workingDaysPerYear: number;
  leadTimeDays: number;
  safetyStockDays: number;
  lowCostMax: number;
  mediumCostMax: number;
  lowCostLotDays: number;
  mediumCostLotDays: number;
  highCostLotDays: number;
  validationUnitCostMin: number;
  validationKmaxValueMin: number;
  roundingRules: Array<{ upTo: number | null; multiple: number }>;
};

export type KanbanCalculatedItem = {
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
