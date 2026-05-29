import Link from 'next/link';
import { KpiCard, Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@kanban/ui';
import ProposalTable from './ProposalTable';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
    costZeroExceptionCount?: number;
    top10ByKmaxValue?: { code: string; description: string; valueAtKmax: number }[];
  };
  items: any[];
};

export default async function ProposalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const proposal: Proposal = await fetch(`${API}/kanban/proposals/${id}`, {
    cache: 'no-store',
  }).then((r) => r.json());

  const summary = proposal.summaryJson ?? {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-1">
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

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
        <KpiCard label="Versió" value={`v${proposal.versionNumber}`} accent="navy" />
        <KpiCard label="Articles" value={summary.itemCount ?? '—'} accent="green" />
        <KpiCard
          label="Valor Kmax total"
          value={summary.totalValueAtKmax != null
            ? `${Number(summary.totalValueAtKmax).toLocaleString('ca-ES', { minimumFractionDigits: 0 })} €`
            : '—'}
          accent="blue"
        />
        <KpiCard
          label="Stock mig estimat"
          value={summary.averageInventoryValue != null
            ? `${Number(summary.averageInventoryValue).toLocaleString('ca-ES', { minimumFractionDigits: 0 })} €`
            : '—'}
          accent="navy"
        />
        <KpiCard label="Validació manual" value={summary.validationRequiredCount ?? 0} accent="warn" />
      </div>

      {/* Top-10 */}
      {summary.top10ByKmaxValue && summary.top10ByKmaxValue.length > 0 && (
        <div className="space-y-3">
          <h2>Top 10 articles per valor Kmax</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Codi</TableHead>
                <TableHead>Descripció</TableHead>
                <TableHead align="right">Valor Kmax (€)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.top10ByKmaxValue.map((t, i) => (
                <TableRow key={t.code}>
                  <TableCell>
                    <span className="font-display font-bold text-muted-foreground text-[12px]">{i + 1}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-[12px]">{t.code}</span>
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate">{t.description}</TableCell>
                  <TableCell numeric>
                    {Number(t.valueAtKmax).toLocaleString('ca-ES', { minimumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Main table — client component amb filtre + cerca */}
      <div>
        <h2>Taula Kanban</h2>
        <div className="mt-3">
          <ProposalTable items={proposal.items ?? []} />
        </div>
      </div>
    </div>
  );
}
