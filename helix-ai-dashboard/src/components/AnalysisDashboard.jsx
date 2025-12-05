import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Search, User, Activity } from 'lucide-react';

const AnalysisDashboard = ({ theme }) => {
    const [patients, setPatients] = useState([]);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        fetch('/data/patient_results.json')
            .then(res => res.json())
            .then(data => setPatients(data))
            .catch(err => console.log("Waiting for data ingestion...", err));
    }, []);

    const filtered = patients.filter(p => p.patient_id.toLowerCase().includes(filter.toLowerCase()));

    return (
        <div className="flex flex-col gap-4 h-full">
            {/* PROFESSIONAL SEARCH BAR */}
            <div className={`flex items-center p-4 rounded-xl border ${theme.border} ${theme.panelBg} backdrop-blur-md shadow-lg transition-colors duration-500`}>
                <Search className="w-5 h-5 opacity-50 mr-4" />
                <input
                    type="text"
                    placeholder="SEARCH PATIENT UUID / BARCODE..."
                    className={`bg-transparent border-none outline-none text-sm w-full font-mono tracking-wider ${theme.text} placeholder-opacity-30 uppercase`}
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
                <div className={`px-3 py-1 rounded border ${theme.border} text-[10px] font-bold font-mono opacity-60`}>
                    {filtered.length} RECORDS
                </div>
            </div>

            {/* PATIENT LIST */}
            <div className="grid grid-cols-1 gap-3 overflow-y-auto pr-2 custom-scrollbar" style={{ maxHeight: '600px' }}>
                {filtered.map((p, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.02 * (i % 20) }}
                        className={`p-4 rounded-xl border ${theme.border} relative overflow-hidden group ${theme.panelBg} hover:opacity-90 transition-all duration-300`}
                    >
                        <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${theme.border}`} style={{ background: 'rgba(125,125,125,0.1)' }}>
                                    <User size={18} style={{ color: theme.accent }} />
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold opacity-50 tracking-[0.2em] uppercase">Subject ID</div>
                                    <div className={`text-sm font-bold font-mono ${theme.text}`}>{p.patient_id}</div>
                                </div>
                            </div>

                            {/* RISK METER */}
                            <div className="text-right hidden sm:block">
                                <div className="text-[10px] font-bold opacity-50 tracking-wider uppercase">GNN Risk Score</div>
                                <div className="text-lg font-bold font-mono flex items-center justify-end gap-2" style={{ color: p.risk_score > 0 ? theme.primary : theme.secondary }}>
                                    {p.risk_score > 0 ? '+' : ''}{p.risk_score}
                                    <Activity size={12} className="animate-pulse" />
                                </div>
                            </div>

                            {/* STATUS BADGE BUTTON */}
                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold border tracking-wider flex items-center gap-2 shadow-lg
                ${p.risk_group.includes("HIGH")
                                    ? 'bg-red-500/10 border-red-500/50 text-red-500'
                                    : 'bg-green-500/10 border-green-500/50 text-green-500'}`}
                            >
                                {p.risk_group.includes("HIGH") ? <AlertTriangle size={12} /> : <CheckCircle size={12} />}
                                {p.risk_group}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default AnalysisDashboard;
