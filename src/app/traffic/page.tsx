"use client";

import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, LineChart
} from "recharts";

const chartData = [
    { day: "Seg", conv: 42, cpa: 38 },
    { day: "Ter", conv: 68, cpa: 32 },
    { day: "Qua", conv: 54, cpa: 36 },
    { day: "Qui", conv: 91, cpa: 28 },
    { day: "Sex", conv: 75, cpa: 30 },
    { day: "Sáb", conv: 112, cpa: 22 },
    { day: "Dom", conv: 89, cpa: 25 },
];

const campaigns = [
    {
        status: "ativo",
        name: "[Vendas] Lançamento Março 2024",
        objective: "Conversão",
        reach: "452.109",
        clicks: "12.402",
        conv: "842",
        cost: "R$ 5.420,00",
    },
    {
        status: "ativo",
        name: "[Remarketing] Carrinho Abandonado",
        objective: "Vendas",
        reach: "12.504",
        clicks: "3.120",
        conv: "245",
        cost: "R$ 1.150,00",
    },
    {
        status: "pausado",
        name: "[Topo] Engajamento Vídeo 01",
        objective: "Visualização",
        reach: "842.001",
        clicks: "45.102",
        conv: "--",
        cost: "R$ 3.840,00",
    },
];

const kpis = [
    { label: "CTR Médio", value: "2.45%", icon: "ads_click", trendUp: true, trend: "+12.4%" },
    { label: "CPC Médio", value: "R$ 0.45", icon: "payments", trendUp: true, trend: "-5.2%" },
    { label: "CPM Médio", value: "R$ 12.50", icon: "visibility", trendUp: false, trend: "-2.1%" },
    { label: "Gasto Total", value: "R$ 15.2k", icon: "account_balance_wallet", trendUp: false, trend: "+8.5%" },
    { label: "Impressões", value: "1.2M", icon: "groups", trendUp: true, trend: "+15.3%" },
];

export default function TrafficPage() {
    return (
        <div className="p-8 space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {kpis.map((kpi) => (
                    <div key={kpi.label} className="glass-card rounded-xl p-5 relative overflow-hidden group">
                        <div className="absolute -right-2 -top-2 opacity-5 transition-transform group-hover:scale-110" style={{ color: "#C2DF0C" }}>
                            <span className="material-symbols-outlined" style={{ fontSize: "5rem" }}>{kpi.icon}</span>
                        </div>
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
                        <h3 className="text-3xl font-extrabold text-white">{kpi.value}</h3>
                        <div className="mt-2 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-lg" style={{ color: kpi.trendUp ? "#C2DF0C" : "#ef4444" }}>
                                {kpi.trendUp ? "trending_up" : "trending_down"}
                            </span>
                            <span className="text-xs font-bold" style={{ color: kpi.trendUp ? "#C2DF0C" : "#ef4444" }}>{kpi.trend}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Chart */}
            <div className="glass-card rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h4 className="text-lg font-bold text-white">Performance de Conversão</h4>
                        <p className="text-xs text-slate-500">Acompanhamento diário de Conversões vs. CPA</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="size-3 rounded-full inline-block" style={{ background: "#17069d" }}></span>
                            <span className="text-xs font-medium text-slate-400">Conversões</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="size-3 rounded-full inline-block" style={{ background: "#C2DF0C" }}></span>
                            <span className="text-xs font-medium text-slate-400">Custo por Conv.</span>
                        </div>
                    </div>
                </div>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="gradPrimary" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#17069d" stopOpacity={0.4} />
                                    <stop offset="100%" stopColor="#17069d" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="4" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11, fontWeight: 700 }} dy={8} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                            <Tooltip
                                contentStyle={{ background: "rgba(10,9,20,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                                labelStyle={{ color: "#94a3b8" }}
                                itemStyle={{ color: "#f1f5f9" }}
                            />
                            <Area type="monotone" dataKey="conv" strokeWidth={3} stroke="#17069d" fill="url(#gradPrimary)" name="Conversões" />
                            <Line type="monotone" dataKey="cpa" strokeWidth={2.5} stroke="#C2DF0C" strokeDasharray="8 4" dot={false} name="Custo/Conv." />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Table */}
            <div className="glass-card rounded-xl overflow-hidden">
                <div className="p-6 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    <h4 className="text-lg font-bold text-white">Relatório de Campanhas</h4>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" style={{ fontSize: 16 }}>search</span>
                            <input
                                type="text"
                                placeholder="Filtrar campanhas..."
                                className="pl-9 pr-4 py-2 rounded-lg text-xs text-slate-300 placeholder-slate-600 outline-none"
                                style={{ background: "rgba(23,6,157,0.12)", border: "none", width: 220 }}
                            />
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold" style={{ background: "#C2DF0C", color: "#0A0914" }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>download</span>
                            Exportar CSV
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr style={{ background: "rgba(23,6,157,0.07)" }}>
                                {["Status", "Campanha", "Alcance", "Cliques", "Conv.", "Custo", "Ações"].map((h, i) => (
                                    <th key={h} className={`px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest ${i > 1 ? "text-right" : ""}`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                            {campaigns.map((c, i) => (
                                <tr key={i} className="transition-colors" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(23,6,157,0.07)")}
                                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                                >
                                    <td className="px-6 py-4">
                                        <span className={c.status === "ativo" ? "badge-active" : "badge-paused"}>
                                            <span className="size-1.5 rounded-full inline-block animate-pulse-dot" style={{ background: c.status === "ativo" ? "#C2DF0C" : "#64748b" }}></span>
                                            {c.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-slate-100 max-w-[200px] truncate">{c.name}</p>
                                        <p className="text-[10px] text-slate-500">Objetivo: {c.objective}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-300 text-right">{c.reach}</td>
                                    <td className="px-6 py-4 text-sm text-slate-300 text-right">{c.clicks}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-100 text-right">{c.conv}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-100 text-right">{c.cost}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-slate-500 hover:text-slate-200 transition-colors">
                                            <span className="material-symbols-outlined text-xl">open_in_new</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 flex items-center justify-between" style={{ background: "rgba(23,6,157,0.05)" }}>
                    <p className="text-xs text-slate-500">Exibindo 3 de 42 campanhas</p>
                    <div className="flex gap-1">
                        <button className="size-8 flex items-center justify-center rounded text-slate-400 hover:text-white transition-colors" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                            <span className="material-symbols-outlined text-sm">chevron_left</span>
                        </button>
                        <button className="size-8 flex items-center justify-center rounded text-xs font-bold text-white" style={{ background: "#17069d" }}>1</button>
                        <button className="size-8 flex items-center justify-center rounded text-xs text-slate-400" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>2</button>
                        <button className="size-8 flex items-center justify-center rounded text-slate-400 hover:text-white transition-colors" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                            <span className="material-symbols-outlined text-sm">chevron_right</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
