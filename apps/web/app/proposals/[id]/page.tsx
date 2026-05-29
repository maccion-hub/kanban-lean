import Link from 'next/link';
import {
  KpiCard, Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@kanban/ui';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type DiffJson = {
  newItem?: boolean;
  deletedItem?: boolean;
  kminDelta?: number;
  klotDelta?: number;
  kmaxDelta?: number;
  unitCostDelta?: number;
  avgDailyDemandDelta?: number;
};

type ProposalItem = {
  id: string;
  code: string;
  description: string;
  unitCost: string | number;
  avgDailyDemand: string | number;
  kmin: number;
  klot: number;
  kmax: number;
  valueAtKmax: string | number;
  controlType: 'PHYSICAL_SIMPLE' | 'VALIDATION_REQUIRED' | 'COST_ZERO_EXCEPTION';
  diffJson?: DiffJson;
};

type Proposal = {
  id: string;
  name: string;
  versionNumber: number;
  createdAt: string;
  summaryJson?: {
    itemCount?: number;
    totalValueAtKmax?: number;
    averageInventoryValue?: number;
    validationRequiredCount?: number;
  };
  items: ProposalItem[];
};

function Delta({ value }: { value: number | undefined }) {
  if (!value || value === 0) return <span className="text-muted-foreground">—</span>;
  return (
    <span className={value > 0 ? 'text-status-ok font-mono font-semibold' : 'text-destructive font-mono font-semibold'}>
      {value > 0 ? '+' : ''}{value}
    </span>
  );
}

function ControlBadge({ type }: { type: ProposalItem['controlType'] }) {
  if (type === 'VALIDATION_REQUIRED') return <Badge variant="warn" size="sm">Validació</Badge>;
  if (type === 'COST_ZERO_EXCEPTION') return <Badge variant="danger" size="sm">Cost zero</Badge>;
  return <Badge variant="success" size="sm">Simple</Badge>;
}

export default async function ProposalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const proposal: Proposal = await fetch(`${API}/kanban/proposals/${id}`, {
    cache: 'no-store',
  }).then((r) => r.json());

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/proposals" className="text-muted-foreground text-[12px] hover:text-navy">
              ← Propostes
            </Link>
          </div>
          <h1>{proposal.name}</h1>
          <p className="text-muted-foreground text-[13px] mt-0.5">
            {new Date(proposal.createdAt).toLocaleString('ca-ES', {
              day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
            })}
          </p>
        </div>
        <a
          href={`${API}/kanban/proposals/${id}/export-xlsx`}
          download
          className="inline-flex h-9 items-center gap-1.5 px-3 rounded-[2px] border border-navy/40 font-display text-[13px] font-bold text-navy hover:bg-navy hover:text-white transition-colors shrink-0"
        >
          Exportar Excel
        </a>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard label="Versió" value={`v${proposal.versionNumber}`} accent="navy" />
        <KpiCard label="Articles" value={proposal.summaryJson?.itemCount ?? '—'} accent="green" />
        <KpiCard
          label="Valor Kmax"
          value={
            proposal.summaryJson?.totalValueAtKmax != null
              ? `${Number(proposal.summaryJson.totalValueAtKmax).toLocaleString('ca-ES', { minimumFractionDigits: 0 })} €`
              : '—'
          }
          accent="blue"
        />
        <KpiCard
          label="Stock mig"
          value={
            proposal.summaryJson?.averageInventoryValue != null
              ? `${Number(proposal.summaryJson.averageInventoryValue).toLocaleString('ca-ES', { minimumFractionDigits: 0 })} €`
              : '—'
          }
          accent="navy"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Codi</TableHead>
            <TableHead>Descripció</TableHead>
            <TableHead align="right">Cost €</TableHead>
            <TableHead align="right">Dem/dia</TableHead>
            <TableHead align="right">Kmin</TableHead>
            <TableHead align="right">ΔKmin</TableHead>
            <TableHead align="right">Klot</TableHead>
            <TableHead align="right">ΔKlot</TableHead>
            <TableHead align="right">Kmax</TableHead>
            <TableHead align="right">ΔKmax</TableHead>
            <TableHead align="right">Val. Kmax €</TableHead>
            <TableHead align="center">Control</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {proposal.items?.map((item) => (
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
              <TableCell className="max-w-[220px] truncate" title={item.description}>
                {item.description}
              </TableCell>
              <TableCell numeric>{Number(item.unitCost).toFixed(2)}</TableCell>
              <TableCell numeric>{Number(item.avgDailyDemand).toFixed(3)}</TableCell>
              <TableCell numeric>{item.kmin}</TableCell>
              <TableCell align="right"><Delta value={item.diffJson?.kminDelta} /></TableCell>
              <TableCell numeric>{item.klot}</TableCell>
              <TableCell align="right"><Delta value={item.diffJson?.klotDelta} /></TableCell>
              <TableCell numeric>{item.kmax}</TableCell>
              <TableCell align="right"><Delta value={item.diffJson?.kmaxDelta} /></TableCell>
              <TableCell numeric>
                {Number(item.valueAtKmax).toLocaleString('ca-ES', { minimumFractionDigits: 2 })}
              </TableCell>
              <TableCell align="center">
                <ControlBadge type={item.controlType} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
