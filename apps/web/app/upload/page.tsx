'use client';

import { useState } from 'react';
import {
  Button, Card, CardContent, CardHeader, CardTitle,
  FormField, Label, Input, Alert, AlertTitle, AlertDescription, Badge,
} from '@kanban/ui';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type UploadResult = {
  importBatchId: string;
  imported?: number;
  mapping?: {
    confidence: number;
    warnings: string[];
    fields: Record<string, string>;
  };
  needsReview?: boolean;
  error?: string;
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
  const [result, setResult] = useState<UploadResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    const formData = new FormData(e.currentTarget);
    const res = await fetch(`${API}/imports/upload`, { method: 'POST', body: formData });
    const json = await res.json();
    setResult(json);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1>Importar Excel</h1>
        <p className="text-muted-foreground text-[13px] mt-1">
          Claude infereix el mapeig de columnes automàticament. El càlcul Kanban és determinista.
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
                <Label htmlFor="file">Fitxer Excel</Label>
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
              {loading ? 'Important...' : 'Pujar i sincronitzar'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && !result.error && (
        <div className="space-y-4">
          <Alert tone={result.needsReview ? 'warn' : 'success'}>
            <AlertTitle>
              {result.needsReview
                ? 'Revisió del mapeig necessària'
                : `Importació completada — ${result.imported ?? 0} articles sincronitzats`}
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
                <CardTitle>Mapeig de columnes detectat</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 sm:grid-cols-2">
                  {Object.entries(result.mapping.fields).map(([field, col]) => (
                    <div key={field} className="flex items-center justify-between gap-3 py-1.5 border-b border-border/20 last:border-0">
                      <span className="text-[12px] font-display font-bold uppercase tracking-caps text-muted-foreground">
                        {FIELD_LABELS[field] ?? field}
                      </span>
                      <Badge variant="navy" size="sm">{col}</Badge>
                    </div>
                  ))}
                </div>
                {result.mapping.warnings?.length > 0 && (
                  <Alert tone="warn" className="mt-4">
                    <ul className="list-disc list-inside space-y-0.5">
                      {result.mapping.warnings.map((w, i) => (
                        <li key={i} className="text-[12px]">{w}</li>
                      ))}
                    </ul>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {result?.error && (
        <Alert tone="danger">
          <AlertTitle>Error en la importació</AlertTitle>
          <AlertDescription>{result.error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
