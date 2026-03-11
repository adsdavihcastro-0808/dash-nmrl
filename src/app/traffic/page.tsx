"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line,
    ComposedChart, Bar
} from "recharts";

/* ── types ── */
type DayRow = {
    day: string;
    total_conversions: number;
    avg_cpa: number;
    avg_roas: number;
    avg_frequency: number;
};
type CampaignRow = {
    campaign_name: string;
    total_spend: number;
    total_impressions: number;
    total_clicks: number;
    total_reach: number;
    total_conversions: number;
    total_leads: number;
    avg_ctr: number;
    avg_cpc: number;
    avg_roas: number;
    avg_cpl: number;
    avg_frequency: number;
    quality_ranking: string | null;
};
type KpiData = {
    avg_ctr: number; avg_cpc: number; avg_cpm: number;
    total_spend: number; total_impressions: number;
    total_clicks: number; total_conversions: number;
    total_leads: number; avg_cpa: number; avg_cpl: number;
    avg_roas: number; avg_frequency: number;
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

const RANKING_COLORS: Record<string, { bg: string; text: string; label: string }> = {
    ABOVE_AVERAGE:        { bg: "rgba(34,197,94,0.15)", text: "#22c55e", label: "Acima" },
    AVERAGE:              { bg: "rgba(234,179,8,0.15)",  text: "#eab308", label: "Média" },
    BELOW_AVERAGE_10:     { bg: "rgba(239,68,68,0.15)",  text: "#ef4444", label: "Abaixo 10%" },
    BELOW_AVERAGE_20:     { bg: "rgba(239,68,68,0.15)",  text: "#ef4444", label: "Abaixo 20%" },
    BELOW_AVERAGE_35:     { bg: "rgba(239,68,68,0.15)",  text: "#ef4444", label: "Abaixo 35%" },
};

function QualityBadge({ ranking }: { ranking: string | null }) {
    if (!ranking) return <span className="text-[10px] text-slate-600">—</span>;
    const style = RANKING_COLORS[ranking] ?? { bg: "rgba(100,116,139,0.15)", text: "#94a3b8", label: ranking };
    return (
        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold"
            style={{ background: style.bg, color: style.text }}>
            {style.label}
        </span>
    );
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

        const kpiPromise = supabase
            .rpc("get_traffic_kpis", { p_since: since })
            .single()
            .then(({ data, error }) => {
                if (error) console.error("KPI error:", error);
                if (data) setKpis(data as KpiData);
            });

        const prevPromise = supabase
            .rpc("get_traffic_kpis", { p_since: prevSince, p_until: since })
            .single()
            .then(({ data, error }) => {
                if (error) console.error("Prev KPI error:", error);
                if (data) setPrevKpis(data as KpiData);
            });

        const chartPromise = supabase
            .rpc("get_traffic_chart", { p_since: since })
            .then(({ data, error }) => {
                if (error) console.error("Chart error:", error);
                setChart(
                    (data ?? []).map((r: DayRow) => ({
                        day: String(r.day).slice(5),
                        total_conversions: Number(r.total_conversions),
                        avg_cpa: Number(r.avg_cpa),
                        avg_roas: Number(r.avg_roas),
                        avg_frequency: Number(r.avg_frequency),
                    }))
                );
            });

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
                        total_leads: Number(r.total_leads),
                        avg_ctr: Number(r.avg_ctr),
                        avg_cpc: Number(r.avg_cpc),
                        avg_roas: Number(r.avg_roas),
                        avg_cpl: Number(r.avg_cpl),
                        avg_frequency: Number(r.avg_frequency),
                        quality_ranking: r.quality_ranking,
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
        { label: "ROAS",        value: `${kpis.avg_roas.toFixed(2)}x`,    icon: "trending_up",           t: trend(kpis.avg_roas, prevKpis?.avg_roas ?? 0) },
        { label: "Gasto Total", value: formatCurrency(kpis.total_spend),  icon: "account_balance_wallet", t: trend(kpis.total_spend, prevKpis?.total_spend ?? 0) },
        { label: "Conversões",  value: formatNum(kpis.total_conversions), icon: "shopping_cart",          t: trend(kpis.total_conversions, prevKpis?.total_conversions ?? 0) },
        { label: "CPA",         value: formatCurrency(kpis.avg_cpa),      icon: "payments",              t: trend(kpis.avg_cpa, prevKpis?.avg_cpa ?? 0, true) },
        { label: "Leads",       value: formatNum(kpis.total_leads),       icon: "person_add",            t: trend(kpis.total_leads, prevKpis?.total_leads ?? 0) },
        { label: "CPL",         value: formatCurrency(kpis.avg_cpl),      icon: "price_check",           t: trend(kpis.avg_cpl, prevKpis?.avg_cpl ?? 0, true) },
        { label: "CTR Médio",   value: `${kpis.avg_ctr.toFixed(2)}%`,    icon: "ads_click",             t: trend(kpis.avg_ctr, prevKpis?.avg_ctr ?? 0) },
        { label: "CPC Médio",   value: formatCurrency(kpis.avg_cpc),     icon: "touch_app",             t: trend(kpis.avg_cpc, prevKpis?.avg_cpc ?? 0, true) },
    ] : [];

    const PeriodSelector = () => (
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
    );

    return (
        <div className="p-8 space-y-8">
            {/* ── KPI Cards ── */}
            <div className="flex items-center justify-between mb-2">
                <div />
                <PeriodSelector />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {loading
                    ? Array.from({ length: 8 }).map((_, i) => (
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

            {/* ── Charts ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart 1: Conversões + CPA */}
                <div className="glass-card rounded-xl p-6">
                    <div className="mb-6">
                        <h4 className="text-lg font-bold text-white">Conversões vs CPA</h4>
                        <p className="text-xs text-slate-500">Conversões diárias e custo por conversão</p>
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-2">
                            <span className="size-3 rounded-full inline-block" style={{ background: "#17069d" }}></span>
                            <span className="text-xs text-slate-400">Conversões</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="size-3 rounded-full inline-block" style={{ background: "#C2DF0C" }}></span>
                            <span className="text-xs text-slate-400">CPA (R$)</span>
                        </div>
                    </div>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chart} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gradPrimary" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#17069d" stopOpacity={0.4} />
                                        <stop offset="100%" stopColor="#17069d" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="4" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 10, fontWeight: 700 }} dy={8} />
                                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 10 }} />
                                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 10 }} />
                                <Tooltip
                                    contentStyle={{ background: "rgba(10,9,20,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                                    labelStyle={{ color: "#94a3b8" }}
                                    itemStyle={{ color: "#f1f5f9" }}
                                />
                                <Bar yAxisId="left" dataKey="total_conversions" name="Conversões" fill="#17069d" radius={[4, 4, 0, 0]} opacity={0.7} />
                                <Line yAxisId="right" type="monotone" dataKey="avg_cpa" name="CPA (R$)" strokeWidth={2.5} stroke="#C2DF0C" dot={false} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Chart 2: ROAS + Frequência */}
                <div className="glass-card rounded-xl p-6">
                    <div className="mb-6">
                        <h4 className="text-lg font-bold text-white">ROAS vs Frequência</h4>
                        <p className="text-xs text-slate-500">Retorno sobre investimento e saturação de audiência</p>
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-2">
                            <span className="size-3 rounded-full inline-block" style={{ background: "#22c55e" }}></span>
                            <span className="text-xs text-slate-400">ROAS</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="size-3 rounded-full inline-block" style={{ background: "#f97316" }}></span>
                            <span className="text-xs text-slate-400">Frequência</span>
                        </div>
                    </div>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chart} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gradRoas" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="4" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 10, fontWeight: 700 }} dy={8} />
                                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 10 }} />
                                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 10 }} />
                                <Tooltip
                                    contentStyle={{ background: "rgba(10,9,20,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                                    labelStyle={{ color: "#94a3b8" }}
                                    itemStyle={{ color: "#f1f5f9" }}
                                />
                                <Area yAxisId="left" type="monotone" dataKey="avg_roas" name="ROAS" strokeWidth={2.5} stroke="#22c55e" fill="url(#gradRoas)" />
                                <Line yAxisId="right" type="monotone" dataKey="avg_frequency" name="Frequência" strokeWidth={2.5} stroke="#f97316" strokeDasharray="6 3" dot={false} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* ── Campaign Table ── */}
            <div className="glass-card rounded-xl overflow-hidden">
                <div className="p-6 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    <h4 className="text-lg font-bold text-white">Relatório de Campanhas</h4>
                    <span className="text-xs text-slate-500">Top 10 por gasto • {period}</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr style={{ background: "rgba(23,6,157,0.07)" }}>
                                {["Campanha", "Alcance", "Cliques", "Conv.", "Leads", "CTR", "CPC", "ROAS", "Freq.", "Qualidade", "Gasto"].map((h, i) => (
                                    <th key={h} className={`px-4 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest ${i > 0 ? "text-right" : ""}`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading
                                ? Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                                        <td className="px-4 py-4" colSpan={11}>
                                            <div className="h-4 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.05)" }}></div>
                                        </td>
                                    </tr>
                                ))
                                : campaigns.map((c, i) => {
                                    const name = c.campaign_name;
                                    const freqWarning = c.avg_frequency > 3;
                                    return (
                                        <tr key={i} className="transition-colors"
                                            style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
                                            onMouseEnter={e => (e.currentTarget.style.background = "rgba(23,6,157,0.07)")}
                                            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                                        >
                                            <td className="px-4 py-4 max-w-[200px]">
                                                <p className="font-bold text-slate-100 text-xs truncate" title={c.campaign_name}>{name}</p>
                                                <p className="text-[10px] text-slate-500 mt-0.5">{formatNum(c.total_impressions)} impressões</p>
                                            </td>
                                            <td className="px-4 py-4 text-xs text-slate-300 text-right">{formatNum(c.total_reach)}</td>
                                            <td className="px-4 py-4 text-xs text-slate-300 text-right">{formatNum(c.total_clicks)}</td>
                                            <td className="px-4 py-4 text-xs font-bold text-slate-100 text-right">{c.total_conversions}</td>
                                            <td className="px-4 py-4 text-xs text-slate-300 text-right">{c.total_leads}</td>
                                            <td className="px-4 py-4 text-xs text-right" style={{ color: "#C2DF0C" }}>{c.avg_ctr.toFixed(2)}%</td>
                                            <td className="px-4 py-4 text-xs text-slate-300 text-right">{formatCurrency(c.avg_cpc)}</td>
                                            <td className="px-4 py-4 text-xs font-bold text-right" style={{ color: c.avg_roas >= 1 ? "#22c55e" : "#ef4444" }}>
                                                {c.avg_roas.toFixed(2)}x
                                            </td>
                                            <td className="px-4 py-4 text-xs text-right" style={{ color: freqWarning ? "#f97316" : "#94a3b8" }}>
                                                {c.avg_frequency.toFixed(1)}
                                                {freqWarning && <span className="material-symbols-outlined text-xs ml-1 align-middle" style={{ color: "#f97316", fontSize: 14 }}>warning</span>}
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <QualityBadge ranking={c.quality_ranking} />
                                            </td>
                                            <td className="px-4 py-4 text-xs font-bold text-white text-right">{formatCurrency(c.total_spend)}</td>
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
