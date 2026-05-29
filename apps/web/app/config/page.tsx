'use client';

import { useEffect, useState } from 'react';
import {
  Button, Card, CardContent, CardHeader, CardTitle, CardFooter,
  FormField, Label, Input, InputGroup, InputGroupAddon, InputGroupInput,
  Alert, AlertTitle,
} from '@kanban/ui';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function ConfigPage() {
  const [config, setConfig] = useState<Record<string, unknown> | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API}/kanban-configs/default`)
      .then((r) => r.json())
      .then(setConfig);
  }, []);

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    const payload = Object.fromEntries(new FormData(e.currentTarget).entries());
    const method = config && 'id' in config ? 'PUT' : 'POST';
    const url =
      config && 'id' in config
        ? `${API}/kanban-configs/${config.id}`
        : `${API}/kanban-configs`;
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setConfig(await res.json());
    setSaved(true);
    setLoading(false);
  }

  if (!config) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-[13px]">
        <span className="h-3.5 w-3.5 animate-spin border-2 border-navy border-t-transparent rounded-full inline-block" />
        Carregant configuració...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1>Configuració Kanban</h1>
        <p className="text-muted-foreground text-[13px] mt-1">
          Paràmetres que controlen el dimensionament de Kmin, Klot i Kmax.
        </p>
      </div>

      <form onSubmit={save}>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card accent="navy">
            <CardHeader>
              <CardTitle>General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <NumField name="name" label="Nom de la configuració" value={config.name} type="text" />
              <NumField name="workingDaysPerYear" label="Dies laborables per any" value={config.workingDaysPerYear} suffix="dies" />
            </CardContent>
          </Card>

          <Card accent="navy">
            <CardHeader>
              <CardTitle>Temps de resposta (Kmin)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <NumField name="leadTimeDays" label="Lead time" value={config.leadTimeDays} suffix="dies" />
              <NumField name="safetyStockDays" label="Safety stock" value={config.safetyStockDays} suffix="dies" />
            </CardContent>
          </Card>

          <Card accent="green">
            <CardHeader>
              <CardTitle>Trams de cost (Klot)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <NumField name="lowCostMax" label="Cost baix — fins a" value={config.lowCostMax} suffix="€" />
              <NumField name="lowCostLotDays" label="  → dies de lot" value={config.lowCostLotDays} suffix="dies" />
              <NumField name="mediumCostMax" label="Cost mig — fins a" value={config.mediumCostMax} suffix="€" />
              <NumField name="mediumCostLotDays" label="  → dies de lot" value={config.mediumCostLotDays} suffix="dies" />
              <NumField name="highCostLotDays" label="Cost alt → dies de lot" value={config.highCostLotDays} suffix="dies" />
            </CardContent>
          </Card>

          <Card accent="blue">
            <CardHeader>
              <CardTitle>Validació manual (Kmax)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <NumField name="validationUnitCostMin" label="Cost unitari ≥" value={config.validationUnitCostMin} suffix="€" />
              <NumField name="validationKmaxValueMin" label="Valor Kmax ≥" value={config.validationKmaxValueMin} suffix="€" />
            </CardContent>
          </Card>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Button type="submit" variant="accent" loading={loading} size="lg">
            Desar configuració
          </Button>
          {saved && (
            <Alert tone="success" className="flex-1">
              <AlertTitle>Configuració desada correctament</AlertTitle>
            </Alert>
          )}
        </div>
      </form>
    </div>
  );
}

function NumField({
  name,
  label,
  value,
  suffix,
  type = 'number',
}: {
  name: string;
  label: string;
  value: unknown;
  suffix?: string;
  type?: string;
}) {
  return (
    <FormField>
      <Label htmlFor={name}>{label}</Label>
      {suffix ? (
        <InputGroup>
          <InputGroupInput id={name} name={name} type={type} defaultValue={String(value ?? '')} />
          <InputGroupAddon position="trailing">{suffix}</InputGroupAddon>
        </InputGroup>
      ) : (
        <Input id={name} name={name} type={type} defaultValue={String(value ?? '')} />
      )}
    </FormField>
  );
}
