/* ──────────────────────────────────────────────
   CHATBOT INTERFACE — Asistente financiero IA con RAG
   Basado en skills/chat-ui.jsx + datos reales ADATEC
   ────────────────────────────────────────────── */

window.ChatbotInterface = function ChatbotInterface({ onClose }) {
  const [messages, setMessages] = React.useState([
    { id: 0, role: 'assistant', content: '¡Hola! Soy tu asistente financiero de ADATEC. Puedo ayudarte con:' },
    { id: 1, role: 'options',
      items: [
        '📊 Estado general de la cartera',
        '🔴 Principales deudores',
        '📈 Eficiencia de recaudo',
        '⚠️ Riesgos identificados',
        '📉 Tendencias facturación vs recaudo',
      ]
    },
  ]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const msgEndRef = React.useRef(null);
  const nextId = React.useRef(2);

  React.useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // RAG data embebido
  const RAG = {
    general: 'La cartera de ADATEC tiene un saldo total de $38.374.163.157 distribuido en 89.064 documentos de 2.854 clientes activos con 94 vendedores. La cartera vencida asciende a $35.494.977.007 (92.5% del total). La cartera corriente es de $2.879.186.151. El promedio de días de mora es de 1.038 días. Los 10 principales clientes concentran el 502.2% del saldo total.',
    aging: 'Distribución por antigüedad: Corriente: $2.879M (7.5%), 1-30 días: $1.635M (4.3%), 31-60 días: $1.820M (4.7%), 61-90 días: $1.713M (4.5%), 91-180 días: $6.226M (16.2%), 181-360 días: $9.612M (25.0%), Más de 360 días: $14.488M (37.8%). La mayor concentración está en +360 días.',
    deudores: 'Top 5 deudores: 1. BAHAMON GUALDRON GINA ANDREA: $162.761M (424.1% del total). 2. ELMER ENRIQUE PACHECO POLO: $5.358M (14.0%). 3. ARISTIZABAL GRISALES HECTOR FABIO: $4.618M (12.0%). 4. Sin nombre (991520783001): $4.614M (12.0%). 5. WILSON RODOLFO JAIMES FLOREZ: $3.896M (10.2%). Total clientes con mora >360 días: 2.613.',
    eficiencia: '94 vendedores activos en la cartera. La eficiencia de recaudo varía significativamente: RECAUDOS OF.CENTRAL (42%), MARTHA LILIANA ROJAS (68%), JORGE ANDRES RAMIREZ (55%), ANA MILENA TORRES (72%), CARLOS ARTURO MEJIA (48%). Solo 14 vendedores tienen eficiencia superior al 50%.',
    riesgos: 'Alertas críticas: [CRÍTICO] 92.5% de la cartera está vencida. [CRÍTICO] Mora promedio de 1.038 días. [ALTO] 2.613 clientes con mora mayor a 360 días. [ALTO] Concentración: top 10 clientes = 502.2% del total. [MEDIO] Base de retención total: $235.796M.',
    tendencias: 'La cartera muestra una tendencia de crecimiento sostenido en facturación durante los últimos 12 meses con estabilización en saldos por cobrar. Se recomienda reforzar las estrategias de recaudo para los segmentos de más de 360 días que representan el 37.8% del total.',
  };

  const getRAGResponse = (query) => {
    const q = query.toLowerCase();
    if (q.includes('estado') || q.includes('general') || q.includes('resumen') || q.includes('total') || q.includes('cartera') && !q.includes('aging') && !q.includes('antigüedad'))
      return RAG.general;
    if (q.includes('aging') || q.includes('antigüedad') || q.includes('vencimiento') || q.includes('días') || q.includes('distribución'))
      return RAG.aging;
    if (q.includes('deudor') || q.includes('cliente') || q.includes('principal') || q.includes('top') || q.includes('bahamon'))
      return RAG.deudores;
    if (q.includes('eficiencia') || q.includes('recaudo') || q.includes('vendedor') || q.includes('cobranza'))
      return RAG.eficiencia;
    if (q.includes('riesgo') || q.includes('alerta') || q.includes('crítico') || q.includes('peligro'))
      return RAG.riesgos;
    if (q.includes('tendencia') || q.includes('evolución') || q.includes('histórico') || q.includes('crecimiento'))
      return RAG.tendencias;
    return RAG.general + '\n\n' + RAG.riesgos;
  };

  const sendMessage = (text) => {
    const msg = text || input;
    if (!msg.trim() || loading) return;
    const id = nextId.current++;
    const userMsg = { id, role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      const response = getRAGResponse(msg);
      const id2 = nextId.current++;
      setMessages(prev => [...prev, {
        id: id2, role: 'assistant', content: response,
        source: 'Resúmenes RAG • ADATEC',
      }]);
      setLoading(false);
    }, 600 + Math.random() * 400);
  };

  const handleQuick = (item) => {
    const map = {
      '📊 Estado general de la cartera': '¿Cuál es el estado general de la cartera ADATEC?',
      '🔴 Principales deudores': '¿Quiénes son los principales deudores?',
      '📈 Eficiencia de recaudo': '¿Cuál es la eficiencia de recaudo?',
      '⚠️ Riesgos identificados': '¿Qué riesgos identificas en la cartera?',
      '📉 Tendencias facturación vs recaudo': '¿Cuál es la tendencia de facturación vs recaudo?',
    };
    sendMessage(map[item] || item);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.avatar}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a10 10 0 0 1 10 10c0 5-4 9-10 9S2 17 2 12 7 2 12 2z"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          </div>
          <div>
            <span style={styles.title}>Asistente ADATEC</span>
            <span style={styles.status}>● RAG activo</span>
          </div>
        </div>
        <button onClick={onClose} style={styles.closeBtn} title="Cerrar chatbot">✕</button>
      </div>

      {/* Messages */}
      <div style={styles.messages}>
        {messages.map((msg) => (
          <div key={msg.id}>
            {msg.role === 'user' && (
              <div style={styles.userMsg}>{msg.content}</div>
            )}
            {msg.role === 'assistant' && (
              <div style={styles.assistantMsg}>
                <div style={styles.assistantContent}>{msg.content}</div>
                {msg.source && <div style={styles.source}>{msg.source}</div>}
              </div>
            )}
            {msg.role === 'options' && (
              <div style={styles.optionsWrap}>
                {msg.items.map((item, i) => (
                  <button key={i} style={styles.optionBtn} onClick={() => handleQuick(item)}>
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div style={styles.loadingWrap}>
            <div style={styles.assistantMsg}>
              <span style={styles.thinking}>
                Analizando datos<span style={styles.dots}><span>.</span><span>.</span><span>.</span></span>
              </span>
            </div>
          </div>
        )}
        <div ref={msgEndRef} />
      </div>

      {/* Input */}
      <div style={styles.inputWrap}>
        <input
          style={styles.input}
          placeholder="Pregunta sobre la cartera..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          disabled={loading}
        />
        <button style={{
          ...styles.sendBtn,
          opacity: loading ? 0.4 : 1,
          cursor: loading ? 'not-allowed' : 'pointer',
        }} onClick={() => sendMessage()} disabled={loading}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: '#0f1622',
    borderRadius: 16,
    overflow: 'hidden',
    border: '1px solid rgba(148,163,184,0.08)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 18px',
    borderBottom: '1px solid rgba(148,163,184,0.08)',
    flexShrink: 0,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 10,
    background: 'linear-gradient(135deg, #10b981, #059669)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
  },
  title: {
    fontSize: 13,
    fontWeight: 600,
    color: '#f1f5f9',
    display: 'block',
  },
  status: {
    fontSize: 10,
    color: '#10b981',
    fontFamily: "'JetBrains Mono', ui-monospace, monospace",
  },
  closeBtn: {
    background: 'rgba(148,163,184,0.08)',
    border: 'none',
    color: '#94a3b8',
    width: 28,
    height: 28,
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  userMsg: {
    alignSelf: 'flex-end',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: '#fff',
    padding: '10px 14px',
    borderRadius: '12px 12px 4px 12px',
    fontSize: 13,
    maxWidth: '80%',
    lineHeight: 1.5,
  },
  assistantMsg: {
    alignSelf: 'flex-start',
    background: '#111b2e',
    border: '1px solid rgba(148,163,184,0.08)',
    borderRadius: '12px 12px 12px 4px',
    padding: '10px 14px',
    maxWidth: '85%',
  },
  assistantContent: {
    fontSize: 13,
    color: '#e2e8f0',
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
  },
  source: {
    fontSize: 9,
    color: '#475569',
    marginTop: 6,
    fontFamily: "'JetBrains Mono', ui-monospace, monospace",
  },
  optionsWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  optionBtn: {
    background: 'rgba(16,185,129,0.08)',
    border: '1px solid rgba(16,185,129,0.15)',
    color: '#34d399',
    padding: '7px 12px',
    borderRadius: 8,
    fontSize: 11,
    cursor: 'pointer',
    fontWeight: 500,
    transition: 'all 0.15s',
  },
  loadingWrap: {
    alignSelf: 'flex-start',
  },
  thinking: {
    fontSize: 13,
    color: '#94a3b8',
  },
  dots: {
    display: 'inline-flex',
    gap: 1,
    marginLeft: 2,
  },
  inputWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 14px',
    borderTop: '1px solid rgba(148,163,184,0.08)',
    flexShrink: 0,
  },
  input: {
    flex: 1,
    background: '#111b2e',
    border: '1px solid rgba(148,163,184,0.1)',
    borderRadius: 10,
    padding: '10px 14px',
    color: '#f1f5f9',
    fontSize: 13,
    outline: 'none',
  },
  sendBtn: {
    background: '#10b981',
    border: 'none',
    width: 36,
    height: 36,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    flexShrink: 0,
    transition: 'opacity 0.15s',
  },
};

/* CSS para animación de dots */
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes dotPulse {
    0%, 80%, 100% { opacity: 0.3; transform: translateY(0); }
    40% { opacity: 1; transform: translateY(-2px); }
  }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
`;
document.head.appendChild(styleSheet);
