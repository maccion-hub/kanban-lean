'use client';

import { useState, useMemo } from 'react';
import { Info } from 'lucide-react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Badge, Input, Popover, PopoverTrigger, PopoverContent,
} from '@kanban/ui';

type ControlType = 'PHYSICAL_SIMPLE' | 'VALIDATION_REQUIRED' | 'COST_ZERO_EXCEPTION';

type ProposalItem = {
  id: string;
  code: string;
  description: string;
  unitCost: string | number;
  avgDailyDemand: string | number;
  sourceType?: string | null;
  sourceValue?: string | number | null;
  sourceDays?: number | null;
  kmin: number;
  klot: number;
  kmax: number;
  valueAtKmin: string | number;
  valueAtKmax: string | number;
  averageStockUnits: string | number;
  averageStockValue: string | number;
  lotCoverageDays: number;
  controlType: ControlType;
  rationale?: string;
  diffJson?: {
    newItem?: boolean;
    deletedItem?: boolean;
    kminDelta?: number;
    klotDelta?: number;
    kmaxDelta?: number;
  };
};

function Delta({ value }: { value: number | undefined }) {
  if (!value || value === 0) return <span className="text-muted-foreground">—</span>;
  return (
    <span className={value > 0 ? 'text-status-ok font-mono font-semibold' : 'text-destructive font-mono font-semibold'}>
      {value > 0 ? '+' : ''}{value}
    </span>
  );
}

function ControlBadge({ type }: { type: ControlType }) {
  if (type === 'VALIDATION_REQUIRED') return <Badge variant="warn" size="sm">Validació</Badge>;
  if (type === 'COST_ZERO_EXCEPTION') return <Badge variant="danger" size="sm">Cost zero</Badge>;
  return <Badge variant="success" size="sm">Simple</Badge>;
}

function SourceMetric({ sourceType, sourceValue, sourceDays }: {
  sourceType?: string | null;
  sourceValue?: string | number | null;
  sourceDays?: number | null;
}) {
  if (!sourceType || sourceValue == null) return <span className="text-muted-foreground">—</span>;
  const val = Number(sourceValue).toLocaleString('ca-ES', { maximumFractionDigits: 0 });
  if (sourceType === 'ANNUAL_ROTATION') {
    return <span className="font-mono text-[12px] text-navy">{val} u/any</span>;
  }
  if (sourceType === 'PERIOD_CONSUMPTION') {
    return <span className="font-mono text-[12px] text-navy">{val} u/{sourceDays ?? '?'}d</span>;
  }
  return <span className="text-muted-foreground">—</span>;
}

function RationalePopover({ rationale }: { rationale?: string }) {
  if (!rationale) return null;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="inline-flex h-6 w-6 items-center justify-center rounded-[2px] text-muted-foreground hover:text-navy hover:bg-gray-bg transition-colors"
          title="Veure càlcul detallat"
        >
          <Info className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[420px]" align="end">
        <p className="font-display text-[10px] font-bold uppercase tracking-caps text-muted-foreground mb-2">
          Càlcul detallat
        </p>
        <p className="text-[12px] leading-relaxed text-navy">{rationale}</p>
      </PopoverContent>
    </Popover>
  );
}

const FILTER_OPTIONS = [
  { value: 'ALL', label: 'Tots' },
  { value: 'PHYSICAL_SIMPLE', label: 'Simple' },
  { value: 'VALIDATION_REQUIRED', label: 'Validació' },
  { value: 'COST_ZERO_EXCEPTION', label: 'Cost zero' },
];

export default function ProposalTable({ items }: { items: ProposalItem[] }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');

  const visible = useMemo(() => {
    return items.filter((i) => {
      const matchesFilter = filter === 'ALL' || i.controlType === filter;
      const q = search.toLowerCase();
      const matchesSearch = !q || i.code.toLowerCase().includes(q) || i.description.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [items, search, filter]);

  const exceptions = useMemo(
    () => items.filter((i) => i.controlType === 'COST_ZERO_EXCEPTION'),
    [items],
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] max-w-sm">
          <Input
            placeholder="Cercar per codi o descripció…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="inline-flex rounded-[2px] border border-navy/24 overflow-hidden">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={[
                'inline-flex h-9 items-center justify-center px-3 text-[12px] font-display font-semibold border-r border-border/30 last:border-r-0 transition-colors',
                filter === opt.value
                  ? 'bg-navy text-white'
                  : 'bg-card text-muted-foreground hover:text-navy',
              ].join(' ')}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <span className="text-[12px] text-muted-foreground">
          {visible.length} / {items.length} articles
        </span>
      </div>

      {/* Main table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Codi</TableHead>
            <TableHead>Descripció</TableHead>
            <TableHead align="right">Cost €</TableHead>
            <TableHead align="right">Font de dades</TableHead>
            <TableHead align="right">Dem/dia</TableHead>
            <TableHead align="right">Kmin</TableHead>
            <TableHead align="right">ΔKmin</TableHead>
            <TableHead align="right">Klot</TableHead>
            <TableHead align="right">ΔKlot</TableHead>
            <TableHead align="right">Kmax</TableHead>
            <TableHead align="right">ΔKmax</TableHead>
            <TableHead align="right">Val. Kmin €</TableHead>
            <TableHead align="right">Val. Kmax €</TableHead>
            <TableHead align="right">Estoc mig €</TableHead>
            <TableHead align="center">Control</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {visible.length === 0 ? (
            <TableRow>
              <TableCell colSpan={16} align="center" className="py-8 text-muted-foreground">
                Cap article coincideix amb el filtre actual
              </TableCell>
            </TableRow>
          ) : (
            visible.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <span className="font-mono text-[12px]">{item.code}</span>
                  {item.diffJson?.newItem && (
                    <Badge variant="success" size="sm" className="ml-1.5">Nou</Badge>
                  )}
                  {item.diffJson?.deletedItem && (
                    <Badge variant="danger" size="sm" className="ml-1.5">Eliminat</Badge>
                  )}
                </TableCell>
                <TableCell className="max-w-[180px] truncate" title={item.description}>
                  {item.description}
                </TableCell>
                <TableCell numeric>{Number(item.unitCost).toFixed(2)}</TableCell>
                <TableCell align="right">
                  <SourceMetric
                    sourceType={item.sourceType}
                    sourceValue={item.sourceValue}
                    sourceDays={item.sourceDays}
                  />
                </TableCell>
                <TableCell numeric>{Number(item.avgDailyDemand).toFixed(3)}</TableCell>
                <TableCell numeric>{item.kmin}</TableCell>
                <TableCell align="right"><Delta value={item.diffJson?.kminDelta} /></TableCell>
                <TableCell numeric>{item.klot}</TableCell>
                <TableCell align="right"><Delta value={item.diffJson?.klotDelta} /></TableCell>
                <TableCell numeric>{item.kmax}</TableCell>
                <TableCell align="right"><Delta value={item.diffJson?.kmaxDelta} /></TableCell>
                <TableCell numeric>
                  {Number(item.valueAtKmin).toLocaleString('ca-ES', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell numeric>
                  {Number(item.valueAtKmax).toLocaleString('ca-ES', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell numeric>
                  {Number(item.averageStockValue).toLocaleString('ca-ES', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell align="center">
                  <ControlBadge type={item.controlType} />
                </TableCell>
                <TableCell>
                  <RationalePopover rationale={item.rationale} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Excepcions cost 0 */}
      {exceptions.length > 0 && (
        <div className="mt-8 space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-[16px]">Excepcions — Articles amb cost 0</h2>
            <Badge variant="danger">{exceptions.length}</Badge>
          </div>
          <p className="text-[13px] text-muted-foreground">
            Aquests articles queden fora del Kanban principal fins que el cost sigui validat.
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Codi</TableHead>
                <TableHead>Descripció</TableHead>
                <TableHead align="right">Font de dades</TableHead>
                <TableHead align="right">Dem. diària</TableHead>
                <TableHead align="right">Kmin</TableHead>
                <TableHead align="right">Klot</TableHead>
                <TableHead align="right">Kmax</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {exceptions.map((item) => (
                <TableRow key={item.id}>
                  <TableCell><span className="font-mono text-[12px]">{item.code}</span></TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell align="right">
                    <SourceMetric sourceType={item.sourceType} sourceValue={item.sourceValue} sourceDays={item.sourceDays} />
                  </TableCell>
                  <TableCell numeric>{Number(item.avgDailyDemand).toFixed(3)}</TableCell>
                  <TableCell numeric>{item.kmin}</TableCell>
                  <TableCell numeric>{item.klot}</TableCell>
                  <TableCell numeric>{item.kmax}</TableCell>
                  <TableCell><RationalePopover rationale={item.rationale} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
