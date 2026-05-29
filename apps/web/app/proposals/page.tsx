import Link from 'next/link';
import { Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@kanban/ui';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type Proposal = {
  id: string;
  versionNumber: number;
  name: string;
  status: string;
  createdAt: string;
  summaryJson?: {
    itemCount?: number;
    totalValueAtKmax?: number;
    simplePhysicalCount?: number;
    validationRequiredCount?: number;
  };
};

export default async function ProposalsPage() {
  const proposals: Proposal[] = await fetch(`${API}/kanban/proposals`, { cache: 'no-store' })
    .then((r) => r.json())
    .catch(() => []);

  return (
    <div className="space-y-6">
      <div>
        <h1>Propostes Kanban</h1>
        <p className="text-muted-foreground text-[13px] mt-1">
          Historial de versions generades. Cada proposta és immutable.
        </p>
      </div>

      {proposals.length === 0 ? (
        <div className="bg-card border border-border/30 rounded-[2px] p-10 text-center text-muted-foreground text-[13px]">
          Encara no hi ha cap proposta. Ves a{' '}
          <Link href="/kanban" className="text-navy font-semibold">
            Generar
          </Link>{' '}
          per crear-ne una.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Versió</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Data</TableHead>
              <TableHead align="right">Articles</TableHead>
              <TableHead align="right">Valor Kmax</TableHead>
              <TableHead align="center">Estat</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {proposals.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <span className="font-display font-bold text-navy">v{p.versionNumber}</span>
                </TableCell>
                <TableCell>{p.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(p.createdAt).toLocaleString('ca-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </TableCell>
                <TableCell numeric>{p.summaryJson?.itemCount ?? '—'}</TableCell>
                <TableCell numeric>
                  {p.summaryJson?.totalValueAtKmax != null
                    ? `${Number(p.summaryJson.totalValueAtKmax).toLocaleString('ca-ES', { minimumFractionDigits: 2 })} €`
                    : '—'}
                </TableCell>
                <TableCell align="center">
                  <Badge variant={p.status === 'APPROVED' ? 'success' : p.status === 'ARCHIVED' ? 'gray' : 'navy'} size="sm">
                    {p.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/proposals/${p.id}`}
                    className="inline-flex h-7 items-center px-2.5 rounded-[2px] border border-navy/40 font-display text-[12px] font-semibold text-navy hover:bg-navy hover:text-white transition-colors"
                  >
                    Obrir
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
