import { Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@kanban/ui';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type ArticleMetricSummary = {
  avgDailyDemand: string | number;
  annualRotation?: string | number | null;
  totalConsumption?: string | number | null;
  periodWorkingDays?: number | null;
};

type Article = {
  id: string;
  code: string;
  description: string;
  unitCost: string | number;
  currentStock?: string | number | null;
  packaging?: string | null;
  isCostException: boolean;
  updatedAt: string;
  metrics: ArticleMetricSummary[];
};

function SourceMetric({ metric }: { metric?: ArticleMetricSummary }) {
  if (!metric) return <span className="text-muted-foreground">—</span>;
  if (metric.totalConsumption != null && Number(metric.totalConsumption) > 0) {
    return (
      <span className="font-mono text-[12px] text-navy">
        {Number(metric.totalConsumption).toLocaleString('ca-ES', { maximumFractionDigits: 0 })} u
        {metric.periodWorkingDays ? `/${metric.periodWorkingDays}d` : ''}
      </span>
    );
  }
  if (metric.annualRotation != null && Number(metric.annualRotation) > 0) {
    return (
      <span className="font-mono text-[12px] text-navy">
        {Number(metric.annualRotation).toLocaleString('ca-ES', { maximumFractionDigits: 0 })} u/any
      </span>
    );
  }
  return <span className="text-muted-foreground">—</span>;
}

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;
  const url = search
    ? `${API}/articles?search=${encodeURIComponent(search)}`
    : `${API}/articles`;
  const articles: Article[] = await fetch(url, { cache: 'no-store' })
    .then((r) => r.json())
    .catch(() => []);

  return (
    <div className="space-y-6">
      <div>
        <h1>Articles</h1>
        <p className="text-muted-foreground text-[13px] mt-1">
          Master data d'articles sincronitzats des dels imports Excel.
        </p>
      </div>

      <form method="GET" className="flex gap-2 max-w-sm">
        <input
          name="search"
          defaultValue={search}
          placeholder="Cercar per codi o descripció…"
          className="h-9 flex-1 rounded-[2px] border border-navy/24 bg-card px-3 text-[14px] text-foreground focus:outline-none focus:border-navy focus:ring-[3px] focus:ring-navy/12 placeholder:text-muted-foreground/70"
        />
        <button
          type="submit"
          className="h-9 px-3 rounded-[2px] bg-navy text-white font-display font-bold text-[13px] hover:bg-navy-dark transition-colors"
        >
          Cercar
        </button>
        {search && (
          <a
            href="/articles"
            className="h-9 px-3 inline-flex items-center rounded-[2px] border border-navy/40 text-navy font-display font-semibold text-[13px] hover:bg-navy hover:text-white transition-colors"
          >
            Netejar
          </a>
        )}
      </form>

      {articles.length === 0 ? (
        <div className="bg-card border border-border/30 rounded-[2px] p-10 text-center text-muted-foreground text-[13px]">
          {search
            ? `Cap article coincideix amb "${search}".`
            : 'Encara no hi ha articles. Importa un Excel primer.'}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Codi</TableHead>
              <TableHead>Descripció</TableHead>
              <TableHead align="right">Cost unit. €</TableHead>
              <TableHead align="right">Font consum</TableHead>
              <TableHead align="right">Dem. diària</TableHead>
              <TableHead align="right">Stock actual</TableHead>
              <TableHead>Packaging</TableHead>
              <TableHead align="center">Estat</TableHead>
              <TableHead>Actualitzat</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.map((a) => {
              const latestMetric = a.metrics?.[0];
              return (
                <TableRow key={a.id}>
                  <TableCell>
                    <span className="font-mono text-[12px] text-navy font-semibold">{a.code}</span>
                  </TableCell>
                  <TableCell className="max-w-[240px] truncate" title={a.description}>
                    {a.description}
                  </TableCell>
                  <TableCell numeric>{Number(a.unitCost).toFixed(4)}</TableCell>
                  <TableCell align="right">
                    <SourceMetric metric={latestMetric} />
                  </TableCell>
                  <TableCell numeric>
                    {latestMetric
                      ? Number(latestMetric.avgDailyDemand).toFixed(3)
                      : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell numeric>
                    {a.currentStock != null
                      ? Number(a.currentStock).toLocaleString('ca-ES')
                      : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{a.packaging ?? '—'}</TableCell>
                  <TableCell align="center">
                    {a.isCostException ? (
                      <Badge variant="warn" size="sm">Cost zero</Badge>
                    ) : (
                      <Badge variant="success" size="sm">OK</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-[12px]">
                    {new Date(a.updatedAt).toLocaleDateString('ca-ES')}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      <p className="text-[12px] text-muted-foreground">
        {articles.length} article{articles.length !== 1 ? 's' : ''}
        {search ? ` coincidents amb "${search}"` : ' en total'}
      </p>
    </div>
  );
}
