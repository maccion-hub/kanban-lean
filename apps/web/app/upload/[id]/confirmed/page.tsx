import Link from 'next/link';
import { Alert, AlertTitle, AlertDescription, Button } from '@kanban/ui';

export default async function ConfirmedPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ imported?: string }>;
}) {
  const { id } = await params;
  const { imported } = await searchParams;

  return (
    <div className="space-y-6">
      <h1>Importació completada</h1>

      <Alert tone="success">
        <AlertTitle>
          {imported ? `${imported} articles sincronitzats correctament` : 'Importació completada'}
        </AlertTitle>
        <AlertDescription>
          ID d'import: <span className="font-mono text-[12px]">{id}</span>
        </AlertDescription>
      </Alert>

      <div className="flex gap-3">
        <Button asChild variant="accent">
          <Link href="/articles">Veure articles</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/kanban">Generar proposta Kanban</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/upload">Nova importació</Link>
        </Button>
      </div>
    </div>
  );
}
