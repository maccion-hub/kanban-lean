'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Button, Alert, AlertTitle, AlertDescription, Badge, Card } from '@kanban/ui';
import { Send, Bot, User, Zap } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type Message = { role: 'user' | 'assistant'; content: string; cached?: boolean };

const SUGGESTED_QUESTIONS = [
  'Quants articles hi ha en total?',
  'Quin és el top 5 articles per valor Kmax?',
  'Quins articles necessiten validació manual?',
  'Quin és el valor total d\'estoc a Kmax?',
  'Explica\'m els paràmetres de configuració actuals',
  'Hi ha articles amb cost zero?',
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function send(question?: string) {
    const text = (question ?? input).trim();
    if (!text || loading) return;

    const userMsg: Message = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API}/assistant/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Error en la resposta');
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: json.answer, cached: json.cached },
      ]);
    } catch (err) {
      setError((err as Error).message);
      setMessages((prev) => prev.slice(0, -1)); // remove the user msg if failed
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-3xl mx-auto space-y-0">
      {/* Header */}
      <div className="pb-4 flex-none">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-[2px] bg-navy text-white">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h1 className="leading-none">Assistent Kanban IA</h1>
            <p className="text-muted-foreground text-[12px] mt-0.5">
              Claude Haiku · Accés a propostes, articles i configuració
            </p>
          </div>
        </div>
      </div>

      {/* Suggested questions — only when no messages */}
      {messages.length === 0 && !loading && (
        <div className="pb-4 flex-none">
          <p className="font-display text-[11px] font-bold uppercase tracking-caps text-muted-foreground mb-2">
            Suggeriments
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="inline-flex items-center gap-1 rounded-[2px] border border-navy/24 bg-card px-2.5 py-1 text-[12px] font-semibold text-navy hover:bg-navy hover:text-white transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-3 pb-2">
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 text-muted-foreground">
            <Bot className="h-10 w-10 opacity-20" />
            <p className="text-[13px]">
              Pregunta'm sobre els articles, propostes o configuració del teu sistema Kanban.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="h-7 w-7 rounded-[2px] bg-navy text-white flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="h-4 w-4" />
              </div>
            )}
            <div
              className={[
                'max-w-[85%] rounded-[2px] px-3.5 py-2.5 text-[13px] leading-relaxed',
                msg.role === 'user'
                  ? 'bg-navy text-white'
                  : 'bg-card border border-border/30 text-foreground',
              ].join(' ')}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              {msg.role === 'assistant' && msg.cached && (
                <div className="flex items-center gap-1 mt-1.5">
                  <Zap className="h-3 w-3 text-green-dark" />
                  <span className="text-[10px] text-muted-foreground">cache</span>
                </div>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="h-7 w-7 rounded-[2px] bg-green text-white flex items-center justify-center shrink-0 mt-0.5">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="h-7 w-7 rounded-[2px] bg-navy text-white flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4" />
            </div>
            <div className="bg-card border border-border/30 rounded-[2px] px-3.5 py-2.5">
              <div className="flex gap-1 items-center h-5">
                <span className="h-2 w-2 rounded-full bg-navy/40 animate-bounce [animation-delay:0ms]" />
                <span className="h-2 w-2 rounded-full bg-navy/40 animate-bounce [animation-delay:150ms]" />
                <span className="h-2 w-2 rounded-full bg-navy/40 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        {error && (
          <Alert tone={error.includes('API key') ? 'warn' : 'danger'}>
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
              {error.includes('API key') && (
                <span>
                  {' '}
                  <Link href="/settings" className="underline font-semibold">
                    Configura-la a Ajustos
                  </Link>
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="flex-none pt-3 border-t border-border/30">
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escriu la teva pregunta… (Enter per enviar, Shift+Enter per nova línia)"
            rows={2}
            className="flex-1 rounded-[2px] border border-navy/24 bg-card px-3 py-2.5 text-[14px] text-foreground resize-none focus:outline-none focus:border-navy focus:ring-[3px] focus:ring-navy/12 placeholder:text-muted-foreground/70"
            disabled={loading}
          />
          <Button
            variant="accent"
            size="icon"
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="h-[60px] w-10 shrink-0"
            aria-label="Enviar"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1.5">
          Les preguntes de seguiment mantenen el context de la conversa.
          {messages.length > 0 && (
            <button
              onClick={() => { setMessages([]); setError(null); }}
              className="ml-2 underline hover:text-navy"
            >
              Nova conversa
            </button>
          )}
        </p>
      </div>
    </div>
  );
}
