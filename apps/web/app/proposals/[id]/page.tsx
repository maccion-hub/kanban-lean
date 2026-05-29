const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default async function ProposalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const proposal = await fetch(`${API}/kanban/proposals/${id}`, { cache: 'no-store' }).then(r => r.json());
  return (
    <div>
      <h1>{proposal.name}</h1>
      <div className="grid">
        <div className="card"><div className="kpi">v{proposal.versionNumber}</div><div>Version</div></div>
        <div className="card"><div className="kpi">{proposal.summaryJson?.itemCount}</div><div>Articles</div></div>
        <div className="card"><div className="kpi">{proposal.summaryJson?.totalValueAtKmax} EUR</div><div>Total Kmax value</div></div>
      </div>
      <div className="card">
        <table>
          <thead><tr><th>Code</th><th>Description</th><th>Cost</th><th>Avg/day</th><th>Kmin</th><th>Klot</th><th>Kmax</th><th>Value Kmax</th><th>Control</th></tr></thead>
          <tbody>
            {proposal.items?.map((i: any) => (
              <tr key={i.id}>
                <td>{i.code}</td>
                <td>{i.description}</td>
                <td>{i.unitCost}</td>
                <td>{i.avgDailyDemand}</td>
                <td>{i.kmin}</td>
                <td>{i.klot}</td>
                <td>{i.kmax}</td>
                <td>{i.valueAtKmax}</td>
                <td>{i.controlType}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
