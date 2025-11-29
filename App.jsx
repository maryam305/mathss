import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
// FIX 1: Added FileText to imports to solve "FileText is not defined"
import { 
  Activity, Share2, Database, X, 
  Dna, LayoutGrid, Search,
  Zap, ArrowUpRight, Filter, Settings,
  ChevronDown, MoreHorizontal, UploadCloud, Check, AlertCircle, Menu,
  Layers, Terminal, FileText 
} from 'lucide-react';
// FIX 2: We use 'motion' now for smooth sidebar and page transitions
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';

/* -------------------------------------------------------------------------- */
/* 1. THEME ENGINE                                                            */
/* -------------------------------------------------------------------------- */

const THEMES = {
  modern: {
    id: 'modern',
    label: 'Modern Light',
    gradient: "from-slate-50/90 to-slate-100/80",
    nav: "bg-white/60 border-b border-white/40",
    sidebar: "bg-white/50 border-r border-white/40",
    card: "bg-white/40 border border-white/60",
    textMain: "text-slate-800",
    textSub: "text-slate-500",
    primary: "#6366f1",
    accent: "#8b5cf6",
    canvas: { node: "rgba(99, 102, 241, 0.4)", line: "rgba(99, 102, 241, 0.1)" }
  },
  dark: {
    id: 'dark',
    label: 'Scientific Dark',
    gradient: "from-[#0B1120]/95 to-[#0f172a]/90",
    nav: "bg-[#0f172a]/60 border-b border-white/10",
    sidebar: "bg-[#0f172a]/50 border-r border-white/10",
    card: "bg-[#1e293b]/50 border border-white/10",
    textMain: "text-slate-100",
    textSub: "text-slate-400",
    primary: "#38bdf8",
    accent: "#818cf8",
    canvas: { node: "rgba(56, 189, 248, 0.4)", line: "rgba(148, 163, 184, 0.15)" }
  },
  warm: {
    id: 'warm',
    label: 'Journal',
    gradient: "from-[#FDFBF7]/90 to-[#f5f5f4]/80",
    nav: "bg-[#e7e5e4]/50 border-b border-stone-200/50",
    sidebar: "bg-[#f5f5f4]/50 border-r border-stone-200/50",
    card: "bg-white/50 border border-stone-200/60",
    textMain: "text-stone-800",
    textSub: "text-stone-500",
    primary: "#ea580c",
    accent: "#d97706",
    canvas: { node: "rgba(234, 88, 12, 0.3)", line: "rgba(168, 162, 158, 0.2)" }
  },
  blue: {
    id: 'blue',
    label: 'Clinical',
    gradient: "from-[#F0F9FF]/90 to-[#e0f2fe]/80",
    nav: "bg-sky-50/60 border-b border-sky-200/50",
    sidebar: "bg-sky-50/50 border-r border-sky-200/50",
    card: "bg-white/50 border border-sky-100/60",
    textMain: "text-sky-900",
    textSub: "text-sky-500",
    primary: "#0284c7",
    accent: "#0ea5e9",
    canvas: { node: "rgba(2, 132, 199, 0.3)", line: "rgba(2, 132, 199, 0.1)" }
  },
  midnight: {
    id: 'midnight',
    label: 'Cyber',
    gradient: "from-black/90 to-[#111]/90",
    nav: "bg-black/60 border-b border-white/10",
    sidebar: "bg-black/50 border-r border-white/10",
    card: "bg-[#111]/60 border border-white/10",
    textMain: "text-gray-200",
    textSub: "text-gray-500",
    primary: "#d8b4fe",
    accent: "#c084fc",
    canvas: { node: "rgba(216, 180, 254, 0.5)", line: "rgba(216, 180, 254, 0.15)" }
  }
};

/* -------------------------------------------------------------------------- */
/* 2. BACKGROUND CANVAS (THE SPECTRA ENGINE)                                  */
/* -------------------------------------------------------------------------- */

const BioNetworkBackground = ({ theme }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    
    // Config
    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    const particleCount = w < 768 ? 40 : 80;
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 3 + 1,
      phase: Math.random() * Math.PI * 2
    }));

    const render = () => {
      ctx.clearRect(0, 0, w, h);
      
      particles.forEach((p, i) => {
        // Physics
        p.x += p.vx;
        p.y += p.vy;
        p.phase += 0.005;

        // Boundaries (Wrap)
        if (p.x < 0) p.x = w;
        else if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        else if (p.y > h) p.y = 0;

        // Connections
        particles.slice(i + 1).forEach((p2) => {
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.hypot(dx, dy);
          const maxDist = 200;

          if (dist < maxDist) {
            ctx.beginPath();
            ctx.strokeStyle = theme.canvas.line;
            ctx.lineWidth = (1 - dist / maxDist);
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });

        // Draw Node
        ctx.beginPath();
        const pulse = 0.5 + Math.sin(p.phase) * 0.5;
        const colorBase = theme.canvas.node.substring(0, theme.canvas.node.lastIndexOf(','));
        ctx.fillStyle = `${colorBase}, ${pulse})`;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [theme]);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none bg-white" />;
};

/* -------------------------------------------------------------------------- */
/* 3. MOCK DATA ENGINE                                                        */
/* -------------------------------------------------------------------------- */

const MockEngine = {
  getTopology: (count = 35) => ({
    nodes: Array.from({ length: count }, (_, i) => ({
      id: `P-${100 + i}`,
      label: i % 5 === 0 ? `HUB-${i}` : `Gene-${i}`,
      type: i % 5 === 0 ? 'Driver' : 'Passenger',
      val: Math.random(),
      status: Math.random() > 0.9 ? 'Mutated' : 'Stable'
    })),
    links: [] 
  }),
  getAnalytics: () => Array.from({ length: 12 }, (_, i) => ({
    time: `${i * 2}h`,
    val: 2000 + Math.random() * 3000
  }))
};

/* -------------------------------------------------------------------------- */
/* 4. UI COMPONENTS                                                           */
/* -------------------------------------------------------------------------- */

const BentoCard = ({ children, title, icon: Icon, theme, className = "", delay = 0 }) => (
  // Fixed: 'motion' is now correctly used here for animation
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: delay * 0.1, ease: "backOut" }}
    className={`relative overflow-hidden rounded-2xl p-6 backdrop-blur-xl shadow-sm ${theme.card} ${className}`}
  >
    {title && (
      <div className="flex items-center justify-between mb-4 z-10 relative">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className="p-1.5 rounded-lg opacity-80" style={{ backgroundColor: `${theme.primary}15`, color: theme.primary }}>
              <Icon size={16} />
            </div>
          )}
          <h3 className={`text-xs font-bold uppercase tracking-wider ${theme.textSub}`}>{title}</h3>
        </div>
        <MoreHorizontal size={16} className={`${theme.textSub} opacity-50`} />
      </div>
    )}
    <div className="relative z-10 h-full">{children}</div>
  </motion.div>
);

const SettingsModal = ({ isOpen, onClose, activeTheme, setTheme, theme }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`w-full max-w-md rounded-2xl backdrop-blur-2xl shadow-2xl overflow-hidden ${theme.card}`}
      >
        <div className={`p-5 border-b flex justify-between items-center ${theme.id === 'dark' ? 'border-white/10' : 'border-gray-200/50'}`}>
          <h3 className={`font-bold ${theme.textMain}`}>Configuration</h3>
          <button onClick={onClose}><X size={20} className={theme.textSub} /></button>
        </div>
        <div className="p-6">
          <label className={`text-xs font-bold uppercase tracking-wide ${theme.textSub} mb-3 block`}>Visual Theme</label>
          <div className="grid grid-cols-1 gap-2">
            {Object.values(THEMES).map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  activeTheme === t.id
                    ? `border-[${theme.primary}] ring-1 ring-[${theme.primary}]`
                    : `border-transparent hover:bg-black/5`
                }`}
                style={{ borderColor: activeTheme === t.id ? theme.primary : 'transparent' }}
              >
                <div className="w-6 h-6 rounded-full border border-black/10 shadow-sm" 
                     style={{ background: t.id === 'midnight' ? '#000' : t.id === 'dark' ? '#0f172a' : '#fff' }} 
                />
                <span className={`text-sm font-medium ${theme.textMain}`}>{t.label}</span>
                {activeTheme === t.id && <Check size={16} className="ml-auto text-green-500" />}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 5. MAIN APP COMPONENT                                                      */
/* -------------------------------------------------------------------------- */

export default function App() {
  const [tab, setTab] = useState('dashboard');
  const [themeId, setThemeId] = useState('modern');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [data, setData] = useState(() => MockEngine.getTopology());
  const [analytics] = useState(() => MockEngine.getAnalytics());
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const fileInputRef = useRef(null);
  
  const theme = useMemo(() => THEMES[themeId], [themeId]);

  const handleFileUpload = useCallback((e) => {
    if (e.target.files?.[0]) {
      setLoading(true);
      setTimeout(() => {
        setData(MockEngine.getTopology(40));
        setLoading(false);
      }, 1500);
    }
  }, []);

  const NAV_LINKS = [
    { id: 'dashboard', label: 'Overview', icon: LayoutGrid },
    { id: 'network', label: 'Graph', icon: Share2 },
    { id: 'data', label: 'Dataset', icon: Database },
  ];

  return (
    <div className={`h-screen w-screen relative overflow-hidden font-sans transition-colors duration-700`}>
      
      {/* A. LIVING BACKGROUND (Fixed z-0) */}
      <BioNetworkBackground theme={theme} />
      
      {/* Gradient Overlay for Readability */}
      <div className={`fixed inset-0 z-[-1] bg-gradient-to-br ${theme.gradient} pointer-events-none`} />

      {/* Hidden Inputs */}
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />

      {/* B. SIDEBAR (Left, z-20) */}
      {/* Fixed: 'motion' is used here to animate sidebar width */}
      <motion.aside 
        initial={false}
        animate={{ width: sidebarOpen ? 260 : 80 }}
        className={`fixed left-0 top-0 bottom-0 z-30 flex flex-col backdrop-blur-xl transition-colors duration-500 ${theme.sidebar}`}
      >
        <div className={`h-20 flex items-center px-6 border-b ${theme.id.includes('dark') ? 'border-white/10' : 'border-gray-200/40'}`}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg mr-3" 
               style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}>
            <Dna size={20} strokeWidth={2.5} />
          </div>
          {sidebarOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col">
              <span className={`font-bold text-xl tracking-tight ${theme.textMain}`}>Helix.AI</span>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${theme.textSub}`}>v4.0 Pro</span>
            </motion.div>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {NAV_LINKS.map(item => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 ${
                tab === item.id 
                  ? `bg-white/20 shadow-sm ${theme.textMain} font-bold` 
                  : `${theme.textSub} hover:bg-white/10`
              }`}
            >
              <item.icon size={22} />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className={`p-4 border-t ${theme.id.includes('dark') ? 'border-white/10' : 'border-gray-200/40'} space-y-2`}>
          <button onClick={() => setShowSettings(true)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${theme.textSub} hover:bg-white/10 transition-colors`}>
            <Settings size={22} />
            {sidebarOpen && <span>Settings</span>}
          </button>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${theme.textSub} hover:bg-white/10 transition-colors`}>
            <Menu size={22} />
            {sidebarOpen && <span>Collapse</span>}
          </button>
        </div>
      </motion.aside>

      {/* C. MAIN CONTENT AREA (Right, z-10) */}
      <motion.div 
        animate={{ paddingLeft: sidebarOpen ? 260 : 80 }}
        className="h-full w-full flex flex-col relative z-10"
      >
        {/* Header */}
        <header className={`h-20 px-8 flex items-center justify-between shrink-0 backdrop-blur-xl transition-colors duration-500 ${theme.nav}`}>
          <h2 className={`text-2xl font-bold capitalize ${theme.textMain} w-1/3`}>{tab}</h2>
          
          {/* BRANDING CENTERPIECE */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
             <div className="flex items-center gap-3">
               <div className="h-[2px] w-12 rounded-full opacity-50" style={{ backgroundColor: theme.primary }} />
               <h1 className={`text-3xl font-black tracking-[0.25em] ${theme.textMain}`} style={{ fontFamily: 'system-ui' }}>SPECTRA</h1>
               <div className="h-[2px] w-12 rounded-full opacity-50" style={{ backgroundColor: theme.primary }} />
             </div>
             <span className={`text-[9px] font-bold uppercase tracking-widest ${theme.textSub} mt-1`}>Biological Network Intelligence</span>
          </div>

          <div className="flex items-center gap-4 justify-end w-1/3">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${theme.id === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white/40 border-white/40'}`}>
              <Search size={16} className={theme.textSub} />
              <input type="text" placeholder="Search genes..." className={`bg-transparent text-sm focus:outline-none w-32 ${theme.textMain}`} />
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-6 py-2.5 text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}
            >
              {loading ? <Activity size={18} className="animate-spin" /> : <UploadCloud size={18} />}
              <span>Import</span>
            </button>
          </div>
        </header>

        {/* Scrollable Workspace */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            
            {/* VIEW: DASHBOARD */}
            {tab === 'dashboard' && (
              <motion.div 
                key="dash"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-12 gap-6 max-w-[1600px] mx-auto"
              >
                <BentoCard delay={1} title="Total Nodes" icon={Share2} theme={theme} className="col-span-3 border-l-4" style={{borderLeftColor: theme.primary}}>
                  <div className="flex items-end gap-2 mt-4">
                    <span className={`text-4xl font-bold ${theme.textMain}`}>1,420</span>
                    <span className="text-xs text-green-500 font-bold bg-green-500/10 px-2 py-1 rounded-full mb-1">Live</span>
                  </div>
                </BentoCard>

                <BentoCard delay={2} title="System Load" icon={Zap} theme={theme} className="col-span-3 border-l-4" style={{borderLeftColor: theme.accent}}>
                   <div className="flex items-end gap-2 mt-4">
                    <span className={`text-4xl font-bold ${theme.textMain}`}>34%</span>
                    <span className={`text-sm ${theme.textSub} mb-1.5`}>Optimal</span>
                  </div>
                </BentoCard>

                <BentoCard delay={3} title="Mutations" icon={Dna} theme={theme} className="col-span-3 border-l-4" style={{borderLeftColor: '#f43f5e'}}>
                  <div className="flex items-end gap-2 mt-4">
                    <span className={`text-4xl font-bold ${theme.textMain}`}>215</span>
                    <span className="text-xs text-red-500 font-bold bg-red-500/10 px-2 py-1 rounded-full mb-1">+12%</span>
                  </div>
                </BentoCard>

                <BentoCard delay={4} title="Status" theme={theme} className="col-span-3">
                   <div className="flex items-center gap-3 h-full pb-2">
                     <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
                     <span className={`text-sm font-bold ${theme.textMain}`}>Engine Online</span>
                   </div>
                </BentoCard>

                <BentoCard delay={5} title="Spectral Analysis" icon={Activity} theme={theme} className="col-span-8 h-[400px]">
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics} margin={{top:10, right:10, left:-20, bottom:0}}>
                        <defs>
                          <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={theme.primary} stopOpacity={0.3}/>
                            <stop offset="100%" stopColor={theme.primary} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.id === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'} />
                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize:12, fill:'#94a3b8'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize:12, fill:'#94a3b8'}} />
                        <Tooltip contentStyle={{ borderRadius:'12px', border:'none', background: theme.id === 'modern' ? '#fff' : '#1e293b' }} />
                        <Area type="monotone" dataKey="val" stroke={theme.primary} strokeWidth={3} fill="url(#grad)" />
                      </AreaChart>
                   </ResponsiveContainer>
                </BentoCard>

                <BentoCard delay={6} title="Shortcuts" theme={theme} className="col-span-4 h-[400px]">
                   <div className="flex flex-col gap-3 h-full">
                      {[
                        { label: 'Import FASTQ', icon: UploadCloud },
                        { label: 'Export Report', icon: FileText }, // FIX: FileText is now defined
                        { label: 'Network Settings', icon: Settings }
                      ].map((act, i) => (
                        <button key={i} className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all hover:scale-[1.02] ${theme.id === 'dark' ? 'border-white/10 hover:bg-white/5' : 'border-white/50 hover:bg-white/60'}`}>
                           <div className={`p-2 rounded-lg ${theme.id === 'dark' ? 'bg-white/5' : 'bg-gray-100'}`}>
                             <act.icon size={18} className={theme.textMain} />
                           </div>
                           <span className={`text-sm font-bold ${theme.textMain}`}>{act.label}</span>
                           <ArrowUpRight size={16} className={`ml-auto ${theme.textSub}`} />
                        </button>
                      ))}
                      
                      <div className={`mt-auto p-4 rounded-xl border ${theme.id === 'dark' ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-indigo-50/50 border-indigo-100'}`}>
                         <div className="flex items-center gap-2 mb-2">
                            <AlertCircle size={16} style={{ color: theme.primary }} />
                            <span className="text-xs font-bold uppercase" style={{ color: theme.primary }}>Pro Tip</span>
                         </div>
                         <p className={`text-xs ${theme.textSub} leading-relaxed`}>
                           Switch to "Network Graph" to view real-time protein interactions.
                         </p>
                      </div>
                   </div>
                </BentoCard>
              </motion.div>
            )}

            {/* VIEW: NETWORK */}
            {tab === 'network' && (
              <motion.div 
                key="net"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className={`h-full w-full max-w-7xl mx-auto rounded-2xl border overflow-hidden relative flex flex-col backdrop-blur-xl ${theme.card}`}
              >
                 <div className={`p-4 border-b flex justify-between items-center ${theme.id === 'dark' ? 'border-white/10' : 'border-white/40'}`}>
                    <div className="flex gap-4">
                       <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${theme.id === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white/40 border-white/40'}`}>
                          <Filter size={14} className={theme.textSub} />
                          <span className={`text-xs font-bold ${theme.textMain}`}>Filter: Hubs Only</span>
                          <ChevronDown size={14} className={theme.textSub} />
                       </div>
                    </div>
                    <button 
                      onClick={() => setData(MockEngine.getTopology(45))}
                      className={`text-xs font-bold px-4 py-2 rounded-lg transition-colors ${theme.id === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-100 hover:bg-slate-200'}`}
                    >
                      Regenerate Layout
                    </button>
                 </div>
                 <div className="flex-1 flex items-center justify-center relative">
                    <div className="text-center">
                       <Layers size={48} className={`mx-auto mb-4 opacity-20 ${theme.textMain}`} />
                       <p className={`text-sm font-bold ${theme.textSub}`}>Interactive Canvas Active</p>
                    </div>
                 </div>
              </motion.div>
            )}

            {/* VIEW: DATA */}
            {tab === 'data' && (
              <motion.div
                 key="data"
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                 className={`h-full w-full max-w-7xl mx-auto rounded-2xl border overflow-hidden backdrop-blur-xl ${theme.card}`}
              >
                <div className="p-0 overflow-auto h-full">
                  <table className="w-full text-left border-collapse">
                    <thead className={`sticky top-0 z-10 ${theme.id === 'dark' ? 'bg-[#1e293b]' : 'bg-gray-50'}`}>
                       <tr>
                         {['ID', 'Gene Name', 'Type', 'Confidence', 'Status'].map(h => (
                           <th key={h} className={`p-4 text-xs font-bold uppercase border-b ${theme.id === 'dark' ? 'border-white/10' : 'border-gray-200'} ${theme.textSub}`}>{h}</th>
                         ))}
                       </tr>
                    </thead>
                    <tbody>
                       {data.nodes.map((n, i) => (
                         <tr key={i} className={`border-b group transition-colors ${theme.id === 'dark' ? 'border-white/5 hover:bg-white/5' : 'border-gray-100 hover:bg-white/40'}`}>
                           <td className={`p-4 text-xs font-mono opacity-60 ${theme.textMain}`}>{n.id}</td>
                           <td className={`p-4 text-sm font-bold ${theme.textMain}`}>{n.label}</td>
                           <td className="p-4">
                             <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${n.type === 'Driver' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500' : 'bg-gray-500/10 border-gray-500/20 text-gray-500'}`}>
                               {n.type}
                             </span>
                           </td>
                           <td className="p-4">
                              <div className={`w-24 h-1.5 rounded-full overflow-hidden ${theme.id === 'dark' ? 'bg-white/10' : 'bg-gray-200'}`}>
                                <div className="h-full" style={{ width: `${n.val * 100}%`, backgroundColor: theme.primary }} />
                              </div>
                           </td>
                           <td className={`p-4 text-xs font-bold ${n.status === 'Mutated' ? 'text-red-500' : 'text-green-500'}`}>
                             {n.status}
                           </td>
                         </tr>
                       ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>

      {/* D. MODALS */}
      <AnimatePresence>
        {showSettings && (
          <SettingsModal 
            isOpen={showSettings} 
            onClose={() => setShowSettings(false)} 
            activeTheme={themeId} 
            setTheme={setThemeId} 
            theme={theme} 
          />
        )}
      </AnimatePresence>

    </div>
  );
}