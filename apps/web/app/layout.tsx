import './globals.css';
import NavBar from '../components/nav-bar';

export const metadata = {
  title: 'Kanban Lean — SABEMSA',
  description: 'Plataforma de dimensionament Kanban Lean per a manteniment industrial',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ca">
      <body>
        <header className="bg-navy sticky top-0 z-40 shadow-sm">
          <div className="accent-bar" />
          <NavBar />
        </header>
        <main className="mx-auto max-w-[1180px] px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
