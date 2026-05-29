import {
  calculateKanban,
  roundUpPractical,
  selectLotCoverageDays,
  KanbanConfigValues,
} from './kanban-algorithm';

const DEFAULT_CONFIG: KanbanConfigValues = {
  leadTimeDays: 2,
  safetyStockDays: 5,
  lowCostMax: 1,
  mediumCostMax: 10,
  lowCostLotDays: 20,
  mediumCostLotDays: 15,
  highCostLotDays: 10,
  validationUnitCostMin: 50,
  validationKmaxValueMin: 300,
  roundingRules: [
    { upTo: 5, multiple: 1 },
    { upTo: 20, multiple: 5 },
    { upTo: 100, multiple: 10 },
    { upTo: 500, multiple: 25 },
    { upTo: null, multiple: 50 },
  ],
};

function article(overrides: Partial<Parameters<typeof calculateKanban>[0]> = {}) {
  return {
    articleId: 'test-id',
    code: 'ART001',
    description: 'Test article',
    unitCost: 5,
    avgDailyDemand: 2,
    ...overrides,
  };
}

// ─── roundUpPractical ────────────────────────────────────────────────────────

describe('roundUpPractical', () => {
  const rules = DEFAULT_CONFIG.roundingRules;

  it('returns 0 for zero or negative values', () => {
    expect(roundUpPractical(0, rules)).toBe(0);
    expect(roundUpPractical(-1, rules)).toBe(0);
    expect(roundUpPractical(-100, rules)).toBe(0);
  });

  it('rounds to multiple of 1 for values ≤ 5', () => {
    expect(roundUpPractical(0.1, rules)).toBe(1);
    expect(roundUpPractical(1, rules)).toBe(1);
    expect(roundUpPractical(3, rules)).toBe(3);
    expect(roundUpPractical(4.1, rules)).toBe(5);
    expect(roundUpPractical(5, rules)).toBe(5);
  });

  it('rounds up to multiple of 5 for values ≤ 20', () => {
    expect(roundUpPractical(5.1, rules)).toBe(10);
    expect(roundUpPractical(10, rules)).toBe(10);
    expect(roundUpPractical(11, rules)).toBe(15);
    expect(roundUpPractical(16, rules)).toBe(20);
    expect(roundUpPractical(20, rules)).toBe(20);
  });

  it('rounds up to multiple of 10 for values ≤ 100', () => {
    expect(roundUpPractical(20.1, rules)).toBe(30);
    expect(roundUpPractical(55, rules)).toBe(60);
    expect(roundUpPractical(100, rules)).toBe(100);
  });

  it('rounds up to multiple of 25 for values ≤ 500', () => {
    expect(roundUpPractical(101, rules)).toBe(125);
    expect(roundUpPractical(250, rules)).toBe(250);
    expect(roundUpPractical(376, rules)).toBe(400);
    expect(roundUpPractical(500, rules)).toBe(500);
  });

  it('rounds up to multiple of 50 for values > 500', () => {
    expect(roundUpPractical(501, rules)).toBe(550);
    expect(roundUpPractical(1001, rules)).toBe(1050);
    expect(roundUpPractical(2000, rules)).toBe(2000);
  });

  it('always rounds up, never down', () => {
    expect(roundUpPractical(6, rules)).toBe(10);
    expect(roundUpPractical(21, rules)).toBe(30);
    expect(roundUpPractical(101, rules)).toBe(125);
  });
});

// ─── selectLotCoverageDays ───────────────────────────────────────────────────

describe('selectLotCoverageDays', () => {
  it('returns lowCostLotDays for unitCost < lowCostMax', () => {
    expect(selectLotCoverageDays(0, DEFAULT_CONFIG)).toBe(20);
    expect(selectLotCoverageDays(0.5, DEFAULT_CONFIG)).toBe(20);
    expect(selectLotCoverageDays(0.99, DEFAULT_CONFIG)).toBe(20);
  });

  it('returns mediumCostLotDays for lowCostMax ≤ unitCost < mediumCostMax', () => {
    expect(selectLotCoverageDays(1, DEFAULT_CONFIG)).toBe(15);
    expect(selectLotCoverageDays(5, DEFAULT_CONFIG)).toBe(15);
    expect(selectLotCoverageDays(9.99, DEFAULT_CONFIG)).toBe(15);
  });

  it('returns highCostLotDays for unitCost ≥ mediumCostMax', () => {
    expect(selectLotCoverageDays(10, DEFAULT_CONFIG)).toBe(10);
    expect(selectLotCoverageDays(50, DEFAULT_CONFIG)).toBe(10);
    expect(selectLotCoverageDays(1000, DEFAULT_CONFIG)).toBe(10);
  });
});

// ─── calculateKanban ─────────────────────────────────────────────────────────

describe('calculateKanban', () => {
  describe('fórmules bàsiques', () => {
    it('calcula Kmin, Klot i Kmax correctament per article estàndard', () => {
      // avgDailyDemand=2, leadTime=2, safety=5 → kminRaw=14 → kmin=15
      // unitCost=5 (mig) → 15 dies lot → klotRaw=30 → klot=30
      // kmax = 15 + 30 = 45
      const r = calculateKanban(article({ unitCost: 5, avgDailyDemand: 2 }), DEFAULT_CONFIG);
      expect(r.kminRaw).toBeCloseTo(14);
      expect(r.kmin).toBe(15);
      expect(r.klotRaw).toBeCloseTo(30);
      expect(r.klot).toBe(30);
      expect(r.kmax).toBe(45);
      expect(r.lotCoverageDays).toBe(15);
    });

    it('Kmax sempre és ≥ Kmin', () => {
      const r = calculateKanban(article({ avgDailyDemand: 0.01 }), DEFAULT_CONFIG);
      expect(r.kmax).toBeGreaterThanOrEqual(r.kmin);
    });

    it('Klot mínim és 1 fins i tot amb demanda quasi zero', () => {
      const r = calculateKanban(article({ avgDailyDemand: 0.001 }), DEFAULT_CONFIG);
      expect(r.klot).toBeGreaterThanOrEqual(1);
    });

    it('calcula valors econòmics correctament', () => {
      const r = calculateKanban(article({ unitCost: 10, avgDailyDemand: 5 }), DEFAULT_CONFIG);
      expect(r.valueAtKmin).toBeCloseTo(r.kmin * 10, 0);
      expect(r.valueAtKmax).toBeCloseTo(r.kmax * 10, 0);
      expect(r.averageStockValue).toBeCloseTo(r.averageStockUnits * 10, 0);
    });
  });

  describe('trams de cost (Klot)', () => {
    it('aplica dies lot baixos per cost < 1€', () => {
      const r = calculateKanban(article({ unitCost: 0.5, avgDailyDemand: 1 }), DEFAULT_CONFIG);
      expect(r.lotCoverageDays).toBe(20);
    });

    it('aplica dies lot mitjos per 1€ ≤ cost < 10€', () => {
      const r = calculateKanban(article({ unitCost: 5, avgDailyDemand: 1 }), DEFAULT_CONFIG);
      expect(r.lotCoverageDays).toBe(15);
    });

    it('aplica dies lot alts per cost ≥ 10€', () => {
      const r = calculateKanban(article({ unitCost: 15, avgDailyDemand: 1 }), DEFAULT_CONFIG);
      expect(r.lotCoverageDays).toBe(10);
    });
  });

  describe('tipus de control', () => {
    it('classifica COST_ZERO_EXCEPTION quan cost unitari = 0', () => {
      const r = calculateKanban(article({ unitCost: 0, avgDailyDemand: 1 }), DEFAULT_CONFIG);
      expect(r.controlType).toBe('COST_ZERO_EXCEPTION');
    });

    it('classifica VALIDATION_REQUIRED quan cost ≥ validationUnitCostMin', () => {
      const r = calculateKanban(article({ unitCost: 50, avgDailyDemand: 1 }), DEFAULT_CONFIG);
      expect(r.controlType).toBe('VALIDATION_REQUIRED');
    });

    it('classifica VALIDATION_REQUIRED quan cost > validationUnitCostMin', () => {
      const r = calculateKanban(article({ unitCost: 100, avgDailyDemand: 1 }), DEFAULT_CONFIG);
      expect(r.controlType).toBe('VALIDATION_REQUIRED');
    });

    it('classifica VALIDATION_REQUIRED quan valueAtKmax ≥ validationKmaxValueMin', () => {
      // cost=10, demand=10 → kmax=170 → valueAtKmax=1700 ≥ 300
      const r = calculateKanban(article({ unitCost: 10, avgDailyDemand: 10 }), DEFAULT_CONFIG);
      expect(r.valueAtKmax).toBeGreaterThanOrEqual(300);
      expect(r.controlType).toBe('VALIDATION_REQUIRED');
    });

    it('classifica PHYSICAL_SIMPLE per articles normals', () => {
      // cost=5, demand=2 → kmax=45 → valueAtKmax=225 < 300 i cost<50
      const r = calculateKanban(article({ unitCost: 5, avgDailyDemand: 2 }), DEFAULT_CONFIG);
      expect(r.controlType).toBe('PHYSICAL_SIMPLE');
    });
  });

  describe('casos límit', () => {
    it('gestiona demanda zero sense errors', () => {
      const r = calculateKanban(article({ avgDailyDemand: 0 }), DEFAULT_CONFIG);
      expect(r.kmin).toBe(0);
      expect(r.kmax).toBeGreaterThan(0);
      expect(r.kminRaw).toBe(0);
    });

    it('gestiona demanda negativa (tractat com a 0)', () => {
      const r = calculateKanban(article({ avgDailyDemand: -5 }), DEFAULT_CONFIG);
      expect(r.kmin).toBe(0);
      expect(r.avgDailyDemand).toBe(0);
    });

    it('retorna justificació sempre present', () => {
      const r = calculateKanban(article(), DEFAULT_CONFIG);
      expect(r.rationale).toBeTruthy();
      expect(typeof r.rationale).toBe('string');
    });

    it('el camp articleId es conserva al resultat', () => {
      const r = calculateKanban(article({ articleId: 'my-id' }), DEFAULT_CONFIG);
      expect(r.articleId).toBe('my-id');
    });

    it('arrodoniment configurable respecta les regles personalitzades', () => {
      const customConfig = {
        ...DEFAULT_CONFIG,
        roundingRules: [{ upTo: null, multiple: 10 }],
      };
      const r = calculateKanban(article({ avgDailyDemand: 1 }), customConfig);
      expect(r.kmin % 10).toBe(0);
      expect(r.klot % 10).toBe(0);
    });
  });
});
