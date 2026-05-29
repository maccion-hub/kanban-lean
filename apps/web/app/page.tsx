import Link from 'next/link';
import { KpiCard } from '@kanban/ui';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function getStats() {
  try {
    const [proposals, imports] = await Promise.all([
      fetch(`${API}/kanban/proposals`, { cache: 'no-store' }).then((r) => r.json()),
      fetch(`${API}/imports`, { cache: 'no-store' }).then((r) => r.json()),
    ]);
    return {
      lastProposal: Array.isArray(proposals) ? proposals[0] : null,
      importCount: Array.isArray(imports) ? imports.length : 0,
    };
  } catch {
    return { lastProposal: null, importCount: 0 };
  }
}

export default async function HomePage() {
  const { lastProposal, importCount } = await getStats();

  return (
    <div className="space-y-8">
      <div>
        <h1>Kanban Lean — SABEMSA</h1>
        <p className="text-muted-foreground mt-1 text-[14px]">
          Plataforma de dimensionament de stocks per a manteniment industrial
        </p>
      </div>

      {lastProposal ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <KpiCard label="Última proposta" value={`v${lastProposal.versionNumber}`} accent="navy" />
          <KpiCard
            label="Articles calculats"
            value={lastProposal.summaryJson?.itemCount ?? '—'}
            accent="green"
          />
          <KpiCard
            label="Valor Kmax total"
            value={
              lastProposal.summaryJson?.totalValueAtKmax
                ? `${lastProposal.summaryJson.totalValueAtKmax} €`
                : '—'
            }
            accent="blue"
          />
          <KpiCard label="Imports processats" value={importCount} accent="navy" />
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <StepCard
          step={1}
          title="Importar Excel"
          description="Puja un fitxer Excel amb articles, consum o rotació i cost unitari. Claude infereix el mapeig de columnes automàticament."
          href="/upload"
          cta="Importar ara"
          accent="navy"
        />
        <StepCard
          step={2}
          title="Configurar paràmetres"
          description="Ajusta lead time, safety stock i trams de cost per calibrar el dimensionament Kanban al teu context de manteniment."
          href="/config"
          cta="Configurar"
          accent="green"
        />
        <StepCard
          step={3}
          title="Generar proposta"
          description="Calcula Kmin, Klot i Kmax per cada article i compara versions per veure l'evolució dels stocks proposats."
          href="/kanban"
          cta="Generar"
          accent="blue"
        />
      </div>
    </div>
  );
}

function StepCard({
  step,
  title,
  description,
  href,
  cta,
  accent,
}: {
  step: number;
  title: string;
  description: string;
  href: string;
  cta: string;
  accent: 'navy' | 'green' | 'blue';
}) {
  const borderTop = { navy: 'border-t-navy', green: 'border-t-green', blue: 'border-t-blue' }[accent];
  const numBg = { navy: 'bg-navy', green: 'bg-green', blue: 'bg-blue' }[accent];
  return (
    <div
      className={`bg-card border border-border/30 border-t-[3px] rounded-[2px] p-5 flex flex-col gap-3 ${borderTop}`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex h-7 w-7 items-center justify-center rounded-[2px] font-display font-bold text-[13px] text-white shrink-0 ${numBg}`}
        >
          {step}
        </span>
        <h3 className="font-display font-bold text-[15px] text-navy leading-tight">{title}</h3>
      </div>
      <p className="text-[13px] text-muted-foreground flex-1 leading-relaxed">{description}</p>
      <Link
        href={href}
        className="inline-flex h-8 items-center justify-center rounded-[2px] bg-navy px-3 font-display text-[12px] font-bold text-white hover:bg-navy-dark transition-colors"
      >
        {cta}
      </Link>
    </div>
  );
}
