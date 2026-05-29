'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button, Card, CardContent, CardHeader, CardTitle,
  FormField, Label, Input, Alert, AlertTitle, AlertDescription, Badge,
} from '@kanban/ui';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type UploadResult = {
  importBatchId: string;
  imported?: number;
  needsReview?: boolean;
  mapping?: {
    confidence: number;
    warnings: string[];
    fields: Record<string, string>;
  };
  headers?: string[];
  warnings?: string[];
  message?: string;
};

const FIELD_LABELS: Record<string, string> = {
  code: 'Codi article',
  description: 'Descripció',
  unitCost: 'Cost unitari',
  currentStock: 'Stock actual',
  totalConsumption: 'Consum total',
  annualRotation: 'Rotació anual',
  packaging: 'Packaging',
};

export default function UploadPage() {
  const router = useRouter();
  const [result, setResult] = useState<UploadResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const res = await fetch(`${API}/imports/upload`, { method: 'POST', body: formData });
      const json: UploadResult = await res.json();

      if (!res.ok) {
        setError((json as any).message || 'Error en la importació');
        return;
      }

      if (json.needsReview) {
        router.push(`/upload/${json.importBatchId}/mapping`);
        return;
      }

      setResult(json);
    } catch (err) {
      setError('Error de connexió amb el servidor');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1>Importar Excel</h1>
        <p className="text-muted-foreground text-[13px] mt-1">
          Claude infereix el mapeig de columnes automàticament. Si la confiança és baixa, podràs revisar-lo.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fitxer i paràmetres d'importació</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField className="sm:col-span-2">
                <Label htmlFor="file">Fitxer Excel (.xlsx / .xls)</Label>
                <Input id="file" name="file" type="file" accept=".xls,.xlsx" required />
              </FormField>
              <FormField>
                <Label htmlFor="sheetName">Full (opcional)</Label>
                <Input id="sheetName" name="sheetName" placeholder="Primer full per defecte" />
              </FormField>
              <FormField>
                <Label htmlFor="workingDaysPerYear">Dies laborables / any</Label>
                <Input id="workingDaysPerYear" name="workingDaysPerYear" type="number" defaultValue="220" />
              </FormField>
              <FormField>
                <Label htmlFor="periodStart">Inici del període</Label>
                <Input id="periodStart" name="periodStart" type="date" />
              </FormField>
              <FormField>
                <Label htmlFor="periodEnd">Fi del període</Label>
                <Input id="periodEnd" name="periodEnd" type="date" />
              </FormField>
              <FormField>
                <Label htmlFor="periodWorkingDays">Dies laborables del període</Label>
                <Input id="periodWorkingDays" name="periodWorkingDays" type="number" placeholder="ex: 220" />
              </FormField>
            </div>
            <Button type="submit" variant="accent" loading={loading} size="lg">
              Pujar i sincronitzar
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert tone="danger">
          <AlertTitle>Error en la importació</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <div className="space-y-4">
          <Alert tone="success">
            <AlertTitle>
              Importació completada — {result.imported ?? 0} articles sincronitzats
            </AlertTitle>
            <AlertDescription>
              ID: <span className="font-mono text-[12px]">{result.importBatchId}</span>
              {result.mapping?.confidence !== undefined && (
                <span className="ml-3">
                  Confiança: <span className="font-semibold">{Math.round(result.mapping.confidence * 100)}%</span>
                </span>
              )}
            </AlertDescription>
          </Alert>

          {result.mapping && (
            <Card>
              <CardHeader>
                <CardTitle>Mapeig de columnes aplicat</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-0 divide-y divide-border/20">
                  {Object.entries(result.mapping.fields).map(([field, col]) => (
                    <div key={field} className="flex items-center justify-between gap-3 py-2">
                      <span className="text-[12px] font-display font-bold uppercase tracking-caps text-muted-foreground">
                        {FIELD_LABELS[field] ?? field}
                      </span>
                      <Badge variant="navy" size="sm">{col}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {result.warnings && result.warnings.length > 0 && (
            <Alert tone="warn">
              <AlertTitle>Avisos de qualitat de dades</AlertTitle>
              <ul className="mt-1 list-disc list-inside space-y-0.5">
                {result.warnings.map((w, i) => (
                  <li key={i} className="text-[12px]">{w}</li>
                ))}
              </ul>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
}
