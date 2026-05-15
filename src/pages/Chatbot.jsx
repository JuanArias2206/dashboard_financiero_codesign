import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Send, ArrowLeft, Zap, MessageSquare, Wand2,
  Bot, User, AlertCircle, Loader2, Download,
} from 'lucide-react';
import { api } from '../lib/api';

const SUGGESTIONS = [
  { title: '¿Cuál es el saldo total de cartera?', hint: 'KPIs principales' },
  { title: 'Top 5 vendedores con mayor mora', hint: 'Análisis por usuario' },
  { title: 'Distribución de cartera por edad', hint: 'Aging' },
  { title: 'Clientes con mayor saldo pendiente', hint: 'Top clientes' },
];

export default function Chatbot({ user }) {
  const [msgs, setMsgs] = useState([
    {
      role: 'assistant',
      content: '¡Hola! Soy tu asistente financiero. Puedo responder preguntas sobre la cartera, gestiones comerciales, ventas e inventario. ¿En qué te puedo ayudar?',
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const streamRef = useRef(null);
  const taRef = useRef(null);

  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.scrollTop = streamRef.current.scrollHeight;
    }
  }, [msgs]);

  useEffect(() => {
    if (!taRef.current) return;
    taRef.current.style.height = 'auto';
    taRef.current.style.height = Math.min(taRef.current.scrollHeight, 160) + 'px';
  }, [input]);

  const send = useCallback(async (text) => {
    const content = (text ?? input).trim();
    if (!content || sending) return;
    setError('');
    setInput('');
    const next = [...msgs, { role: 'user', content }];
    setMsgs(next);
    setSending(true);
    try {
      const res = await api.chat(content, next);
      setMsgs((m) => [...m, { role: 'assistant', content: res?.reply || res?.message || '…' }]);
    } catch (e) {
      setError(e.message || 'No se pudo enviar el mensaje');
      setMsgs((m) => m.slice(0, -1));
      setInput(content);
    } finally {
      setSending(false);
    }
  }, [input, msgs, sending]);

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="chat-shell">
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 16, padding: '16px 24px',
        borderBottom: '1px solid var(--wv-border)',
        background: 'rgba(18,18,18,0.85)',
        backdropFilter: 'blur(14px)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link to="/" className="wv-icon-btn" aria-label="Volver al dashboard">
            <ArrowLeft size={16} />
          </Link>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--wv-accent), var(--wv-accent-strong))',
            display: 'grid', placeItems: 'center', color: '#001318',
            boxShadow: '0 4px 16px rgba(0,229,255,0.35)',
          }}>
            <Zap size={18} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>WattVision Assistant</div>
            <div style={{ fontSize: 12, color: 'var(--wv-text-muted)', display: 'flex', gap: 6, alignItems: 'center' }}>
              <span className="wv-badge live" style={{ padding: '2px 8px', fontSize: 10 }}>EN VIVO</span>
              Conectado a datos de ADATEC
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="wv-btn ghost" title="Exportar conversación">
            <Download size={14} />
            Exportar
          </button>
        </div>
      </header>

      <div className="chat-stream" ref={streamRef}>
        <div className="chat-stream-inner">
          {msgs.length === 1 && (
            <div style={{ padding: '40px 0 8px', textAlign: 'center' }}>
              <div style={{
                width: 60, height: 60, borderRadius: 16,
                background: 'var(--wv-accent-dim)',
                color: 'var(--wv-accent)',
                display: 'inline-grid', placeItems: 'center',
                marginBottom: 14,
              }}>
                <Wand2 size={26} />
              </div>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>¿En qué puedo ayudarte?</h2>
              <p style={{ color: 'var(--wv-text-muted)', fontSize: 14, marginTop: 8 }}>
                Pregunta sobre tu cartera, ventas, gestiones o inventario.
              </p>

              <div className="chat-suggestions">
                {SUGGESTIONS.map((s) => (
                  <button key={s.title} className="chat-suggestion" onClick={() => send(s.title)}>
                    {s.title}
                    <span className="chat-suggestion-hint">{s.hint}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {msgs.map((m, i) => (
            <div key={i} className={`chat-msg ${m.role}`}>
              <div className="chat-avatar">
                {m.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
              </div>
              <div className="chat-bubble">{m.content}</div>
            </div>
          ))}

          {sending && (
            <div className="chat-msg assistant">
              <div className="chat-avatar"><Bot size={16} /></div>
              <div className="chat-bubble" style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                <Loader2 size={14} className="wv-spinner" />
                Pensando…
              </div>
            </div>
          )}

          {error && (
            <div className="wv-alert" style={{ maxWidth: 820, margin: '0 auto' }}>
              <AlertCircle size={16} />
              <div className="wv-alert-body">
                <div className="wv-alert-title">Error al enviar</div>
                <div style={{ fontSize: 13 }}>{error}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="chat-input-area">
        <div className="chat-input-shell">
          <textarea
            ref={taRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            rows={1}
            placeholder="Pregunta sobre tus datos financieros…"
            aria-label="Mensaje"
            disabled={sending}
          />
          <button
            className="chat-send-btn"
            onClick={() => send()}
            disabled={sending || !input.trim()}
            aria-label="Enviar mensaje"
          >
            {sending ? <Loader2 size={16} className="wv-spinner" /> : <Send size={16} />}
          </button>
        </div>
        <div style={{
          maxWidth: 820, margin: '8px auto 0',
          fontSize: 11, color: 'var(--wv-text-dim)', textAlign: 'center',
        }}>
          WattVision Assistant puede cometer errores. Verifica información crítica con la fuente original.
        </div>
      </div>
    </div>
  );
}
