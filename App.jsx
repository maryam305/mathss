import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, Database, LayoutDashboard, PieChart, PlusCircle, Settings, Server, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- THEME CONFIGURATION ---
const THEMES = {
  purple: {
    name: 'Nebula',
    bg: 'bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#2D1B4E] via-[#0D0415] to-[#05010a]',
    primary: '#EC4899',
    secondary: '#8B5CF6',
    accent: '#A78BFA',
    text: 'text-white',
    panelBg: 'bg-[#1a0b2e]/60'
  },
  cyber: {
    name: 'Cyberpunk',
    bg: 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1a1a1a] via-[#000000] to-[#111100]',
    primary: '#FACC15',
    secondary: '#06B6D4',
    accent: '#22D3EE',
    text: 'text-yellow-50',
    panelBg: 'bg-[#111]/80'
  },
  ocean: {
    name: 'Deep Sea',
    bg: 'bg-gradient-to-b from-[#0f172a] via-[#020617] to-[#0b1121]',
    primary: '#38BDF8',
    secondary: '#3B82F6',
    accent: '#7DD3FC',
    text: 'text-sky-50',
    panelBg: 'bg-[#0f172a]/60'
  },
  crimson: {
    name: 'Red Alert',
    bg: 'bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-[#2b0a0a] via-[#000] to-[#1a0505]',
    primary: '#EF4444',
    secondary: '#F97316',
    accent: '#FCA5A5',
    text: 'text-red-50',
    panelBg: 'bg-[#2b0a0a]/60'
  }
};

/**
 * --- VISUAL COMPONENT: HOLOGRAPHIC GRAPH ---
 */
const HolographicGraph = ({ nodes, theme }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const updateSize = () => {
        const parent = canvas.parentElement;
        if (parent) {
            canvas.width = parent.clientWidth;
            canvas.height = parent.clientHeight;
        }
    }
    
    updateSize();
    window.addEventListener('resize', updateSize);

    const particles = nodes.map(n => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random()-0.5)*0.5,
      vy: (Math.random()-0.5)*0.5,
      ...n
    }));

    let frame;
    const animate = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0,0,w,h);
      
      particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        if(p.x < 0 || p.x > w) p.vx *= -1;
        if(p.y < 0 || p.y > h) p.vy *= -1;

        particles.forEach((p2, j) => {
           if(i < j) {
             const dx = p.x - p2.x;
             const dy = p.y - p2.y;
             const dist = Math.sqrt(dx*dx+dy*dy);
             if(dist < 100) {
               ctx.beginPath();
               ctx.strokeStyle = `${theme.secondary}20`;
               ctx.moveTo(p.x, p.y);
               ctx.lineTo(p2.x, p2.y);
               ctx.stroke();
             }
           }
        });

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.isOncogene ? 5 : 2, 0, Math.PI*2);
        ctx.fillStyle = p.isOncogene ? theme.primary : theme.secondary; 
        ctx.fill();
        
        if(p.isOncogene) {
             ctx.shadowBlur = 15;
             ctx.shadowColor = theme.primary;
             ctx.stroke();
             ctx.shadowBlur = 0;
        }
      });
      frame = requestAnimationFrame(animate);
    };
    animate();
    return () => {
        cancelAnimationFrame(frame);
        window.removeEventListener('resize', updateSize);
    }
  }, [nodes, theme]);

  return <canvas ref={canvasRef} className="w-full h-full block" />;
};

/**
 * --- COMPONENT: LIQUID GAUGE ---
 */
const LiquidGauge = ({ value, label, color, panelBg }) => (
  <div className={`flex flex-col items-center justify-center p-3 sm:p-4 ${panelBg} backdrop-blur-md rounded-xl sm:rounded-2xl border border-white/5 relative overflow-hidden group min-h-[120px] sm:min-h-[140px] w-full`}>
    <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-2 sm:mb-3 flex-shrink-0">
       <svg className="w-full h-full transform -rotate-90">
         <circle cx="40" cy="40" r="36" stroke="rgba(255,255,255,0.1)" strokeWidth="6" fill="transparent" />
         <circle 
            cx="40" cy="40" r="36" 
            stroke={color} 
            strokeWidth="6" 
            fill="transparent" 
            strokeDasharray={226}
            strokeDashoffset={226 - (226 * value) / 100}
            className="transition-all duration-1000 ease-out"
            strokeLinecap="round"
         />
       </svg>
       <div className="absolute inset-0 flex items-center justify-center">
         <div className="text-base sm:text-lg font-bold font-mono" style={{ color }}>{value}%</div>
       </div>
    </div>
    <span className="text-[9px] sm:text-[10px] font-bold opacity-60 tracking-wider uppercase text-center">{label}</span>
  </div>
);

/**
 * --- COMPONENT: STAT CARD ---
 */
const StatCard = ({ title, value, theme, trend }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className={`${theme.panelBg} backdrop-blur-md p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-white/5 relative overflow-hidden min-h-[100px] sm:min-h-[120px] flex flex-col justify-between w-full`}
  >
    <div className="flex justify-between items-start">
      <h3 className="text-[10px] sm:text-xs opacity-70 font-bold tracking-widest uppercase truncate pr-2" style={{ color: theme.accent }}>{title}</h3>
      <div className={`w-2 h-2 rounded-full flex-shrink-0`} style={{ backgroundColor: trend === 'up' ? theme.primary : theme.secondary }} />
    </div>
    <div className="text-xl sm:text-2xl font-bold font-mono mt-2 truncate" title={value}>{value}</div>
    <div className="w-full h-3 sm:h-4 flex items-end gap-1 opacity-30 mt-2">
       {[40, 70, 50, 90, 60, 80, 50].map((h, i) => (
         <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${h}%`, background: theme.primary }} />
       ))}
    </div>
  </motion.div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentTheme, setCurrentTheme] = useState('purple');
  const [showSettings, setShowSettings] = useState(false);
  const [data, setData] = useState({ nodes: [] });
  const [metrics, setMetrics] = useState([]);
  const [serverStatus, setServerStatus] = useState('OFFLINE');
  const [newData, setNewData] = useState({ id: '', type: 'Kinase', expression: 50 });

  const theme = THEMES[currentTheme];

  useEffect(() => {
    const fetchData = async () => {
        try {
            const statusRes = await fetch('http://localhost:3000/api/status');
            if(statusRes.ok) setServerStatus('ONLINE');

            const analyzeRes = await fetch('http://localhost:3000/api/analyze', { method: 'POST' });
            const analyzeData = await analyzeRes.json();
            setData(analyzeData.network_data);

            const metricsRes = await fetch('http://localhost:3000/api/production-metrics');
            const metricsData = await metricsRes.json();
            setMetrics(metricsData);
        } catch (err) {
            console.error("Connection error:", err);
            setServerStatus('OFFLINE');
        }
    };
    fetchData();
  }, []);

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} font-sans flex flex-col overflow-hidden transition-colors duration-700`}>
      
      {/* --- HEADER --- */}
      <header className="h-16 sm:h-20 flex-none flex justify-between items-center px-3 sm:px-4 md:px-8 z-20 border-b border-white/5 bg-black/10 backdrop-blur-sm">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0" style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}>
            <Activity className="text-white w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-xl font-bold tracking-tight truncate">HELIX<span style={{ color: theme.primary }}>.UI</span></h1>
            <p className="text-[8px] sm:text-[10px] opacity-50 tracking-[0.2em] sm:tracking-[0.3em] font-bold hidden xs:block">BIOMETRIC DASHBOARD</p>
          </div>
        </div>
        
        {/* TAB NAV - Scrollable on mobile */}
        <div className={`flex ${theme.panelBg} p-1 sm:p-1.5 rounded-full border border-white/5 backdrop-blur-md overflow-x-auto max-w-[45vw] sm:max-w-[50vw] md:max-w-none scrollbar-hide`}>
          {[
            { id: 'dashboard', label: 'OVERVIEW', icon: LayoutDashboard },
            { id: 'analysis', label: 'ANALYTICS', icon: PieChart },
            { id: 'add-data', label: 'INGEST', icon: PlusCircle },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-2 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-2.5 rounded-full text-[10px] sm:text-xs font-bold flex items-center gap-1 sm:gap-2 transition-all whitespace-nowrap`}
              style={{
                background: activeTab === item.id ? `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})` : 'transparent',
                color: activeTab === item.id ? '#fff' : 'rgba(255,255,255,0.5)',
                boxShadow: activeTab === item.id ? '0 4px 15px rgba(0,0,0,0.3)' : 'none'
              }}
            >
              <item.icon size={12} className="sm:w-3.5 sm:h-3.5" />
              <span className="hidden xs:inline">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-4 relative">
           <div className={`w-2 h-2 rounded-full ${serverStatus === 'ONLINE' ? 'bg-green-400 shadow-[0_0_10px_#4ade80]' : 'bg-red-500'}`} />
           <button onClick={() => setShowSettings(!showSettings)} className="hover:rotate-90 transition-transform duration-500">
             <Settings className="opacity-70 hover:opacity-100" size={18} />
           </button>

           {/* SETTINGS POPUP */}
           <AnimatePresence>
             {showSettings && (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9, y: 10 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.9, y: 10 }}
                 className={`absolute top-12 right-0 w-56 sm:w-64 ${theme.panelBg} border border-white/10 rounded-xl sm:rounded-2xl shadow-2xl p-3 sm:p-4 backdrop-blur-xl z-50`}
               >
                 <div className="flex justify-between items-center mb-3 sm:mb-4">
                   <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Interface Theme</span>
                   <X size={14} className="cursor-pointer opacity-50 hover:opacity-100" onClick={() => setShowSettings(false)} />
                 </div>
                 <div className="grid grid-cols-2 gap-2">
                   {Object.entries(THEMES).map(([key, t]) => (
                     <button
                       key={key}
                       onClick={() => setCurrentTheme(key)}
                       className={`p-2 rounded-lg text-[10px] sm:text-xs font-bold border transition-all text-left flex items-center gap-2
                         ${currentTheme === key ? 'border-white/30 bg-white/10' : 'border-transparent hover:bg-white/5'}
                       `}
                     >
                       <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: t.primary }}></div>
                       <span className="truncate">{t.name}</span>
                     </button>
                   ))}
                 </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </header>

      {/* --- MAIN CONTENT (SCROLLABLE) --- */}
      <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto relative scroll-smooth">
        <AnimatePresence mode="wait">
          
          {/* VIEW: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-4 sm:gap-6 pb-6 sm:pb-8"
            >
              {/* ROW 1: STATS */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                 <StatCard title="Protein Count" value={data.nodes?.length || 0} theme={theme} trend="up" />
                 <StatCard title="Oncogenes" value={data.nodes?.filter(n => n.isOncogene).length || 0} theme={theme} trend="down" />
                 <StatCard title="Efficiency" value="94.2%" theme={theme} trend="up" />
                 <StatCard title="Data Flow" value="876 MB/s" theme={theme} trend="up" />
              </div>

              {/* ROW 2: GAUGES & CHART */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
                 {/* GAUGES */}
                 <div className="lg:col-span-4 grid grid-cols-2 gap-3 sm:gap-4">
                    <LiquidGauge value={78} label="Stability" color={theme.primary} panelBg={theme.panelBg} />
                    <LiquidGauge value={45} label="Mutation" color={theme.secondary} panelBg={theme.panelBg} />
                    <LiquidGauge value={92} label="Purity" color={theme.accent} panelBg={theme.panelBg} />
                    <LiquidGauge value={63} label="Response" color={theme.primary} panelBg={theme.panelBg} />
                 </div>

                 {/* BIG CHART */}
                 <div className={`lg:col-span-8 ${theme.panelBg} border border-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 relative flex flex-col min-h-[250px] sm:min-h-[300px]`}>
                    <h3 className="text-xs sm:text-sm font-bold opacity-80 mb-3 sm:mb-4 flex items-center gap-2">
                      <Activity size={14} className="sm:w-4 sm:h-4" style={{ color: theme.primary }} /> 
                      <span>SYSTEM GROWTH</span>
                    </h3>
                    <div className="flex-1 w-full min-h-[180px] sm:min-h-[200px]">
                      <ResponsiveContainer>
                        <AreaChart data={metrics}>
                          <defs>
                            <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={theme.primary} stopOpacity={0.4}/>
                              <stop offset="95%" stopColor={theme.primary} stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorSecondary" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={theme.secondary} stopOpacity={0.4}/>
                              <stop offset="95%" stopColor={theme.secondary} stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: theme.accent, fontSize: 9}} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '8px', fontSize: '11px' }}
                            itemStyle={{ color: '#fff', fontSize: '11px' }}
                          />
                          <Area type="monotone" dataKey="growth" stroke={theme.primary} strokeWidth={2} fill="url(#colorPrimary)" />
                          <Area type="monotone" dataKey="inhibition" stroke={theme.secondary} strokeWidth={2} fill="url(#colorSecondary)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                 </div>
              </div>

              {/* ROW 3: NETWORK GRAPH */}
              <div className={`${theme.panelBg} border border-white/5 rounded-xl sm:rounded-2xl relative overflow-hidden group min-h-[300px] sm:min-h-[350px] md:min-h-[400px]`}>
                 <div className="absolute top-3 sm:top-4 left-4 sm:left-6 z-10 pointer-events-none">
                   <h3 className="text-xs sm:text-sm font-bold flex items-center gap-2">
                     <Server size={14} className="sm:w-4 sm:h-4" style={{ color: theme.secondary }} /> 
                     <span>LIVE NETWORK TOPOLOGY</span>
                   </h3>
                 </div>
                 <HolographicGraph nodes={data.nodes || []} theme={theme} />
                 <div className="absolute bottom-0 left-0 w-full h-24 sm:h-32 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
              </div>

            </motion.div>
          )}

          {/* VIEW: INGEST (Add Data) */}
          {activeTab === 'add-data' && (
            <motion.div 
               key="add"
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="min-h-[500px] sm:min-h-[600px] flex items-center justify-center px-4"
            >
              <div className={`w-full max-w-[400px] ${theme.panelBg} border border-white/10 p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl relative overflow-hidden backdrop-blur-xl`}>
                 <div className="absolute top-0 left-0 w-full h-2" style={{ background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})` }} />
                 <h2 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6">Inject Data</h2>
                 
                 <div className="space-y-5 sm:space-y-6">
                   <div className="group">
                     <label className="text-[10px] sm:text-xs font-bold opacity-60 uppercase tracking-wider mb-2 block">Protein Identifier</label>
                     <div className="flex items-center bg-black/40 rounded-xl border border-white/10 group-focus-within:border-white/40 transition-colors p-3">
                        <Database size={16} className="opacity-50 mr-3 flex-shrink-0" />
                        <input 
                          type="text" 
                          value={newData.id}
                          onChange={e => setNewData({...newData, id: e.target.value})}
                          className="bg-transparent text-white text-sm w-full focus:outline-none font-mono"
                          placeholder="PRT-X00"
                        />
                     </div>
                   </div>

                   <div className="group">
                     <label className="text-[10px] sm:text-xs font-bold opacity-60 uppercase tracking-wider mb-2 block">Molecular Type</label>
                     <div className="flex items-center bg-black/40 rounded-xl border border-white/10 group-focus-within:border-white/40 transition-colors p-3">
                        <Activity size={16} className="opacity-50 mr-3 flex-shrink-0" />
                        <select 
                           value={newData.type}
                           onChange={e => setNewData({...newData, type: e.target.value})}
                           className="bg-transparent text-white text-sm w-full focus:outline-none"
                        >
                          <option className="bg-black">Kinase</option>
                          <option className="bg-black">Transcription Factor</option>
                        </select>
                     </div>
                   </div>

                   <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-[10px] sm:text-xs font-bold opacity-60 uppercase tracking-wider">Expression</label>
                        <span className="text-xs font-mono" style={{ color: theme.primary }}>{newData.expression}%</span>
                      </div>
                      <input 
                        type="range" 
                        value={newData.expression}
                        onChange={e => setNewData({...newData, expression: e.target.value})}
                        className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        style={{ accentColor: theme.primary }}
                      />
                   </div>

                   <button 
                      onClick={() => {
                        fetch('http://localhost:3000/api/data', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(newData)
                        })
                        .then(res => res.json())
                        .then(() => {
                            alert('Data Injected.');
                            setNewData({ id: '', type: 'Kinase', expression: 50 });
                        });
                      }}
                      className="w-full py-3.5 sm:py-4 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-95 text-white"
                      style={{ background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})` }}
                   >
                     UPLOAD TO CORE
                   </button>
                 </div>
              </div>
            </motion.div>
          )}

          {/* VIEW: ANALYTICS (Full Charts) */}
          {activeTab === 'analysis' && (
            <motion.div 
               key="analysis"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="flex flex-col gap-4 sm:gap-6 pb-6 sm:pb-8"
            >
               <div className={`${theme.panelBg} rounded-xl sm:rounded-2xl border border-white/5 p-4 sm:p-6 min-h-[300px] sm:min-h-[400px] flex flex-col`}>
                 <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Detailed Growth Trajectory</h3>
                 <div className="flex-1 min-h-[240px] sm:min-h-[320px]">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={metrics}>
                         <defs>
                           <linearGradient id="colorFull" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor={theme.primary} stopOpacity={0.6}/>
                             <stop offset="95%" stopColor={theme.primary} stopOpacity={0}/>
                           </linearGradient>
                         </defs>
                         <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                         <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10 }} />
                         <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10 }} />
                         <Tooltip contentStyle={{backgroundColor: '#000', fontSize: '11px'}} />
                         <Area type="monotone" dataKey="growth" stroke={theme.primary} fill="url(#colorFull)" strokeWidth={3} />
                       </AreaChart>
                   </ResponsiveContainer>
                 </div>
               </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
