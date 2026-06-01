'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Button, Card, CardContent, CardHeader, CardTitle,
  FormField, Label, Input, Alert, AlertTitle, AlertDescription, Badge,
} from '@kanban/ui';
import { Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type Status = {
  configured: boolean;
  source: 'env' | 'database' | 'none';
  masked: string | null;
  envPresent: boolean;
};

export default function SettingsPage() {
  const [status, setStatus] = useState<Status | null>(null);
  const [newKey, setNewKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  async function fetchStatus() {
    const res = await fetch(`${API}/settings`).then((r) => r.json()).catch(() => null);
    setStatus(res);
  }

  async function save() {
    if (!newKey.trim()) return;
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch(`${API}/settings/api-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: newKey.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setFeedback({ type: 'success', message: `Clau desada correctament (${json.masked})` });
      setNewKey('');
      await fetchStatus();
    } catch (err) {
      setFeedback({ type: 'error', message: (err as Error).message });
    } finally {
      setSaving(false);
    }
  }

  async function test() {
    setTesting(true);
    setFeedback(null);
    try {
      const res = await fetch(`${API}/settings/api-key/test`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setFeedback({ type: 'success', message: json.message });
    } catch (err) {
      setFeedback({ type: 'error', message: (err as Error).message });
    } finally {
      setTesting(false);
    }
  }

  async function deleteKey() {
    if (!confirm('Eliminar la clau API desada a la base de dades?')) return;
    setDeleting(true);
    setFeedback(null);
    try {
      await fetch(`${API}/settings/api-key`, { method: 'DELETE' });
      setFeedback({ type: 'success', message: 'Clau eliminada de la base de dades' });
      await fetchStatus();
    } catch {
      setFeedback({ type: 'error', message: 'Error eliminant la clau' });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1>Ajustos</h1>
        <p className="text-muted-foreground text-[13px] mt-1">
          Configura la connexió amb la Claude API d'Anthropic.
        </p>
      </div>

      <Card accent="navy">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>API Key de Claude</CardTitle>
            {status && (
              <div className="flex items-center gap-2">
                {status.configured ? (
                  <CheckCircle2 className="h-4 w-4 text-status-ok" />
                ) : (
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                )}
                <Badge
                  variant={status.configured ? 'success' : 'gray'}
                  size="sm"
                >
                  {status.source === 'env'
                    ? 'Entorn (ENV)'
                    : status.source === 'database'
                      ? 'Base de dades'
                      : 'No configurada'}
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {status?.masked && (
            <div className="flex items-center gap-3 py-2 px-3 bg-gray-bg rounded-[2px]">
              <span className="font-display text-[11px] font-bold uppercase tracking-caps text-muted-foreground">
                Clau activa
              </span>
              <code className="font-mono text-[12px] text-navy">{status.masked}</code>
            </div>
          )}

          {status?.envPresent && (
            <Alert tone="info">
              <AlertDescription>
                <strong>ANTHROPIC_API_KEY</strong> present a l'entorn. S'usa prioritàriament sobre la clau desada a la BD.
              </AlertDescription>
            </Alert>
          )}

          <FormField>
            <Label htmlFor="api-key">Nova API Key</Label>
            <div className="relative flex items-center">
              <Input
                id="api-key"
                type={showKey ? 'text' : 'password'}
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="sk-ant-api03-..."
                className="pr-10"
                onKeyDown={(e) => e.key === 'Enter' && save()}
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-3 text-muted-foreground hover:text-navy transition-colors"
                tabIndex={-1}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </FormField>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant="accent"
              onClick={save}
              loading={saving}
              disabled={!newKey.trim()}
            >
              Desar clau
            </Button>
            <Button
              variant="outline"
              onClick={test}
              loading={testing}
              disabled={!status?.configured}
            >
              Provar connexió
            </Button>
            {status?.source === 'database' && (
              <Button
                variant="danger"
                onClick={deleteKey}
                loading={deleting}
              >
                Eliminar clau
              </Button>
            )}
          </div>

          {feedback && (
            <Alert tone={feedback.type === 'success' ? 'success' : 'danger'}>
              <AlertDescription>{feedback.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Com funciona</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-[13px] text-muted-foreground">
          <p>
            <strong className="text-navy">Prioritat:</strong>{' '}
            si <code className="font-mono text-[11px] bg-gray-bg px-1">ANTHROPIC_API_KEY</code> és present
            a l'entorn, s'usa sempre. La clau de la BD s'usa com a alternativa.
          </p>
          <p>
            <strong className="text-navy">Sense clau:</strong>{' '}
            el mapeig de columnes Excel usa l'heurística local (confiança 0.55).
            La funcionalitat Kanban i les propostes segueixen funcionant.
          </p>
          <p>
            <strong className="text-navy">Assistent IA:</strong>{' '}
            requereix una API key configurada per funcionar.{' '}
            <Link href="/assistant" className="text-navy underline">
              Ves a l'assistent
            </Link>
          </p>
          <p className="text-[11px]">
            Obtén una API key a{' '}
            <span className="font-mono">console.anthropic.com</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
