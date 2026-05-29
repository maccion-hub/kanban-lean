import Link from 'next/link';
import './style.css';

export const metadata = {
  title: 'Lean Kanban App',
  description: 'Kanban sizing for low-cost high-rotation articles',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="nav">
          <Link href="/">Dashboard</Link>
          <Link href="/upload">Upload Excel</Link>
          <Link href="/config">Configuration</Link>
          <Link href="/kanban">Generate Kanban</Link>
          <Link href="/proposals">Versions</Link>
        </nav>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
