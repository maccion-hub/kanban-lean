'use client';

import { useState } from 'react';
import {
  Button, Card, CardContent, CardHeader, CardTitle,
  FormField, Label, Input, KpiCard, Alert, AlertTitle, AlertDescription,
} from '@kanban/ui';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type GenerateResult = {
  proposalId?: string;
  versionNumber?: number;
  unchanged?: boolean;
  summary?: {
    itemCount: number;
    simplePhysicalCount: number;
    validationRequiredCount: number;
    costZeroExceptionCount: number;
    totalValueAtKmax: number;
    averageInventoryValue: number;
  };
  error?: string;
};

export default function KanbanPage() {
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function generate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    const payload = Object.fromEntries(new FormData(e.currentTarget).entries());
    const clean = Object.fromEntries(
      Object.entries(payload).filter(([, v]) => String(v).trim() !== '')
    );
    const res = await fetch(`${API}/kanban/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clean),
    });
    setResult(await res.json());
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1>Generar proposta Kanban</h1>
        <p className="text-muted-foreground text-[13px] mt-1">
          Calcula Kmin, Klot i Kmax per a tots els articles de l'import actiu.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Paràmetres de generació</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={generate} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField>
                <Label htmlFor="name">Nom de la proposta</Label>
                <Input id="name" name="name" placeholder="Kanban proposta" />
              </FormField>
              <FormField>
                <Label htmlFor="importBatchId">Import ID (opcional)</Label>
                <Input id="importBatchId" name="importBatchId" placeholder="Últim import per defecte" />
              </FormField>
              <FormField>
                <Label htmlFor="configId">Config ID (opcional)</Label>
                <Input id="configId" name="configId" placeholder="Config per defecte" />
              </FormField>
            </div>
            <Button type="submit" variant="accent" loading={loading} size="lg">
              Generar proposta
            </Button>
          </form>
        </CardContent>
      </Card>

      {result?.summary && (
        <div className="space-y-4">
          {result.unchanged ? (
            <Alert tone="info">
              <AlertTitle>Proposta sense canvis</AlertTitle>
              <AlertDescription>
                Les dades i la configuració no han canviat respecte a la versió anterior. No s'ha creat una nova proposta.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert tone="success">
              <AlertTitle>Proposta v{result.versionNumber} generada</AlertTitle>
              <AlertDescription>
                ID: <span className="font-mono text-[12px]">{result.proposalId}</span>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <KpiCard label="Articles" value={result.summary.itemCount} accent="navy" />
            <KpiCard label="Físic simple" value={result.summary.simplePhysicalCount} accent="green" />
            <KpiCard label="Validació manual" value={result.summary.validationRequiredCount} accent="blue" />
            <KpiCard label="Cost zero" value={result.summary.costZeroExceptionCount} accent="warn" />
            <KpiCard
              label="Valor Kmax"
              value={`${result.summary.totalValueAtKmax.toLocaleString('ca-ES', { minimumFractionDigits: 0 })} €`}
              accent="navy"
            />
            <KpiCard
              label="Stock mig"
              value={`${result.summary.averageInventoryValue.toLocaleString('ca-ES', { minimumFractionDigits: 0 })} €`}
              accent="blue"
            />
          </div>
        </div>
      )}

      {result?.error && (
        <Alert tone="danger">
          <AlertTitle>Error en la generació</AlertTitle>
          <AlertDescription>{result.error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
