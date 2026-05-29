'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Button, Card, CardContent, CardHeader, CardTitle,
  Alert, AlertTitle, AlertDescription, Badge, Stepper,
} from '@kanban/ui';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const CANONICAL_FIELDS: { key: string; label: string; required: boolean; hint: string }[] = [
  { key: 'code', label: 'Codi article', required: true, hint: 'Identificador únic de l\'article (ex: referència, SAP, ERP)' },
  { key: 'description', label: 'Descripció', required: true, hint: 'Nom o descripció de l\'article' },
  { key: 'unitCost', label: 'Cost unitari (€)', required: true, hint: 'Preu de compra o cost unitari' },
  { key: 'currentStock', label: 'Stock actual', required: false, hint: 'Quantitat en estoc en el moment de l\'exportació' },
  { key: 'totalConsumption', label: 'Consum total del període', required: false, hint: 'Unitats consumides durant el període analitzat' },
  { key: 'annualRotation', label: 'Rotació anual', required: false, hint: 'Unitats consumides en un any complet' },
  { key: 'packaging', label: 'Packaging / Unitat logística', required: false, hint: 'Unitat mínima de comanda o embalatge' },
];

type ImportBatch = {
  id: string;
  originalName: string;
  status: string;
  headersJson: string[] | null;
  mappingJson: {
    confidence: number;
    warnings: string[];
    fields: Record<string, string>;
  } | null;
};

export default function MappingReviewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [batch, setBatch] = useState<ImportBatch | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API}/imports/${id}`)
      .then((r) => r.json())
      .then((data: ImportBatch) => {
        setBatch(data);
        // Pre-fill fields from inferred mapping
        if (data.mappingJson?.fields) {
          setFields(data.mappingJson.fields);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('No s\'ha pogut carregar el mapeig. Torna a intentar la importació.');
        setLoading(false);
      });
  }, [id]);

  async function confirm() {
    setSubmitting(true);
    setError(null);

    // Validate required fields
    const missingRequired = CANONICAL_FIELDS.filter((f) => f.required && !fields[f.key]);
    if (missingRequired.length > 0) {
      setError(`Camps obligatoris sense columna assignada: ${missingRequired.map((f) => f.label).join(', ')}`);
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`${API}/imports/${id}/confirm-mapping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields }),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.message || 'Error confirmant el mapeig');
        return;
      }

      router.push(`/upload/${id}/confirmed?imported=${json.imported ?? 0}`);
    } catch {
      setError('Error de connexió amb el servidor');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-[13px] py-12">
        <span className="h-3.5 w-3.5 animate-spin border-2 border-navy border-t-transparent rounded-full inline-block" />
        Carregant mapeig…
      </div>
    );
  }

  if (!batch) {
    return (
      <Alert tone="danger">
        <AlertTitle>Import no trobat</AlertTitle>
        <AlertDescription>
          <Link href="/upload" className="underline">Torna a la pàgina d'importació</Link>
        </AlertDescription>
      </Alert>
    );
  }

  const headers: string[] = batch.headersJson ?? [];
  const confidence = batch.mappingJson?.confidence ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2">
          <Link href="/upload" className="text-muted-foreground text-[12px] hover:text-navy">← Importació</Link>
        </div>
        <h1>Revisió del mapeig de columnes</h1>
        <p className="text-muted-foreground text-[13px] mt-1">
          <span className="font-semibold text-foreground">{batch.originalName}</span>
          {' '} — Claude ha detectat les columnes amb una confiança del{' '}
          <span className="font-semibold">{Math.round(confidence * 100)}%</span>.
          Revisa i corregeix el mapeig si cal.
        </p>
      </div>

      <Stepper
        current={1}
        steps={[
          { label: 'Fitxer pujat', description: 'Excel processat' },
          { label: 'Revisió mapping', description: 'Confirma les columnes' },
          { label: 'Sincronitzat', description: 'Articles a PostgreSQL' },
        ]}
      />

      <Alert tone="warn">
        <AlertTitle>Revisió necessària — confiança {Math.round(confidence * 100)}%</AlertTitle>
        <AlertDescription>
          Claude no està segur de com mapear algunes columnes. Comprova que cada camp apunta a la columna correcta del teu Excel.
        </AlertDescription>
      </Alert>

      {batch.mappingJson?.warnings && batch.mappingJson.warnings.length > 0 && (
        <Alert tone="info">
          <ul className="list-disc list-inside space-y-0.5">
            {batch.mappingJson.warnings.map((w, i) => (
              <li key={i} className="text-[12px]">{w}</li>
            ))}
          </ul>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Mapeig de columnes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {CANONICAL_FIELDS.map((cf) => (
              <div key={cf.key} className="grid grid-cols-[1fr_auto_1fr] items-start gap-4">
                <div>
                  <div className="font-display text-[12px] font-bold uppercase tracking-caps text-muted-foreground mb-0.5">
                    {cf.label}
                    {cf.required && <span className="text-destructive ml-1">*</span>}
                  </div>
                  <p className="text-[11px] text-muted-foreground">{cf.hint}</p>
                </div>
                <div className="flex items-center h-9 text-muted-foreground">→</div>
                <div>
                  <select
                    value={fields[cf.key] ?? ''}
                    onChange={(e) => setFields((prev) => ({ ...prev, [cf.key]: e.target.value }))}
                    className="h-9 w-full rounded-[2px] border border-navy/24 bg-card px-3 text-[14px] text-foreground focus:outline-none focus:border-navy focus:ring-[3px] focus:ring-navy/12"
                  >
                    <option value="">{cf.required ? '— selecciona columna —' : '— no mapejat (opcional) —'}</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                  {fields[cf.key] && (
                    <Badge variant="navy" size="sm" className="mt-1">{fields[cf.key]}</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert tone="danger">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3">
        <Button variant="accent" size="lg" loading={submitting} onClick={confirm}>
          Confirmar mapeig i importar
        </Button>
        <Button variant="outline" size="lg" asChild>
          <Link href="/upload">Cancel·lar</Link>
        </Button>
      </div>
    </div>
  );
}
