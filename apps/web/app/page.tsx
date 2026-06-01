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
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1>Kanban Lean — SABEMSA</h1>
        <p className="text-muted-foreground mt-1 text-[14px]">
          Plataforma de dimensionament de stocks per a manteniment industrial
        </p>
      </div>

      {/* KPI si hi ha dades */}
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
                ? `${Number(lastProposal.summaryJson.totalValueAtKmax).toLocaleString('ca-ES', { maximumFractionDigits: 0 })} €`
                : '—'
            }
            accent="blue"
          />
          <KpiCard label="Imports processats" value={importCount} accent="navy" />
        </div>
      ) : null}

      {/* Passos */}
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

      {/* Glossari — Com llegir els resultats */}
      <div className="space-y-4">
        <div>
          <h2>Com llegir els resultats</h2>
          <p className="text-muted-foreground text-[13px] mt-1">
            Els tres valors Kanban defineixen quan i quant reposar cada article.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <GlossaryCard
            color="navy"
            label="KMIN"
            subtitle="Punt de reposició"
            formula="Dem. diària × (Lead time + Seguretat)"
            example="1.09 u/dia × 7d = 7.64 → 10 u"
            description="Quan l'estoc real baixa fins a Kmin, cal llançar una comanda de reposició. Cobreix el temps d'espera (lead time) més un buffer de seguretat davant variabilitats."
          />
          <GlossaryCard
            color="green"
            label="KLOT"
            subtitle="Lot de reposició"
            formula="Dem. diària × Dies de cobertura"
            example="1.09 u/dia × 15d = 16.36 → 20 u"
            description={
              <>
                Quantitat a reposar en cada comanda. Els dies de cobertura varien per cost unitari:
                <ul className="mt-1.5 space-y-0.5 text-[11px]">
                  <li className="flex gap-1.5"><span className="text-muted-foreground">·</span> Cost &lt;1€ → 20 dies</li>
                  <li className="flex gap-1.5"><span className="text-muted-foreground">·</span> Cost 1–10€ → 15 dies</li>
                  <li className="flex gap-1.5"><span className="text-muted-foreground">·</span> Cost ≥10€ → 10 dies</li>
                </ul>
              </>
            }
          />
          <GlossaryCard
            color="blue"
            label="KMAX"
            subtitle="Nivell objectiu"
            formula="Kmin + Klot"
            example="10 + 20 = 30 u"
            description="Estoc esperat just després de reposar. Defineix el nivell màxim físic del contenidor, prestatge o caixa Kanban. Serveix de referència visual per detectar sobrestocks."
          />
        </div>

        {/* Tipus de control */}
        <div className="grid gap-3 sm:grid-cols-3 mt-2">
          <ControlCard
            variant="success"
            label="Kanban físic simple"
            description="Gestió visual directa. Es pot implantar amb targes, caixes o marques. Cap revisió especial necessària."
            condition="Cost < 50€ i valor Kmax < 300€"
          />
          <ControlCard
            variant="warn"
            label="Validació manual"
            description="Article de cost elevat o valor d'estoc alt. Cal que un responsable validi els nivells proposats abans d'implantar."
            condition="Cost ≥ 50€ o valor Kmax ≥ 300€"
          />
          <ControlCard
            variant="danger"
            label="Excepció cost 0"
            description="Cost unitari no informat o igual a zero. L'article queda fora del Kanban principal fins que el cost sigui validat i corregit."
            condition="Cost unitari = 0"
          />
        </div>
      </div>
    </div>
  );
}

// ── Components estàtics ───────────────────────────────────────────────────────

function StepCard({
  step, title, description, href, cta, accent,
}: {
  step: number; title: string; description: string; href: string; cta: string; accent: 'navy' | 'green' | 'blue';
}) {
  const borderTop = { navy: 'border-t-navy', green: 'border-t-green', blue: 'border-t-blue' }[accent];
  const numBg = { navy: 'bg-navy', green: 'bg-green', blue: 'bg-blue' }[accent];
  return (
    <div className={`bg-card border border-border/30 border-t-[3px] rounded-[2px] p-5 flex flex-col gap-3 ${borderTop}`}>
      <div className="flex items-center gap-3">
        <span className={`inline-flex h-7 w-7 items-center justify-center rounded-[2px] font-display font-bold text-[13px] text-white shrink-0 ${numBg}`}>
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

function GlossaryCard({
  color, label, subtitle, formula, example, description,
}: {
  color: 'navy' | 'green' | 'blue';
  label: string;
  subtitle: string;
  formula: string;
  example: string;
  description: React.ReactNode;
}) {
  const borderTop = { navy: 'border-t-navy', green: 'border-t-green', blue: 'border-t-blue' }[color];
  const labelColor = { navy: 'text-navy', green: 'text-green-dark', blue: 'text-blue-dark' }[color];
  const bgFormula = { navy: 'bg-navy/5', green: 'bg-green/8', blue: 'bg-blue/6' }[color];
  return (
    <div className={`bg-card border border-border/30 border-t-[3px] rounded-[2px] p-4 space-y-3 ${borderTop}`}>
      <div>
        <span className={`font-display text-[22px] font-bold ${labelColor}`}>{label}</span>
        <p className="font-display text-[11px] font-bold uppercase tracking-caps text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
      <div className={`rounded-[2px] px-3 py-2 ${bgFormula}`}>
        <p className="font-mono text-[11px] text-muted-foreground">{formula}</p>
        <p className="font-mono text-[12px] font-semibold text-navy mt-0.5">ex: {example}</p>
      </div>
      <div className="text-[12px] text-muted-foreground leading-relaxed">{description}</div>
    </div>
  );
}

function ControlCard({
  variant, label, description, condition,
}: {
  variant: 'success' | 'warn' | 'danger';
  label: string;
  description: string;
  condition: string;
}) {
  const border = { success: 'border-l-status-ok', warn: 'border-l-status-warn', danger: 'border-l-status-down' }[variant];
  const dot = { success: 'bg-status-ok', warn: 'bg-status-warn', danger: 'bg-status-down' }[variant];
  return (
    <div className={`bg-card border border-border/30 border-l-[3px] rounded-[2px] px-4 py-3 space-y-1.5 ${border}`}>
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full shrink-0 ${dot}`} />
        <span className="font-display text-[12px] font-bold uppercase tracking-caps text-navy">{label}</span>
      </div>
      <p className="text-[12px] text-muted-foreground leading-relaxed">{description}</p>
      <p className="font-mono text-[11px] text-muted-foreground">{condition}</p>
    </div>
  );
}
