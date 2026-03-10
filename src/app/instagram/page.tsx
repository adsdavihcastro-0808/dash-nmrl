"use client";

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const chartData = [
    { week: "01 Out", followers: 400 },
    { week: "08 Out", followers: 620 },
    { week: "15 Out", followers: 480 },
    { week: "22 Out", followers: 910 },
    { week: "29 Out", followers: 1200 },
    { week: "30 Out", followers: 800 },
];

const topContent = [
    {
        title: "Estratégias de Growth 2024",
        type: "Reel",
        typeIcon: "movie",
        views: "12.4K",
        rate: "4.8%",
        img: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=200",
    },
    {
        title: "Checklist do Marketing Moral",
        type: "Carrossel",
        typeIcon: "photo_library",
        views: "8.1K",
        rate: "3.2%",
        img: "https://images.unsplash.com/photo-1616469829941-c7200edec809?auto=format&fit=crop&q=80&w=200",
    },
    {
        title: "Por que o Orgânico morreu?",
        type: "Post",
        typeIcon: "image",
        views: "5.9K",
        rate: "2.9%",
        img: "https://images.unsplash.com/photo-1636197883944-6c9e52af9e36?auto=format&fit=crop&q=80&w=200",
    },
];

const kpis = [
    { label: "Follower Growth", value: "+1.284", icon: "person_add", trend: "12.5%", up: true, pct: 66 },
    { label: "Reach", value: "85.2K", icon: "visibility", trend: "8.2%", up: true, pct: 50 },
    { label: "Impressions", value: "124.7K", icon: "bolt", trend: "2.1%", up: false, pct: 75 },
    { label: "Total Engagement", value: "12.4%", icon: "favorite", trend: "0.8%", up: true, pct: 80 },
];

const heatmapWeights = [0.2, 0.7, 0.3, 0.15, 0.9, 0.5, 0.15, 0.2, 0.4, 1.0, 0.6, 0.2, 0.2, 0.2];
const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"];

export default function InstagramPage() {
    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {kpis.map((kpi) => (
                    <div key={kpi.label} className="glass-card rounded-xl p-5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="material-symbols-outlined" style={{ fontSize: 56 }}>{kpi.icon}</span>
                        </div>
                        <p className="text-sm font-medium text-slate-400">{kpi.label}</p>
                        <div className="flex items-end gap-2 mt-2">
                            <h3 className="text-3xl font-extrabold text-white">{kpi.value}</h3>
                            <span className="text-sm font-bold pb-1 flex items-center" style={{ color: kpi.up ? "#C2DF0C" : "#f87171" }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{kpi.up ? "trending_up" : "trending_down"}</span>{kpi.trend}
                            </span>
                        </div>
                        <div className="mt-4 h-1 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                            <div className="h-full rounded-full" style={{ width: `${kpi.pct}%`, background: "#17069d" }}></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Chart + Top Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Bar Chart */}
                <div className="lg:col-span-2 glass-card rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h4 className="text-xl font-bold text-white">Crescimento de Seguidores</h4>
                            <p className="text-sm text-slate-500">Visualização de tendência dos últimos 30 dias</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 rounded-lg text-xs font-bold text-white" style={{ background: "rgba(23,6,157,0.3)", border: "1px solid rgba(23,6,157,0.5)" }}>Geral</button>
                            <button className="px-3 py-1 rounded-lg text-xs font-bold text-slate-500 hover:bg-white/5 transition-colors">Reels</button>
                        </div>
                    </div>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="4" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: "#475569", fontSize: 10 }} dy={8} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#475569", fontSize: 10 }} />
                                <Tooltip contentStyle={{ background: "rgba(10,9,20,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} itemStyle={{ color: "#f1f5f9" }} labelStyle={{ color: "#94a3b8" }} cursor={{ fill: "rgba(23,6,157,0.1)" }} />
                                <Bar dataKey="followers" name="Novos Seguidores" fill="rgba(23,6,157,0.5)" radius={[4, 4, 0, 0]}
                                    onMouseEnter={(d, i, e) => { if (e) (e.target as SVGElement).style.fill = "rgba(194,223,12,0.7)"; }}
                                    onMouseLeave={(d, i, e) => { if (e) (e.target as SVGElement).style.fill = "rgba(23,6,157,0.5)"; }}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Content */}
                <div className="glass-card rounded-xl p-5">
                    <div className="mb-5">
                        <h4 className="text-lg font-bold text-white">Top Conteúdo</h4>
                        <p className="text-sm text-slate-500">Ranking por Engajamento</p>
                    </div>
                    <div className="space-y-3">
                        {topContent.map((post) => (
                            <div key={post.title} className="flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors group hover:bg-white/5" style={{ border: "1px solid transparent" }}>
                                <div className="size-14 rounded-lg overflow-hidden flex-shrink-0 relative">
                                    <img src={post.img} alt={post.title} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "rgba(0,0,0,0.5)" }}>
                                        <span className="material-symbols-outlined text-white" style={{ fontSize: 16 }}>visibility</span>
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-100 truncate">{post.title}</p>
                                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                        <span className="material-symbols-outlined" style={{ fontSize: 12 }}>{post.typeIcon}</span>
                                        {post.type} • {post.views} views
                                    </p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-sm font-bold" style={{ color: "#C2DF0C" }}>{post.rate}</p>
                                    <p className="text-[10px] font-bold uppercase text-slate-600">Taxa</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="mt-5 w-full py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors hover:bg-white/5" style={{ border: "1px solid rgba(194,223,12,0.2)", color: "#C2DF0C" }}>
                        Exportar Ranking
                    </button>
                </div>
            </div>

            {/* Audience + Heatmap */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Donut */}
                <div className="glass-card rounded-xl p-7">
                    <h4 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                        <span className="material-symbols-outlined" style={{ color: "#17069d" }}>pie_chart</span>
                        Distribuição de Público
                    </h4>
                    <div className="flex items-center gap-8">
                        <div className="size-32 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ border: "12px solid #17069d", borderRight: "12px solid #C2DF0C", borderBottom: "12px solid rgba(194,223,12,0.4)" }}>
                            <span className="text-xl font-bold text-white">64%</span>
                        </div>
                        <div className="space-y-4 flex-1">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="size-2 rounded-full" style={{ background: "#17069d" }}></div>
                                    <span className="text-sm text-slate-300">Homens</span>
                                </div>
                                <span className="text-sm font-bold text-white">36%</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="size-2 rounded-full" style={{ background: "#C2DF0C" }}></div>
                                    <span className="text-sm text-slate-300">Mulheres</span>
                                </div>
                                <span className="text-sm font-bold text-white">64%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Heatmap */}
                <div className="glass-card rounded-xl p-7">
                    <h4 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                        <span className="material-symbols-outlined" style={{ color: "#17069d" }}>schedule</span>
                        Melhores Horários
                    </h4>
                    <div className="grid grid-cols-7 gap-1" style={{ gridTemplateRows: "repeat(2, 3rem)" }}>
                        {heatmapWeights.map((w, i) => (
                            <div
                                key={i}
                                className="rounded-sm transition-colors"
                                style={{ background: w > 0.5 ? `rgba(194,223,12,${w})` : "rgba(255,255,255,0.04)", boxShadow: w > 0.8 ? "0 0 10px rgba(194,223,12,0.3)" : "none" }}
                            ></div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-3">
                        {days.map(d => <span key={d} className="text-[10px] font-bold uppercase text-slate-600">{d}</span>)}
                    </div>
                </div>
            </div>
        </div>
    );
}
