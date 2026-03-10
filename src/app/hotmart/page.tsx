"use client";

import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const chartData = [
    { date: "01 Abr", vendas: 3800, proj: 4000 },
    { date: "07 Abr", vendas: 5200, proj: 5000 },
    { date: "14 Abr", vendas: 4100, proj: 4500 },
    { date: "21 Abr", vendas: 7200, proj: 6000 },
    { date: "30 Abr", vendas: 8400, proj: 7500 },
];

const offers = [
    { name: "Mentoria Master", value: "R$ 82.400,00", pct: 75 },
    { name: "Curso Express", value: "R$ 45.100,00", pct: 45 },
    { name: "Ebook Low Ticket", value: "R$ 12.800,00", pct: 25 },
    { name: "Workshop Ao Vivo", value: "R$ 12.100,00", pct: 22 },
];

const events = [
    { status: "aprovada", client: "Ricardo Santos", email: "ricardo@email.com", product: "Mentoria Master V2", value: "R$ 1.997,00", date: "Hoje, 14:20" },
    { status: "aguardando", client: "Ana Paula Lima", email: "ana.paula@email.com", product: "Curso Express", value: "R$ 497,00", date: "Hoje, 11:05" },
    { status: "chargeback", client: "Felipe Oliveira", email: "felipe.o@email.com", product: "Mentoria Master V2", value: "R$ 1.997,00", date: "Ontem, 18:45" },
    { status: "reembolso", client: "Beatriz G.", email: "beatriz.g@email.com", product: "Ebook Low Ticket", value: "R$ 97,00", date: "22 Abr, 09:12" },
];

const kpis = [
    { label: "Total de Vendas", value: "1.284", badge: "+12%", lime: true },
    { label: "Receita Bruta", value: "R$ 152.4K", badge: "+8%", lime: true },
    { label: "Receita Líquida", value: "R$ 138.2K", badge: "+7.9%", lime: true, highlight: true },
    { label: "Reembolsos", value: "12", sub: "R$ 1.400,00", badge: "-2%", lime: false },
    { label: "Comissão Acumul.", value: "R$ 42.1K", badge: "+10%", lime: true, accentText: true },
];

const statusBadge: Record<string, string> = {
    aprovada: "badge-approved",
    aguardando: "badge-pending",
    chargeback: "badge-chargeback",
    reembolso: "badge-refund",
};
const statusLabel: Record<string, string> = {
    aprovada: "Aprovada", aguardando: "Aguardando", chargeback: "Chargeback", reembolso: "Reembolso",
};

export default function HotmartPage() {
    return (
        <div className="p-8 space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {kpis.map((k) => (
                    <div key={k.label} className="glass-card rounded-xl p-5 flex flex-col gap-2 relative overflow-hidden group" style={k.highlight ? { borderLeft: "3px solid #17069d" } : {}}>
                        <div className="absolute -right-4 -top-4 size-16 rounded-full blur-2xl transition-all group-hover:opacity-80" style={{ background: "rgba(23,6,157,0.25)" }}></div>
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">{k.label}</span>
                        <div className="flex items-end justify-between">
                            <div className="flex flex-col">
                                <span className="text-2xl font-bold" style={k.accentText ? { color: "#C2DF0C" } : {}}>{k.value}</span>
                                {k.sub && <span className="text-[10px] text-slate-500">{k.sub}</span>}
                            </div>
                            <span className="text-xs font-bold flex items-center gap-1 px-2 py-0.5 rounded-full mb-1"
                                style={{ color: k.lime ? "#C2DF0C" : "#f87171", background: k.lime ? "rgba(194,223,12,0.1)" : "rgba(239,68,68,0.1)" }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 12 }}>{k.lime ? "trending_up" : "trending_down"}</span>
                                {k.badge}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Chart + Offers */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Area Chart */}
                <div className="lg:col-span-2 glass-card rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-white">Evolução Financeira</h3>
                            <p className="text-xs text-slate-500">Fluxo de caixa diário nos últimos 30 dias</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2"><span className="size-2 rounded-full inline-block" style={{ background: "#C2DF0C" }}></span><span className="text-[10px] text-slate-400 uppercase">Vendas</span></div>
                            <div className="flex items-center gap-2"><span className="size-2 rounded-full inline-block" style={{ background: "#17069d" }}></span><span className="text-[10px] text-slate-400 uppercase">Projeção</span></div>
                        </div>
                    </div>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gradLime" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#C2DF0C" stopOpacity={0.25} />
                                        <stop offset="100%" stopColor="#C2DF0C" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="4" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#475569", fontSize: 10 }} dy={8} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#475569", fontSize: 10 }} />
                                <Tooltip contentStyle={{ background: "rgba(10,9,20,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} itemStyle={{ color: "#f1f5f9" }} labelStyle={{ color: "#94a3b8" }} />
                                <Area type="monotone" dataKey="vendas" strokeWidth={3} stroke="#C2DF0C" fill="url(#gradLime)" name="Vendas" />
                                <Area type="monotone" dataKey="proj" strokeWidth={2} stroke="#17069d" fill="none" strokeDasharray="5 5" name="Projeção" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Offer Performance */}
                <div className="glass-card rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6">Performance por Oferta</h3>
                    <div className="space-y-5">
                        {offers.map((o) => (
                            <div key={o.name} className="space-y-2">
                                <div className="flex justify-between text-xs font-medium">
                                    <span className="text-slate-300">{o.name}</span>
                                    <span style={{ color: "#C2DF0C" }}>{o.value}</span>
                                </div>
                                <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                                    <div className="h-full rounded-full transition-all" style={{ width: `${o.pct}%`, background: "#C2DF0C" }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-8 py-2 rounded-xl text-xs font-bold transition-all hover:brightness-110" style={{ border: "1px solid rgba(194,223,12,0.25)", color: "#C2DF0C" }}>
                        Ver Todos os Detalhes
                    </button>
                </div>
            </div>

            {/* Events Table */}
            <div className="glass-card rounded-xl overflow-hidden">
                <div className="p-6 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <h3 className="text-lg font-bold text-white">Eventos Recentes</h3>
                    <button className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
                        Exportar CSV <span className="material-symbols-outlined" style={{ fontSize: 16 }}>download</span>
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="text-[10px] text-slate-500 uppercase tracking-widest font-bold" style={{ background: "rgba(23,6,157,0.07)" }}>
                                {["Status", "Cliente", "Produto", "Valor", "Data", "Ações"].map(h => (
                                    <th key={h} className="px-6 py-4">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {events.map((ev, i) => (
                                <tr key={i} className="transition-colors"
                                    style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
                                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(23,6,157,0.07)")}
                                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                                >
                                    <td className="px-6 py-4">
                                        <span className={statusBadge[ev.status]}>
                                            <span className="size-1.5 rounded-full inline-block" style={{ background: "currentColor" }}></span>
                                            {statusLabel[ev.status]}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-100 text-sm">{ev.client}</div>
                                        <div className="text-[10px] text-slate-500">{ev.email}</div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-300 text-sm">{ev.product}</td>
                                    <td className="px-6 py-4 font-bold text-sm" style={{ color: ev.status === "chargeback" ? "#f87171" : ev.status === "aprovada" ? "#C2DF0C" : "#f1f5f9" }}>{ev.value}</td>
                                    <td className="px-6 py-4 text-slate-500 text-xs">{ev.date}</td>
                                    <td className="px-6 py-4">
                                        <button className="text-slate-500 hover:text-white transition-colors">
                                            <span className="material-symbols-outlined">more_vert</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
