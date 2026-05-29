import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default async function ProposalsPage() {
  const proposals = await fetch(`${API}/kanban/proposals`, { cache: 'no-store' }).then(r => r.json()).catch(() => []);
  return (
    <div>
      <h1>Kanban proposal versions</h1>
      <div className="card">
        <table>
          <thead><tr><th>Version</th><th>Name</th><th>Date</th><th>Items</th><th>Value Kmax</th><th></th></tr></thead>
          <tbody>
            {proposals.map((p: any) => (
              <tr key={p.id}>
                <td>{p.versionNumber}</td>
                <td>{p.name}</td>
                <td>{new Date(p.createdAt).toLocaleString()}</td>
                <td>{p.summaryJson?.itemCount}</td>
                <td>{p.summaryJson?.totalValueAtKmax} EUR</td>
                <td><Link href={`/proposals/${p.id}`}>Open</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
