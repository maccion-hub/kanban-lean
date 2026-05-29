'use client';

import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function KanbanPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function generate(formData: FormData) {
    setLoading(true);
    const payload = Object.fromEntries(formData.entries());
    const res = await fetch(`${API}/kanban/generate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setResult(await res.json());
    setLoading(false);
  }

  return (
    <div>
      <h1>Generate Kanban proposal</h1>
      <div className="card">
        <form action={generate}>
          <div className="grid">
            <div><label>Proposal name</label><input name="name" placeholder="Kanban proposal" /></div>
            <div><label>Import ID (optional)</label><input name="importBatchId" placeholder="Latest import by default" /></div>
            <div><label>Config ID (optional)</label><input name="configId" placeholder="Default config by default" /></div>
          </div>
          <button type="submit" disabled={loading}>{loading ? 'Generating...' : 'Generate proposal'}</button>
        </form>
      </div>
      {result?.summary && <Summary summary={result.summary} />}
      {result && <pre className="card">{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}

function Summary({ summary }: { summary: any }) {
  return (
    <div className="grid">
      <div className="card"><div className="kpi">{summary.itemCount}</div><div>Articles</div></div>
      <div className="card"><div className="kpi">{summary.simplePhysicalCount}</div><div>Simple physical Kanban</div></div>
      <div className="card"><div className="kpi">{summary.validationRequiredCount}</div><div>Validation required</div></div>
      <div className="card"><div className="kpi">{summary.totalValueAtKmax} EUR</div><div>Total value at Kmax</div></div>
    </div>
  );
}
