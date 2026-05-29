'use client';

import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function UploadPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setResult(null);
    const res = await fetch(`${API}/imports/upload`, { method: 'POST', body: formData });
    const json = await res.json();
    setResult(json);
    setLoading(false);
  }

  return (
    <div>
      <h1>Upload Excel</h1>
      <div className="card">
        <form action={onSubmit}>
          <div className="grid">
            <div><label>Excel file</label><input name="file" type="file" accept=".xls,.xlsx" required /></div>
            <div><label>Sheet name (optional)</label><input name="sheetName" placeholder="First sheet by default" /></div>
            <div><label>Period start</label><input name="periodStart" type="date" /></div>
            <div><label>Period end</label><input name="periodEnd" type="date" /></div>
            <div><label>Period working days</label><input name="periodWorkingDays" type="number" placeholder="367" /></div>
            <div><label>Working days per year</label><input name="workingDaysPerYear" type="number" defaultValue="220" /></div>
          </div>
          <p className="small">Claude is used to infer the Excel column mapping. The Kanban calculation is deterministic.</p>
          <button type="submit" disabled={loading}>{loading ? 'Importing...' : 'Upload and synchronize'}</button>
        </form>
      </div>
      {result && <pre className="card">{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}
