'use client';

import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function ConfigPage() {
  const [config, setConfig] = useState<any>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`${API}/kanban-configs/default`).then(r => r.json()).then(setConfig);
  }, []);

  async function save(formData: FormData) {
    const payload = Object.fromEntries(formData.entries());
    const method = config?.id ? 'PUT' : 'POST';
    const url = config?.id ? `${API}/kanban-configs/${config.id}` : `${API}/kanban-configs`;
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setConfig(await res.json());
    setSaved(true);
  }

  if (!config) return <p>Loading...</p>;

  return (
    <div>
      <h1>Kanban configuration</h1>
      <div className="card">
        <form action={save}>
          <div className="grid">
            <Field name="name" label="Name" value={config.name} />
            <Field name="workingDaysPerYear" label="Working days per year" value={config.workingDaysPerYear} />
            <Field name="leadTimeDays" label="Lead time days" value={config.leadTimeDays} />
            <Field name="safetyStockDays" label="Safety stock days" value={config.safetyStockDays} />
            <Field name="lowCostMax" label="Low cost max EUR" value={config.lowCostMax} />
            <Field name="mediumCostMax" label="Medium cost max EUR" value={config.mediumCostMax} />
            <Field name="lowCostLotDays" label="Low cost lot days" value={config.lowCostLotDays} />
            <Field name="mediumCostLotDays" label="Medium cost lot days" value={config.mediumCostLotDays} />
            <Field name="highCostLotDays" label="High cost lot days" value={config.highCostLotDays} />
            <Field name="validationUnitCostMin" label="Validation if unit cost >=" value={config.validationUnitCostMin} />
            <Field name="validationKmaxValueMin" label="Validation if Kmax value >=" value={config.validationKmaxValueMin} />
          </div>
          <p className="small">Default model: Kmin = 2 days lead time + 5 days safety stock. Klot depends on unit cost tier.</p>
          <button type="submit">Save configuration</button>
          {saved && <span className="small"> Saved.</span>}
        </form>
      </div>
    </div>
  );
}

function Field({ name, label, value }: { name: string; label: string; value: any }) {
  return <div><label>{label}</label><input name={name} defaultValue={String(value ?? '')} /></div>;
}
