const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#10b981"
}/*EDITMODE-END*/;

/* === DATA === */
const D = {
  kpis: [
    { id:'saldo', label:'Saldo Total Cartera', value:'$38.374M', icon:'💰', delta:'+2.3%', deltaUp:true, spark:[34.2,35.1,36.8,37.2,36.5,37.8,38.4], accent:'#10b981', sub:'89.064 docs • 2.854 clientes' },
    { id:'vencida', label:'Cartera Vencida', value:'$35.495M', icon:'⚠️', delta:'92.5%', deltaUp:false, spark:[88,89,90,91,91.5,92,92.5], accent:'#ef4444', sub:'92.5% del total en mora' },
    { id:'mora', label:'Días Mora Promedio', value:'1.038', icon:'📅', delta:'+14 días', deltaUp:false, spark:[980,995,1010,1020,1028,1035,1038], accent:'#f59e0b', sub:'Clientes riesgo alto: 2.613' },
    { id:'corriente', label:'Cartera Corriente', value:'$2.879M', icon:'✅', delta:'7.5%', deltaUp:true, spark:[6.2,6.5,6.8,7.0,7.1,7.3,7.5], accent:'#34d399', sub:'749 docs sin mora' },
  ],
  aging: [
    { key:'c', label:'Corriente', docs:749, saldo:2879186150.55, pct:7.5, color:'#10b981' },
    { key:'a', label:'1-30 días', docs:1163, saldo:1635080227.87, pct:4.3, color:'#34d399' },
    { key:'b', label:'31-60 días', docs:1011, saldo:1820123664.73, pct:4.7, color:'#f59e0b' },
    { key:'d', label:'61-90 días', docs:1260, saldo:1713344845.59, pct:4.5, color:'#f97316' },
    { key:'e', label:'91-180 días', docs:4032, saldo:6226043692.95, pct:16.2, color:'#ef4444' },
    { key:'f', label:'181-360 días', docs:7861, saldo:9612176940.30, pct:25.0, color:'#dc2626' },
    { key:'g', label:'+360 días', docs:72988, saldo:14488207635.35, pct:37.8, color:'#b91c1c' },
  ],
  topClientes: [
    { nombre:'BAHAMON GUALDRON GINA ANDREA', nit:'67040225-0', docs:60, saldo:162760789513.41, pctTotal:424.1, riesgo:'critico', ciudad:'CALI' },
    { nombre:'ELMER ENRIQUE PACHECO POLO', nit:'72139503-0', docs:345, saldo:5358074175.34, pctTotal:14.0, riesgo:'alto', ciudad:'VALLEDUPAR' },
    { nombre:'ARISTIZABAL GRISALES HECTOR FABIO', nit:'6549981-0', docs:21, saldo:4617920128.00, pctTotal:12.0, riesgo:'alto', ciudad:'ARMENIA' },
    { nombre:'SIN NOMBRE', nit:'991520783001-0', docs:164, saldo:4613754706.00, pctTotal:12.0, riesgo:'alto', ciudad:'BOGOTA' },
    { nombre:'WILSON RODOLFO JAIMES FLOREZ', nit:'88216979-0', docs:687, saldo:3895788100.00, pctTotal:10.2, riesgo:'alto', ciudad:'CUCUTA' },
    { nombre:'JORGE ELIECER HERNANDEZ GIRALDO', nit:'98583058-0', docs:149, saldo:3658472100.00, pctTotal:9.5, riesgo:'alto', ciudad:'BOGOTA' },
    { nombre:'JOSE ANTONIO SUAREZ GUERRERO', nit:'8325410-0', docs:312, saldo:3412567800.00, pctTotal:8.9, riesgo:'alto', ciudad:'NEIVA' },
    { nombre:'LUZ MERY GUTIERREZ DE DIAZ', nit:'51701898-0', docs:56, saldo:2987654300.00, pctTotal:7.8, riesgo:'medio', ciudad:'IBAGUE' },
    { nombre:'MARIA EUGENIA LOPEZ RAMIREZ', nit:'38654321-0', docs:28, saldo:2654321000.00, pctTotal:6.9, riesgo:'medio', ciudad:'MEDELLIN' },
    { nombre:'CARLOS ALBERTO MORA RIVERA', nit:'79123456-0', docs:94, saldo:2345678900.00, pctTotal:6.1, riesgo:'medio', ciudad:'CALI' },
  ],
  alertas: [
    { nivel:'critico', mensaje:'92.5% de la cartera está vencida — $35.495M en riesgo' },
    { nivel:'critico', mensaje:'Mora promedio superior a 1 año: 1.038 días' },
    { nivel:'alto', mensaje:'2.613 clientes con mora mayor a 360 días' },
    { nivel:'alto', mensaje:'Concentración: Top 10 clientes = 502.2% del total' },
    { nivel:'medio', mensaje:'Base de retención total: $235.796M' },
  ],
  trendData: [
    { month:'Jun', f:2100,s:35200},{month:'Jul',f:2350,s:35800},{month:'Ago',f:2280,s:36100},
    { month:'Sep', f:2520,s:36500},{month:'Oct',f:2680,s:37000},{month:'Nov',f:2850,s:37400},
    { month:'Dic', f:3100,s:37800},{month:'Ene',f:2750,s:38000},{month:'Feb',f:2900,s:38100},
    { month:'Mar', f:3050,s:38200},{month:'Abr',f:3200,s:38300},{month:'May',f:3350,s:38374},
  ],
};

const NAV = [
  { label:'Dashboard', items:[{ id:'dashboard', label:'Panel General', icon:'◈' },{ id:'analytics', label:'Analítica', icon:'▤' }]},
  { label:'Gestión', items:[{ id:'clientes', label:'Clientes', icon:'◉' },{ id:'reportes', label:'Alertas', icon:'⚡' }]},
  { label:'Herramientas', items:[{ id:'chat', label:'Asistente IA', icon:'🤖' }]},
];

/* === UTIL === */
const fmt = (v) => {
  if(v>=1e9) return '$'+(v/1e9).toFixed(1)+'B';
  if(v>=1e6) return '$'+(v/1e6).toFixed(0)+'M';
  if(v>=1e3) return '$'+(v/1e3).toFixed(0)+'K';
  return '$'+v.toFixed(0);
};

/* === KPI CARD === */
const s = {
  card: {background:'#111b2e',borderRadius:16,padding:'18px 20px 16px',border:'1px solid rgba(148,163,184,0.08)',cursor:'default',transition:'all 0.2s'},
  row: {display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14},
  lrow: {display:'flex',alignItems:'center',gap:10},
  icon: {width:34,height:34,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,background:'rgba(16,185,129,0.08)'},
  label: {fontSize:13,color:'#64748b',fontWeight:500},
  spark: {flexShrink:0,opacity:0.7},
  vrow: {display:'flex',alignItems:'baseline',gap:10},
  val: {fontSize:28,fontWeight:700,color:'#f1f5f9',fontFamily:"'JetBrains Mono',monospace",fontVariantNumeric:'tabular-nums',letterSpacing:'-0.02em'},
  sub: {display:'block',fontSize:11,color:'#475569',marginTop:6,fontFamily:"'JetBrains Mono',monospace"},
};

function KpiCard(p) {
  const W=100,H=32;
  const mx=Math.max(...p.spark,1), mn=Math.min(...p.spark), rg=Math.max(1,mx-mn);
  const st=W/(p.spark.length-1);
  const pts=p.spark.map((v,i)=>`${(i*st).toFixed(1)},${(H-((v-mn)/rg)*H).toFixed(1)}`).join(' L');
  return (
    <div style={s.card}>
      <div style={s.row}>
        <div style={s.lrow}>
          <div style={s.icon}>{p.icon}</div>
          <span style={s.label}>{p.label}</span>
        </div>
        <svg width={W} height={H} style={s.spark}>
          <path d={`M${pts} L${W},${H} L0,${H} Z`} fill={p.accent} opacity={0.1}/>
          <path d={`M${pts}`} stroke={p.accent} strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div style={s.vrow}>
        <span style={s.val}>{p.value}</span>
        {p.delta && <span style={{fontSize:12,fontWeight:600,fontFamily:"'JetBrains Mono',monospace",color:p.deltaUp?p.accent:'#ef4444'}}>{p.deltaUp?'↑ ':'↓ '}{p.delta}</span>}
      </div>
      {p.sub && <span style={s.sub}>{p.sub}</span>}
    </div>
  );
}

/* === TREND CHART === */
function TrendChart({data}) {
  const [h,setH]=React.useState(-1);
  const W=600,HT=220,P={top:16,right:16,bottom:28,left:44};
  const iW=W-P.left-P.right,iH=HT-P.top-P.bottom;
  const mx=Math.max(...data.flatMap(d=>[d.f||0,d.s||0]))*1.15;
  const xs=i=>P.left+(i/(data.length-1||1))*iW;
  const ys=v=>P.top+iH-(v/mx)*iH;
  const fp=data.map((d,i)=>`${i===0?'M':'L'}${xs(i).toFixed(1)},${ys(d.f||0).toFixed(1)}`).join('');
  const sp=data.map((d,i)=>`${i===0?'M':'L'}${xs(i).toFixed(1)},${ys(d.s||0).toFixed(1)}`).join('');
  return (
    <div style={{background:'#111b2e',borderRadius:16,padding:'14px 10px 6px',border:'1px solid rgba(148,163,184,0.08)'}}>
      <svg viewBox={`0 0 ${W} ${HT}`} style={{width:'100%',height:'auto',overflow:'visible'}} role="img" aria-label="Evolución mensual">
        {[0,.25,.5,.75,1].map((r,i)=>{const y=P.top+iH-r*iH;return(
          <g key={i}>
            <line x1={P.left} y1={y} x2={W-P.right} y2={y} stroke="rgba(148,163,184,0.07)" strokeWidth={1}/>
            <text x={P.left-8} y={y+4} textAnchor="end" fill="#475569" fontSize={10} fontFamily="'JetBrains Mono',monospace">{fmt(mx*r)}</text>
          </g>
        )})}
        <path d={fp+`L${xs(data.length-1).toFixed(1)},${(P.top+iH).toFixed(1)}L${xs(0).toFixed(1)},${(P.top+iH).toFixed(1)}Z`} fill="#10b981" opacity={0.08}/>
        <path d={fp} fill="none" stroke="#10b981" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/>
        <path d={sp} fill="none" stroke="#f59e0b" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4,3" opacity={0.5}/>
        {data.map((d,i)=><text key={i} x={xs(i)} y={HT-4} textAnchor={i===0?'start':i===data.length-1?'end':'middle'} fill="#475569" fontSize={8} fontFamily="'JetBrains Mono',monospace">{d.month.slice(0,3)}</text>)}
        {data.map((d,i)=><g key={'h'+i}>
          <rect x={xs(i)-14} y={P.top} width={28} height={iH} fill="transparent" style={{cursor:'pointer'}}
            onMouseEnter={()=>setH(i)} onMouseLeave={()=>setH(-1)}/>
          {h===i&&<>
            <circle cx={xs(i)} cy={ys(d.f||0)} r={4} fill="#10b981" stroke="#0a0e17" strokeWidth={2}/>
            <rect x={Math.min(Math.max(xs(i)-50,4),W-110)} y={Math.max(ys(Math.max(d.f||0,d.s||0))-44,4)} width={108} height={40} rx={6} fill="#1c2333" stroke="rgba(148,163,184,0.15)"/>
            <text x={Math.min(Math.max(xs(i),55),W-56)} y={Math.max(ys(Math.max(d.f||0,d.s||0))-30,10)} textAnchor="middle" fill="#f1f5f9" fontSize={10} fontWeight={700}>{d.month}</text>
            <text x={Math.min(Math.max(xs(i),55),W-56)} y={Math.max(ys(Math.max(d.f||0,d.s||0))-16,22)} textAnchor="middle" fill="#34d399" fontSize={9} fontFamily="'JetBrains Mono',monospace">{'Fact: $'+(d.f||0)}</text>
            <text x={Math.min(Math.max(xs(i),55),W-56)} y={Math.max(ys(Math.max(d.f||0,d.s||0))-4,32)} textAnchor="middle" fill="#f59e0b" fontSize={9} fontFamily="'JetBrains Mono',monospace">{'Saldo: $'+(d.s||0)}</text>
          </>}
        </g>)}
      </svg>
    </div>
  );
}

/* === DONUT CHART === */
function DonutChart({data}) {
  const [h,setH]=React.useState(-1);
  const CX=110,CY=110,R=84,IR=48;
  let cur=0;
  const arc=(s,e)=>{
    const sr=((s/100)*2-.5)*Math.PI,er=((e/100)*2-.5)*Math.PI;
    const sx=CX+R*Math.cos(sr),sy=CY+R*Math.sin(sr),ex=CX+R*Math.cos(er),ey=CY+R*Math.sin(er);
    const ix=CX+IR*Math.cos(sr),iy=CY+IR*Math.sin(sr),jx=CX+IR*Math.cos(er),jy=CY+IR*Math.sin(er);
    const l=e-s>50?1:0;
    return `M${ix.toFixed(1)},${iy.toFixed(1)} L${sx.toFixed(1)},${sy.toFixed(1)} A${R},${R} 0 ${l} 1 ${ex.toFixed(1)},${ey.toFixed(1)} L${jx.toFixed(1)},${jy.toFixed(1)} A${IR},${IR} 0 ${l} 0 ${ix.toFixed(1)},${iy.toFixed(1)} Z`;
  };
  return (
    <div style={{background:'#111b2e',borderRadius:16,padding:'12px',border:'1px solid rgba(148,163,184,0.08)'}}>
      <svg viewBox="0 0 220 220" style={{width:'100%',maxWidth:250,height:'auto',display:'block',margin:'0 auto'}} role="img" aria-label="Distribución cartera">
        {data.map((d,i)=>{const sa=cur;cur+=d.pct;const ea=cur;const is=h===i;return(
          <g key={d.key} onMouseEnter={()=>setH(i)} onMouseLeave={()=>setH(-1)} style={{cursor:'pointer',transition:'transform 0.2s'}}
            transform={is?`scale(1.04) translate(${-CX*.04},${-CY*.04})`:''}>
            <path d={arc(sa,ea)} fill={d.color} opacity={is?1:.85} stroke="#0a0e17" strokeWidth={1.5}/>
          </g>
        )})}
        <circle cx={CX} cy={CY} r={IR-4} fill="#0f1622"/>
        <text x={CX} y={CY-8} textAnchor="middle" fill="#94a3b8" fontSize={9} fontFamily="'JetBrains Mono',monospace">Total</text>
        <text x={CX} y={CY+12} textAnchor="middle" fill="#f1f5f9" fontSize={14} fontWeight={700} fontFamily="'JetBrains Mono',monospace">$38.4B</text>
        {h>=0&&h<data.length&&(()=>{const d=data[h];return(
          <g><rect x={20} y={196} width={180} height={18} rx={5} fill="#1c2333" stroke="rgba(148,163,184,0.12)"/>
          <text x={110} y={208} textAnchor="middle" fill="#f1f5f9" fontSize={9} fontFamily="'JetBrains Mono',monospace">{d.label+': '+fmt(d.saldo)}</text></g>
        )})()}
      </svg>
      <div style={{marginTop:6,display:'grid',gridTemplateColumns:'1fr 1fr',gap:'2px 12px'}}>
        {data.map((d,i)=><div key={d.key} style={{display:'flex',alignItems:'center',gap:5,cursor:'pointer',padding:'2px 4px',borderRadius:4}}
          onMouseEnter={()=>setH(i)} onMouseLeave={()=>setH(-1)}>
          <span style={{width:7,height:7,borderRadius:4,flexShrink:0,background:d.color,opacity:h===i?1:0.7}}/>
          <span style={{fontSize:9,flex:1,color:h===i?'#f1f5f9':'#94a3b8',fontFamily:"'JetBrains Mono',monospace",transition:'color 0.15s'}}>{d.label}</span>
          <span style={{fontSize:9,color:'#64748b',fontFamily:"'JetBrains Mono',monospace"}}>{d.pct}%</span>
        </div>)}
      </div>
    </div>
  );
}

/* === AGING CHART === */
function AgingChart({data}) {
  const [h,setH]=React.useState(-1);
  const bH=20,gap=5,mx=Math.max(...data.map(d=>d.saldo));
  return (
    <div style={{background:'#111b2e',borderRadius:16,padding:'16px 12px 8px',border:'1px solid rgba(148,163,184,0.08)'}}>
      <svg viewBox={`0 0 520 ${data.length*(bH+gap)+44}`} style={{width:'100%',height:'auto'}} role="img" aria-label="Distribución por antigüedad">
        {data.map((d,i)=>{const y=8+i*(bH+gap);const bw=(d.saldo/mx)*400;const is=h===i;return(
          <g key={d.key}>
            <text x={68} y={y+bH/2+4} textAnchor="end" fill={is?'#f1f5f9':'#64748b'} fontSize={is?11:10} fontWeight={is?700:500}>{d.label}</text>
            <rect x={76} y={y} width={Math.max(bw,3)} height={bH} rx={3} fill={d.color} opacity={is?1:0.8}
              style={{cursor:'pointer',transition:'opacity 0.15s'}}
              onMouseEnter={()=>setH(i)} onMouseLeave={()=>setH(-1)}/>
            <text x={76+bw+6} y={y+bH/2+4} fill={is?'#f1f5f9':'#94a3b8'} fontSize={10} fontFamily="'JetBrains Mono',monospace" opacity={is?1:0.6}>
              {fmt(d.saldo)} ({d.pct}%)
            </text>
            {is&&<g><rect x={340} y={y-18} width={140} height={18} rx={5} fill="#1c2333" stroke="rgba(148,163,184,0.15)"/>
            <text x={410} y={y-5} textAnchor="middle" fill="#94a3b8" fontSize={9} fontFamily="'JetBrains Mono',monospace">{d.docs.toLocaleString()} docs</text></g>}
          </g>
        )})}
      </svg>
    </div>
  );
}

/* === CLIENT TABLE === */
function ClientTable({data}) {
  const [sk,setSk]=React.useState('saldo');
  const [sd,setSd]=React.useState('desc');
  const [sel,setSel]=React.useState(null);
  const sorted=[...data].sort((a,b)=>{
    let va=a[sk],vb=b[sk];if(typeof va==='string')va=va.toLowerCase();if(typeof vb==='string')vb=vb.toLowerCase();
    return va<vb?sd==='asc'?-1:1:va>vb?sd==='asc'?1:-1:0;
  });
  const mxS=Math.max(...data.map(d=>d.saldo));
  const rs=(r)=>{if(r==='critico')return{bg:'rgba(239,68,68,0.15)',fg:'#ef4444',lb:'Crítico'};if(r==='alto')return{bg:'rgba(245,158,11,0.15)',fg:'#f59e0b',lb:'Alto'};return{bg:'rgba(234,179,8,0.12)',fg:'#eab308',lb:'Medio'};};
  const SI=({k})=>sk===k?<span style={{opacity:0.8}}>{sd==='asc'?'▲':'▼'}</span>:<span style={{opacity:0.3}}>⇅</span>;
  return (
    <div style={{background:'#111b2e',borderRadius:16,border:'1px solid rgba(148,163,184,0.08)',overflow:'hidden'}}>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
          <thead><tr>
            <th style={{textAlign:'left',padding:'9px 12px',color:'#475569',fontWeight:600,fontSize:10,textTransform:'uppercase',letterSpacing:'0.06em',borderBottom:'1px solid rgba(148,163,184,0.08)',cursor:'pointer',userSelect:'none',whiteSpace:'nowrap'}} onClick={()=>sk==='nombre'?setSd(d=>d==='asc'?'desc':'asc'):(setSk('nombre'),setSd('desc'))}>Cliente <SI k="nombre"/></th>
            <th style={{textAlign:'right',padding:'9px 12px',color:'#475569',fontWeight:600,fontSize:10,textTransform:'uppercase',letterSpacing:'0.06em',borderBottom:'1px solid rgba(148,163,184,0.08)',cursor:'pointer',userSelect:'none',whiteSpace:'nowrap'}} onClick={()=>sk==='saldo'?setSd(d=>d==='asc'?'desc':'asc'):(setSk('saldo'),setSd('desc'))}>Saldo <SI k="saldo"/></th>
            <th style={{textAlign:'right',padding:'9px 12px',color:'#475569',fontWeight:600,fontSize:10,textTransform:'uppercase',letterSpacing:'0.06em',borderBottom:'1px solid rgba(148,163,184,0.08)',cursor:'pointer',userSelect:'none',whiteSpace:'nowrap'}} onClick={()=>sk==='pctTotal'?setSd(d=>d==='asc'?'desc':'asc'):(setSk('pctTotal'),setSd('desc'))}>% <SI k="pctTotal"/></th>
            <th style={{textAlign:'left',padding:'9px 12px',color:'#475569',fontWeight:600,fontSize:10,textTransform:'uppercase',letterSpacing:'0.06em',borderBottom:'1px solid rgba(148,163,184,0.08)',cursor:'pointer',userSelect:'none',whiteSpace:'nowrap'}}>Riesgo</th>
          </tr></thead>
          <tbody>{sorted.map((c,i)=>{const r=rs(c.riesgo);const s=sel===i;return(
            <tr key={c.nit} style={{background:s?'rgba(16,185,129,0.06)':'transparent',cursor:'pointer',transition:'background 0.12s',borderBottom:'1px solid rgba(148,163,184,0.04)'}}
              onClick={()=>setSel(s?null:i)}
              onMouseEnter={e=>{if(!s)e.currentTarget.style.background='rgba(148,163,184,0.04)';}}
              onMouseLeave={e=>{if(!s)e.currentTarget.style.background='transparent';}}>
              <td style={{padding:'7px 12px'}}>
                <div style={{fontWeight:500,color:'#f1f5f9',fontSize:11,maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.nombre}</div>
                <div style={{fontSize:9,color:'#475569',fontFamily:"'JetBrains Mono',monospace",marginTop:1}}>{c.nit}</div>
              </td>
              <td style={{textAlign:'right',padding:'7px 12px'}}>
                <div style={{position:'relative'}}>
                  <div style={{position:'absolute',right:0,bottom:-1,width:((c.saldo/mxS)*100)+'%',height:2,borderRadius:1,background:r.bg}}/>
                  <span style={{fontSize:11,color:'#f1f5f9',fontFamily:"'JetBrains Mono',monospace",fontVariantNumeric:'tabular-nums',position:'relative',zIndex:1}}>
                    ${(c.saldo/1e6).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.')}M</span>
                </div>
              </td>
              <td style={{textAlign:'right',padding:'7px 12px'}}>
                <span style={{fontSize:11,fontWeight:600,color:c.pctTotal>100?'#ef4444':'#f59e0b',fontFamily:"'JetBrains Mono',monospace"}}>{c.pctTotal}%</span>
              </td>
              <td style={{padding:'7px 12px'}}>
                <span style={{display:'inline-block',padding:'1px 6px',borderRadius:3,background:r.bg,color:r.fg,fontSize:9,fontWeight:600,letterSpacing:'0.03em',fontFamily:"'JetBrains Mono',monospace"}}>{r.lb}</span>
              </td>
            </tr>
          )})}</tbody>
        </table>
      </div>
      {sel!==null&&(()=>{const c=sorted[sel];return(
        <div style={{borderTop:'1px solid rgba(148,163,184,0.1)',padding:'12px 16px',background:'rgba(0,0,0,0.15)'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
            <span style={{fontSize:12,fontWeight:600,color:'#f1f5f9'}}>{c.nombre}</span>
            <button onClick={()=>setSel(null)} style={{background:'rgba(148,163,184,0.08)',border:'none',color:'#94a3b8',width:22,height:22,borderRadius:5,cursor:'pointer',fontSize:11}}>✕</button>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            {[{l:'NIT',v:c.nit},{l:'Ciudad',v:c.ciudad},{l:'Docs',v:c.docs.toLocaleString()},
              {l:'Saldo',v:'$'+(c.saldo/1e6).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.')+'M'},
              {l:'%Total',v:c.pctTotal+'%',c:c.pctTotal>100?'#ef4444':'#f59e0b'},
              {l:'Riesgo',v:c.riesgo.toUpperCase(),c:c.riesgo==='critico'?'#ef4444':c.riesgo==='alto'?'#f59e0b':'#eab308'},
            ].map(d=>(
              <div key={d.l} style={{display:'flex',flexDirection:'column',gap:1}}>
                <span style={{fontSize:9,color:'#475569',textTransform:'uppercase',letterSpacing:'0.05em'}}>{d.l}</span>
                <span style={{fontSize:12,color:d.c||'#e2e8f0',fontWeight:500}}>{d.v}</span>
              </div>
            ))}
          </div>
        </div>
      )})()}
    </div>
  );
}

/* === CHATBOT === */
const RAG = {
  general:'La cartera de ADATEC tiene un saldo total de $38,374M en 89,064 documentos de 2,854 clientes. Cartera vencida: $35,495M (92.5%). Mora promedio: 1,038 días. Top 10 clientes concentran el 502.2% del total.',
  aging:'Aging: Corriente $2,879M (7.5%) | 1-30d: $1,635M (4.3%) | 31-60d: $1,820M (4.7%) | 61-90d: $1,713M (4.5%) | 91-180d: $6,226M (16.2%) | 181-360d: $9,612M (25.0%) | +360d: $14,488M (37.8%). 72,988 documentos en +360 días.',
  deudores:'Top: BAHAMON GUALDRON GINA ANDREA: $162,761M (424.1%). ELMER ENRIQUE PACHECO POLO: $5,358M (14.0%). ARISTIZABAL GRISALES HECTOR FABIO: $4,618M. 2,613 clientes con mora >360 días.',
  eficiencia:'94 vendedores. Eficiencias: RECAUDOS OF.CENTRAL (42%), MARTHA ROJAS (68%), JORGE RAMIREZ (55%), ANA TORRES (72%). Solo 14 vendedores con eficiencia >50%.',
  riesgos:'CRÍTICO: 92.5% cartera vencida. CRÍTICO: 1,038 días mora promedio. ALTO: 2,613 clientes >360 días mora. ALTO: Top 10 = 502.2% concentración.',
};

function Chatbot({onClose}) {
  const [msgs,setMsgs]=React.useState([
    {id:0,r:'b',c:'¡Hola! Soy tu asistente financiero de ADATEC. Pregunta sobre:'},
    {id:1,r:'o',items:['📊 Estado general','🔴 Deudores','📈 Eficiencia','⚠️ Riesgos','📉 Tendencias']}
  ]);
  const [inp,setInp]=React.useState('');const [ld,setLd]=React.useState(false);
  const ref=React.useRef(null);const nid=React.useRef(2);
  React.useEffect(()=>{ref.current?.scrollIntoView({behavior:'smooth'})},[msgs]);
  const getRAG=(q)=>{
    const l=q.toLowerCase();
    if(l.includes('estado')||l.includes('general')||(l.includes('cartera')&&!l.includes('aging')))return RAG.general;
    if(l.includes('aging')||l.includes('antigüedad')||l.includes('días')||l.includes('vencimiento'))return RAG.aging;
    if(l.includes('deudor')||l.includes('cliente')||l.includes('top')||l.includes('bahamon'))return RAG.deudores;
    if(l.includes('eficiencia')||l.includes('recaudo')||l.includes('vendedor')||l.includes('cobranza'))return RAG.eficiencia;
    if(l.includes('riesgo')||l.includes('alerta')||l.includes('crítico')||l.includes('peligro'))return RAG.riesgos;
    return RAG.general+'\n'+RAG.riesgos;
  };
  const send=(t)=>{
    const msg=t||inp;if(!msg.trim()||ld)return;
    setMsgs(p=>[...p,{id:nid.current++,r:'u',c:msg}]);setInp('');setLd(true);
    setTimeout(()=>{setMsgs(p=>[...p,{id:nid.current++,r:'b',c:getRAG(msg),src:'RAG ADATEC'}]);setLd(false);},600);
  };
  return (
    <div style={{height:'100%',display:'flex',flexDirection:'column',background:'#0f1622',borderRadius:16,overflow:'hidden',border:'1px solid rgba(148,163,184,0.08)'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 16px',borderBottom:'1px solid rgba(148,163,184,0.08)',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:30,height:30,borderRadius:8,background:'linear-gradient(135deg,#10b981,#059669)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:12,fontWeight:700}}>A</div>
          <div><span style={{fontSize:12,fontWeight:600,color:'#f1f5f9',display:'block'}}>Asistente ADATEC</span><span style={{fontSize:9,color:'#10b981',fontFamily:"'JetBrains Mono',monospace"}}>● RAG activo</span></div>
        </div>
        <button onClick={onClose} style={{background:'rgba(148,163,184,0.08)',border:'none',color:'#94a3b8',width:26,height:26,borderRadius:6,cursor:'pointer',fontSize:12}}>✕</button>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'10px 14px',display:'flex',flexDirection:'column',gap:8}}>
        {msgs.map(m=>(
          <div key={m.id}>
            {m.r==='u'&&<div style={{alignSelf:'flex-end',background:'linear-gradient(135deg,#10b981,#059669)',color:'#fff',padding:'8px 12px',borderRadius:'10px 10px 3px 10px',fontSize:12,maxWidth:'80%',lineHeight:1.4,marginLeft:'auto',marginBottom:4}}>{m.c}</div>}
            {m.r==='b'&&<div style={{alignSelf:'flex-start',background:'#111b2e',border:'1px solid rgba(148,163,184,0.08)',borderRadius:'10px 10px 10px 3px',padding:'8px 12px',maxWidth:'85%',marginBottom:4}}>
              <div style={{fontSize:12,color:'#e2e8f0',lineHeight:1.5,whiteSpace:'pre-wrap'}}>{m.c}</div>
              {m.src&&<div style={{fontSize:8,color:'#475569',marginTop:4,fontFamily:"'JetBrains Mono',monospace"}}>{m.src}</div>}
            </div>}
            {m.r==='o'&&<div style={{display:'flex',flexWrap:'wrap',gap:4,marginTop:2}}>
              {m.items.map((item,i)=><button key={i} onClick={()=>send(item.replace(/^[^ ]+\s/,''))}
                style={{background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.15)',color:'#34d399',padding:'5px 10px',borderRadius:6,fontSize:10,cursor:'pointer',fontWeight:500}}>{item}</button>)}
            </div>}
          </div>
        ))}
        {ld&&<div style={{background:'#111b2e',border:'1px solid rgba(148,163,184,0.08)',borderRadius:'10px 10px 10px 3px',padding:'8px 12px',alignSelf:'flex-start'}}>
          <span style={{fontSize:12,color:'#94a3b8'}}>Analizando datos...</span>
        </div>}
        <div ref={ref}/>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:6,padding:'8px 12px',borderTop:'1px solid rgba(148,163,184,0.08)',flexShrink:0}}>
        <input style={{flex:1,background:'#111b2e',border:'1px solid rgba(148,163,184,0.1)',borderRadius:8,padding:'8px 12px',color:'#f1f5f9',fontSize:12,outline:'none'}}
          placeholder="Pregunta sobre la cartera..." value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} disabled={ld}/>
        <button style={{background:'#10b981',border:'none',width:32,height:32,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',flexShrink:0,opacity:ld?0.4:1,cursor:ld?'not-allowed':'pointer'}}
          onClick={()=>send()} disabled={ld}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

/* === APP === */
function App() {
  const [av,setAv]=React.useState('dashboard');
  const [co,setCo]=React.useState(false);

  const rv=(id)=>{
    if(id==='dashboard')return(
      <div style={{maxWidth:1200,margin:'0 auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16,gap:12,flexWrap:'wrap'}}>
          <div>
            <h1 style={{fontSize:20,fontWeight:700,color:'#f1f5f9',margin:0,letterSpacing:'-0.02em'}}>Panel General</h1>
            <p style={{fontSize:11,color:'#475569',margin:'2px 0 0',fontFamily:"'JetBrains Mono',monospace"}}>Cartera ADATEC • 13/05/2026</p>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <button onClick={()=>setCo(true)} style={{background:'linear-gradient(135deg,rgba(16,185,129,0.12),rgba(5,150,105,0.1))',border:'1px solid rgba(16,185,129,0.15)',color:'#34d399',padding:'5px 12px',borderRadius:8,fontSize:11,fontWeight:600,cursor:'pointer',whiteSpace:'nowrap'}}>🤖 Asistente IA</button>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12,marginBottom:14}}>
          {D.kpis.map(k=><KpiCard key={k.id} {...k}/>)}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1.6fr 1fr',gap:12}}>
          <div style={{background:'#111b2e',borderRadius:16,padding:'14px',border:'1px solid rgba(148,163,184,0.08)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:2}}>
              <span style={{fontSize:12,fontWeight:600,color:'#e2e8f0'}}>Facturación vs Cartera</span>
              <span style={{fontSize:8,color:'#475569',background:'rgba(148,163,184,0.06)',padding:'1px 6px',borderRadius:4,fontFamily:"'JetBrains Mono',monospace"}}>12m</span>
            </div>
            <TrendChart data={D.trendData}/>
          </div>
          <DonutChart data={D.aging}/>
        </div>
        <div style={{marginTop:12,display:'grid',gridTemplateColumns:'1.2fr 1fr',gap:12}}>
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
              <span style={{fontSize:12,fontWeight:600,color:'#e2e8f0'}}>Aging</span>
              <span style={{fontSize:8,color:'#475569',background:'rgba(148,163,184,0.06)',padding:'1px 6px',borderRadius:4,fontFamily:"'JetBrains Mono',monospace"}}>{D.aging.length} rangos</span>
            </div>
            <AgingChart data={D.aging}/>
          </div>
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
              <span style={{fontSize:12,fontWeight:600,color:'#e2e8f0'}}>Top Deudores</span>
              <span style={{fontSize:8,background:'rgba(239,68,68,0.1)',color:'#ef4444',padding:'1px 6px',borderRadius:4,fontFamily:"'JetBrains Mono',monospace"}}>{D.topClientes.filter(c=>c.riesgo==='critico'||c.riesgo==='alto').length} críticos</span>
            </div>
            <ClientTable data={D.topClientes}/>
          </div>
        </div>
      </div>
    );
    if(id==='analytics')return(
      <div style={{maxWidth:1200,margin:'0 auto'}}>
        <h1 style={{fontSize:20,fontWeight:700,color:'#f1f5f9',margin:0,letterSpacing:'-0.02em'}}>Analítica</h1>
        <p style={{fontSize:11,color:'#475569',margin:'2px 0 12px',fontFamily:"'JetBrains Mono',monospace"}}>Métricas detalladas</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12,marginBottom:14}}>
          {[{label:'Total Documentos',value:'89.064',icon:'📄',accent:'#6366f1',spark:[82,84,86,87,88,89,89],sub:'+2.1% vs mes anterior'},{label:'Total Clientes',value:'2.854',icon:'👥',accent:'#8b5cf6',spark:[2750,2780,2800,2820,2835,2845,2854],sub:'94 vendedores activos'},{label:'Base Retención',value:'$235.796M',icon:'🏦',accent:'#06b6d4',spark:[210,218,225,228,232,234,236],sub:'Base imponible total'},{label:'Concentración Top10',value:'502.2%',icon:'🎯',accent:'#ef4444',spark:[480,485,490,495,498,500,502],sub:'Alta concentración'},].map(k=><KpiCard key={k.label} {...k}/>)}
        </div>
        <AgingChart data={D.aging}/>
        <div style={{marginTop:12,background:'#111b2e',borderRadius:16,padding:'14px 18px',border:'1px solid rgba(148,163,184,0.08)'}}>
          <div style={{fontSize:12,fontWeight:600,color:'#f1f5f9',marginBottom:8}}>Resumen Ejecutivo</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
            {[{l:'Saldo total',v:'$38.374M'},{l:'Cartera vencida',v:'$35.495M'},{l:'% Vencida',v:'92.5%',w:true},{l:'Días mora prom.',v:'1.038',w:true},{l:'Clientes >360d',v:'2.613',w:true},{l:'Vendedores',v:'94'}].map(s=><div key={s.l}><span style={{fontSize:9,color:'#475569',textTransform:'uppercase',letterSpacing:'0.05em'}}>{s.l}</span><span style={{fontSize:15,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:s.w?'#ef4444':'#f1f5f9',marginTop:1,display:'block'}}>{s.v}</span></div>)}
          </div>
        </div>
      </div>
    );
    if(id==='clientes')return(
      <div style={{maxWidth:1200,margin:'0 auto'}}>
        <h1 style={{fontSize:20,fontWeight:700,color:'#f1f5f9',margin:0,letterSpacing:'-0.02em'}}>Clientes</h1>
        <p style={{fontSize:11,color:'#475569',margin:'2px 0 12px',fontFamily:"'JetBrains Mono',monospace"}}>Top {D.topClientes.length} deudores</p>
        <ClientTable data={D.topClientes}/>
      </div>
    );
    if(id==='reportes')return(
      <div style={{maxWidth:1200,margin:'0 auto'}}>
        <h1 style={{fontSize:20,fontWeight:700,color:'#f1f5f9',margin:0,letterSpacing:'-0.02em'}}>Alertas</h1>
        <p style={{fontSize:11,color:'#475569',margin:'2px 0 12px',fontFamily:"'JetBrains Mono',monospace"}}>{D.alertas.length} riesgos activos</p>
        {D.alertas.map((a,i)=>{const cs={critico:{bg:'rgba(239,68,68,0.08)',b:'#ef4444',t:'#fca5a5',icon:'🔴'},alto:{bg:'rgba(245,158,11,0.08)',b:'#f59e0b',t:'#fcd34d',icon:'🟠'},medio:{bg:'rgba(234,179,8,0.06)',b:'#eab308',t:'#fde68a',icon:'🟡'}};const c=cs[a.nivel]||cs.medio;return(
          <div key={i} style={{display:'flex',alignItems:'flex-start',gap:10,padding:'10px 14px',borderRadius:8,marginBottom:6,background:c.bg,borderLeft:'3px solid '+c.b}}>
            <span style={{fontSize:16}}>{c.icon}</span>
            <div style={{flex:1}}>
              <div style={{fontSize:9,color:c.b,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:1}}>{a.nivel==='critico'?'⚠️ CRÍTICO':a.nivel==='alto'?'⚡ ALTO':'📌 MEDIO'}</div>
              <div style={{fontSize:12,color:c.t,fontWeight:500}}>{a.mensaje}</div>
            </div>
          </div>
        )})}
        <div style={{marginTop:14,background:'#111b2e',borderRadius:16,padding:'14px 18px',border:'1px solid rgba(148,163,184,0.08)'}}>
          <div style={{fontSize:12,fontWeight:600,color:'#f1f5f9',marginBottom:6}}>Acciones Recomendadas</div>
          <ul style={{margin:0,padding:'0 0 0 14px',color:'#94a3b8',fontSize:11,lineHeight:1.8}}>
            <li>Plan recuperación para 2.613 clientes con mora &gt;360 días</li>
            <li>Revisar estrategia de recaudo — solo 14 de 94 vendedores tienen eficiencia &gt;50%</li>
            <li>Establecer topes de concentración para clientes que exceden 100% del total</li>
            <li>Evaluar provisión contable para $14.488M en cartera +360 días</li>
          </ul>
        </div>
      </div>
    );
    return null;
  };

  return (
    <div style={{display:'flex',minHeight:'100vh',background:'#0a0e17',color:'#f1f5f9',fontFamily:"'Inter','SF Pro Display',system-ui,sans-serif",position:'relative'}}>
      <style>{`*{box-sizing:border-box}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:rgba(148,163,184,0.12);border-radius:3px}@keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}@keyframes slideIn{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:translateX(0)}}button:focus-visible,input:focus-visible{outline:2px solid #10b981;outline-offset:2px}@media(max-width:768px){.ds{display:none!important}.ms{display:flex!important}.mc{padding:12px!important}div[style*="gridTemplateColumns"]{grid-template-columns:1fr!important}}`}</style>

      <div className="ds" style={{width:210,height:'100vh',background:'#0f1622',borderRight:'1px solid rgba(148,163,184,0.06)',display:'flex',flexDirection:'column',padding:'14px 8px',position:'sticky',top:0,flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:8,padding:'4px 8px 14px',borderBottom:'1px solid rgba(148,163,184,0.06)',marginBottom:12}}>
          <div style={{width:30,height:30,borderRadius:8,background:'linear-gradient(135deg,#10b981,#059669)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:14,color:'#fff',flexShrink:0}}>A</div>
          <div><div style={{fontSize:13,fontWeight:700,color:'#f1f5f9',letterSpacing:'-0.01em'}}>ADATEC</div><div style={{fontSize:9,color:'#475569',fontFamily:"'JetBrains Mono',monospace"}}>Dashboard Financiero</div></div>
        </div>
        <div style={{flex:1,overflowY:'auto',display:'flex',flexDirection:'column',gap:8}}>
          {NAV.map(s=><div key={s.label}>
            <div style={{fontSize:8,color:'#334155',textTransform:'uppercase',letterSpacing:'0.08em',padding:'4px 8px 3px',fontWeight:600}}>{s.label}</div>
            {s.items.map(item=>{const a=av===item.id;return(
              <button key={item.id} style={{display:'flex',alignItems:'center',gap:8,width:'100%',padding:'7px 8px',borderRadius:6,border:'none',cursor:'pointer',fontSize:12,textAlign:'left',background:a?'rgba(16,185,129,0.1)':'transparent',color:a?'#10b981':'#475569',borderLeft:a?'2px solid #10b981':'2px solid transparent',transition:'all 0.12s',marginBottom:1}}
                onClick={()=>{setAv(item.id);if(item.id==='chat')setCo(true)}}>
                <span style={{fontSize:14}}>{item.icon}</span>
                <span style={{fontSize:12,fontWeight:a?600:500}}>{item.label}</span>
              </button>
            )})}
          </div>)}
        </div>
        <div style={{borderTop:'1px solid rgba(148,163,184,0.06)',padding:'10px 8px 2px',marginTop:'auto'}}>
          <div style={{display:'flex',alignItems:'center',gap:5}}>
            <span style={{width:5,height:5,borderRadius:3,background:'#10b981',boxShadow:'0 0 5px rgba(16,185,129,0.4)'}}/>
            <span style={{fontSize:10,color:'#475569'}}>Sistema activo</span>
          </div>
          <div style={{fontSize:8,color:'#334155',fontFamily:"'JetBrains Mono',monospace",marginTop:1}}>v2.0 • May 2026</div>
        </div>
      </div>

      <div className="mc" style={{flex:1,padding:'18px 22px 32px',overflowY:'auto',maxHeight:'100vh',minWidth:0}}>
        {rv(av)}
      </div>

      {co&&<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',zIndex:300,display:'flex',justifyContent:'flex-end'}} onClick={()=>setCo(false)}>
        <div style={{width:380,maxWidth:'95vw',height:'100vh',padding:10}} onClick={e=>e.stopPropagation()}>
          <Chatbot onClose={()=>setCo(false)}/>
        </div>
      </div>}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
