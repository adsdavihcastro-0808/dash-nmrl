"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line
} from "recharts";

/* ── types ── */
type DayRow = { day: string; total_conversions: number; avg_cpa: number };
type CampaignRow = {
    campaign_name: string;
    total_spend: number;
    total_impressions: number;
    total_clicks: number;
    total_reach: number;
    total_conversions: number;
    avg_ctr: number;
    avg_cpc: number;
};
type KpiData = {
    avg_ctr: number; avg_cpc: number; avg_cpm: number;
    total_spend: number; total_impressions: number;
    total_clicks: number; total_conversions: number;
};

const PERIODS = ["7d", "30d", "90d"];

function formatCurrency(v: number) {
    return `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function formatNum(v: number) {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
    return String(Math.round(v));
}
function periodToDays(p: string) {
    return p === "7d" ? 7 : p === "30d" ? 30 : 90;
}
function dateSince(days: number) {
    return new Date(Date.now() - days * 86400000).toISOString().split("T")[0];
}

export default function TrafficPage() {
    const [period, setPeriod] = useState("30d");
    const [kpis, setKpis] = useState<KpiData | null>(null);
    const [prevKpis, setPrevKpis] = useState<KpiData | null>(null);
    const [chart, setChart] = useState<DayRow[]>([]);
    const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const days = periodToDays(period);
        const since = dateSince(days);
        const prevSince = dateSince(days * 2);

        // KPIs — current period
        const kpiPromise = supabase
            .rpc("get_traffic_kpis", { p_since: since })
            .single()
            .then(({ data, error }) => {
                if (error) console.error("KPI error:", error);
                if (data) setKpis(data as KpiData);
            });

        // KPIs — previous period (for trend comparison)
        const prevPromise = supabase
            .rpc("get_traffic_kpis", { p_since: prevSince, p_until: since })
            .single()
            .then(({ data, error }) => {
                if (error) console.error("Prev KPI error:", error);
                if (data) setPrevKpis(data as KpiData);
            });

        // Chart — daily conversions + CPA
        const chartPromise = supabase
            .rpc("get_traffic_chart", { p_since: since })
            .then(({ data, error }) => {
                if (error) console.error("Chart error:", error);
                setChart(
                    (data ?? []).map((r: DayRow) => ({
                        day: String(r.day).slice(5), // MM-DD
                        total_conversions: Number(r.total_conversions),
                        avg_cpa: Number(r.avg_cpa),
                    }))
                );
            });

        // Campaign table
        const campPromise = supabase
            .rpc("get_traffic_campaigns", { p_since: since, p_limit: 10 })
            .then(({ data, error }) => {
                if (error) console.error("Campaigns error:", error);
                setCampaigns(
                    (data ?? []).map((r: CampaignRow) => ({
                        campaign_name: r.campaign_name,
                        total_spend: Number(r.total_spend),
                        total_impressions: Number(r.total_impressions),
                        total_clicks: Number(r.total_clicks),
                        total_reach: Number(r.total_reach),
                        total_conversions: Number(r.total_conversions),
                        avg_ctr: Number(r.avg_ctr),
                        avg_cpc: Number(r.avg_cpc),
                    }))
                );
            });

        Promise.all([kpiPromise, prevPromise, chartPromise, campPromise]).then(() => {
            setLoading(false);
        });
    }, [period]);

    function trend(cur: number, prev: number, lowerIsBetter = false) {
        if (!prev) return { pct: "—", up: true };
        const d = ((cur - prev) / prev) * 100;
        const up = lowerIsBetter ? d <= 0 : d >= 0;
        return { pct: `${d > 0 ? "+" : ""}${d.toFixed(1)}%`, up };
    }

    const kpiCards = kpis ? [
        { label: "CTR Médio", value: `${kpis.avg_ctr.toFixed(2)}%`, icon: "ads_click", t: trend(kpis.avg_ctr, prevKpis?.avg_ctr ?? 0) },
        { label: "CPC Médio", value: formatCurrency(kpis.avg_cpc), icon: "payments", t: trend(kpis.avg_cpc, prevKpis?.avg_cpc ?? 0, true) },
        { label: "CPM Médio", value: formatCurrency(kpis.avg_cpm), icon: "visibility", t: trend(kpis.avg_cpm, prevKpis?.avg_cpm ?? 0, true) },
        { label: "Gasto Total", value: formatCurrency(kpis.total_spend), icon: "account_balance_wallet", t: trend(kpis.total_spend, prevKpis?.total_spend ?? 0) },
        { label: "Impressões", value: formatNum(kpis.total_impressions), icon: "groups", t: trend(kpis.total_impressions, prevKpis?.total_impressions ?? 0) },
    ] : [];

    return (
        <div className="p-8 space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {loading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="glass-card rounded-xl p-5 animate-pulse">
                            <div className="h-3 w-20 rounded mb-3" style={{ background: "rgba(255,255,255,0.06)" }}></div>
                            <div className="h-8 w-28 rounded mb-2" style={{ background: "rgba(255,255,255,0.06)" }}></div>
                            <div className="h-3 w-12 rounded" style={{ background: "rgba(255,255,255,0.04)" }}></div>
                        </div>
                    ))
                    : kpiCards.map((kpi) => (
                        <div key={kpi.label} className="glass-card rounded-xl p-5 relative overflow-hidden group">
                            <div className="absolute -right-2 -top-2 opacity-5 group-hover:opacity-10 transition-opacity">
                                <span className="material-symbols-outlined" style={{ fontSize: "5rem" }}>{kpi.icon}</span>
                            </div>
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
                            <h3 className="text-2xl font-extrabold text-white">{kpi.value}</h3>
                            <div className="mt-2 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-lg" style={{ color: kpi.t.up ? "#C2DF0C" : "#ef4444" }}>
                                    {kpi.t.up ? "trending_up" : "trending_down"}
                                </span>
                                <span className="text-xs font-bold" style={{ color: kpi.t.up ? "#C2DF0C" : "#ef4444" }}>{kpi.t.pct}</span>
                                <span className="text-[10px] text-slate-600">vs período anterior</span>
                            </div>
                        </div>
                    ))
                }
            </div>

            {/* Chart */}
            <div className="glass-card rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h4 className="text-lg font-bold text-white">Performance de Conversão</h4>
                        <p className="text-xs text-slate-500">Conversões diárias vs. Custo por Conversão</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-4 mr-4">
                            <div className="flex items-center gap-2">
                                <span className="size-3 rounded-full inline-block" style={{ background: "#17069d" }}></span>
                                <span className="text-xs text-slate-400">Conversões</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="size-3 rounded-full inline-block" style={{ background: "#C2DF0C" }}></span>
                                <span className="text-xs text-slate-400">CPA</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: "rgba(23,6,157,0.15)" }}>
                            {PERIODS.map(p => (
                                <button key={p}
                                    onClick={() => setPeriod(p)}
                                    className="px-3 py-1 text-xs font-bold rounded-md transition-all"
                                    style={period === p
                                        ? { background: "#17069d", color: "#fff" }
                                        : { color: "#64748b", background: "transparent" }
                                    }
                                >{p}</button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chart} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="gradPrimary" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#17069d" stopOpacity={0.4} />
                                    <stop offset="100%" stopColor="#17069d" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="4" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 10, fontWeight: 700 }} dy={8} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 10 }} />
                            <Tooltip
                                contentStyle={{ background: "rgba(10,9,20,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                                labelStyle={{ color: "#94a3b8" }}
                                itemStyle={{ color: "#f1f5f9" }}
                            />
                            <Area type="monotone" dataKey="total_conversions" name="Conversões" strokeWidth={3} stroke="#17069d" fill="url(#gradPrimary)" />
                            <Line type="monotone" dataKey="avg_cpa" name="CPA médio (R$)" strokeWidth={2.5} stroke="#C2DF0C" strokeDasharray="8 4" dot={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Table */}
            <div className="glass-card rounded-xl overflow-hidden">
                <div className="p-6 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    <h4 className="text-lg font-bold text-white">Relatório de Campanhas</h4>
                    <span className="text-xs text-slate-500">Top 10 por gasto • {period}</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr style={{ background: "rgba(23,6,157,0.07)" }}>
                                {["Campanha", "Alcance", "Cliques", "Conv.", "CTR", "CPC", "Gasto"].map((h, i) => (
                                    <th key={h} className={`px-5 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest ${i > 0 ? "text-right" : ""}`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading
                                ? Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                                        <td className="px-5 py-4" colSpan={7}>
                                            <div className="h-4 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.05)" }}></div>
                                        </td>
                                    </tr>
                                ))
                                : campaigns.map((c, i) => {
                                    const name = c.campaign_name.replace(/\[[^\]]+\]/g, "").trim() || c.campaign_name;
                                    return (
                                        <tr key={i} className="transition-colors"
                                            style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
                                            onMouseEnter={e => (e.currentTarget.style.background = "rgba(23,6,157,0.07)")}
                                            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                                        >
                                            <td className="px-5 py-4 max-w-[220px]">
                                                <p className="font-bold text-slate-100 text-xs truncate" title={c.campaign_name}>{name}</p>
                                                <p className="text-[10px] text-slate-500 mt-0.5">{formatNum(c.total_impressions)} impressões</p>
                                            </td>
                                            <td className="px-5 py-4 text-xs text-slate-300 text-right">{formatNum(c.total_reach)}</td>
                                            <td className="px-5 py-4 text-xs text-slate-300 text-right">{formatNum(c.total_clicks)}</td>
                                            <td className="px-5 py-4 text-xs font-bold text-slate-100 text-right">{c.total_conversions}</td>
                                            <td className="px-5 py-4 text-xs text-right" style={{ color: "#C2DF0C" }}>{c.avg_ctr.toFixed(2)}%</td>
                                            <td className="px-5 py-4 text-xs text-slate-300 text-right">{formatCurrency(c.avg_cpc)}</td>
                                            <td className="px-5 py-4 text-xs font-bold text-white text-right">{formatCurrency(c.total_spend)}</td>
                                        </tr>
                                    );
                                })
                            }
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-3 flex justify-between items-center" style={{ background: "rgba(23,6,157,0.05)" }}>
                    <p className="text-xs text-slate-500">Dados reais do período de <strong className="text-slate-300">{period}</strong></p>
                    <span className="text-[10px] text-slate-600">via Supabase • facebook_ads_insights</span>
                </div>
            </div>
        </div>
    );
}
