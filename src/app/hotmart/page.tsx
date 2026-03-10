"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

/* ── types ── */
type DayRow = { date: string; vendas: number; };
type Transaction = {
    transaction_id: string;
    status: string;
    buyer_name: string;
    buyer_email: string;
    product_name: string;
    price_value: number;
    net_value: number;
    commission_value: number;
    hotmart_fee: number;
    order_date: string;
    payment_type: string;
};
type OfferRow = { product_name: string; total: number; count: number };
type KpiData = {
    total_sales: number;
    gross_revenue: number;
    net_revenue: number;
    refunds: number;
    refund_amount: number;
    commission: number;
};

const PERIODS = ["7d", "30d", "90d"];

function formatCurrency(v: number) {
    return `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function periodToDays(p: string) { return p === "7d" ? 7 : p === "30d" ? 30 : 90; }

const STATUS_LABEL: Record<string, string> = {
    APPROVED: "Aprovada", COMPLETE: "Aprovada", COMPLETED: "Aprovada",
    WAITING_PAYMENT: "Aguardando", BILLET_PRINTED: "Aguardando",
    REFUNDED: "Reembolso", CANCELLED: "Cancelada",
    CHARGEBACK: "Chargeback", CHARGEDBACK: "Chargeback",
};
const STATUS_CLASS: Record<string, string> = {
    Aprovada: "badge-approved", Aguardando: "badge-pending",
    Reembolso: "badge-refund", Cancelada: "badge-refund", Chargeback: "badge-chargeback",
};

export default function HotmartPage() {
    const [period, setPeriod] = useState("30d");
    const [kpis, setKpis] = useState<KpiData | null>(null);
    const [chart, setChart] = useState<DayRow[]>([]);
    const [offers, setOffers] = useState<OfferRow[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const days = periodToDays(period);
        const since = new Date(Date.now() - days * 86400000).toISOString();

        // KPIs
        supabase
            .from("hotmart_transactions")
            .select("status, price_value, net_value, hotmart_fee, commission_value, order_date")
            .gte("order_date", since)
            .then(({ data }) => {
                if (!data) return;
                const approved = data.filter(r => ["APPROVED", "COMPLETE", "COMPLETED"].includes(r.status));
                const refunded = data.filter(r => ["REFUNDED", "CANCELLED"].includes(r.status));
                setKpis({
                    total_sales: approved.length,
                    gross_revenue: approved.reduce((s, r) => s + Number(r.price_value ?? 0), 0),
                    net_revenue: approved.reduce((s, r) => s + Number(r.net_value ?? 0), 0),
                    refunds: refunded.length,
                    refund_amount: refunded.reduce((s, r) => s + Number(r.price_value ?? 0), 0),
                    commission: approved.reduce((s, r) => s + Number(r.commission_value ?? 0), 0),
                });
                setLoading(false);

                // Chart — daily revenue
                const byDay = new Map<string, number>();
                approved.forEach(r => {
                    const d = (r.order_date as string).slice(0, 10);
                    byDay.set(d, (byDay.get(d) ?? 0) + Number(r.price_value ?? 0));
                });
                setChart(
                    Array.from(byDay.entries())
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([date, vendas]) => ({ date: date.slice(5), vendas }))
                );
            });

        // Offers performance
        supabase
            .from("hotmart_transactions")
            .select("product_name, price_value, status")
            .gte("order_date", since)
            .in("status", ["APPROVED", "COMPLETE", "COMPLETED"])
            .then(({ data }) => {
                const map = new Map<string, { total: number; count: number }>();
                data?.forEach(r => {
                    const cur = map.get(r.product_name ?? "Desconhecido") ?? { total: 0, count: 0 };
                    map.set(r.product_name ?? "Desconhecido", { total: cur.total + Number(r.price_value ?? 0), count: cur.count + 1 });
                });
                setOffers(
                    Array.from(map.entries())
                        .map(([product_name, v]) => ({ product_name, ...v }))
                        .sort((a, b) => b.total - a.total)
                        .slice(0, 5)
                );
            });

        // Recent transactions
        supabase
            .from("hotmart_transactions")
            .select("transaction_id, status, buyer_name, buyer_email, product_name, price_value, net_value, commission_value, hotmart_fee, order_date, payment_type")
            .gte("order_date", since)
            .order("order_date", { ascending: false })
            .limit(10)
            .then(({ data }) => {
                setTransactions((data ?? []) as Transaction[]);
            });
    }, [period]);

    const maxOffer = Math.max(...offers.map(o => o.total), 1);

    const kpiCards = kpis ? [
        { label: "Total Aprovadas", value: String(kpis.total_sales), sub: undefined, lime: true },
        { label: "Receita Bruta", value: formatCurrency(kpis.gross_revenue), sub: undefined, lime: true },
        { label: "Receita Líquida", value: formatCurrency(kpis.net_revenue), sub: undefined, lime: true, highlight: true },
        { label: "Reembolsos", value: String(kpis.refunds), sub: formatCurrency(kpis.refund_amount), lime: false },
        { label: "Comissão Total", value: formatCurrency(kpis.commission), sub: undefined, lime: true, accent: true },
    ] : [];

    return (
        <div className="p-8 space-y-8">
            {/* Period filter */}
            <div className="flex justify-end">
                <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: "rgba(23,6,157,0.15)" }}>
                    {PERIODS.map(p => (
                        <button key={p} onClick={() => setPeriod(p)}
                            className="px-4 py-1.5 text-xs font-bold rounded-md transition-all"
                            style={period === p ? { background: "#17069d", color: "#fff" } : { color: "#64748b" }}
                        >{p}</button>
                    ))}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {loading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="glass-card rounded-xl p-5 animate-pulse">
                            <div className="h-3 w-20 rounded mb-3" style={{ background: "rgba(255,255,255,0.06)" }}></div>
                            <div className="h-8 w-28 rounded" style={{ background: "rgba(255,255,255,0.06)" }}></div>
                        </div>
                    ))
                    : kpiCards.map((k) => (
                        <div key={k.label} className="glass-card rounded-xl p-5 flex flex-col gap-2 relative overflow-hidden group"
                            style={k.highlight ? { borderLeft: "3px solid #17069d" } : {}}>
                            <div className="absolute -right-4 -top-4 size-16 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-all" style={{ background: "rgba(23,6,157,0.25)" }}></div>
                            <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">{k.label}</span>
                            <span className="text-2xl font-bold" style={k.accent ? { color: "#C2DF0C" } : {}}>{k.value}</span>
                            {k.sub && <span className="text-[10px] text-slate-500">{k.sub}</span>}
                            <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs" style={{ color: k.lime ? "#C2DF0C" : "#f87171" }}>
                                    {k.lime ? "trending_up" : "trending_down"}
                                </span>
                                <span className="text-xs font-bold" style={{ color: k.lime ? "#C2DF0C" : "#f87171" }}>
                                    {k.lime ? "crescimento" : "atenção"}
                                </span>
                            </div>
                        </div>
                    ))
                }
            </div>

            {/* Chart + Offers */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-card rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-white">Evolução de Receita</h3>
                            <p className="text-xs text-slate-500">Faturamento bruto aprovado por dia</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="size-2 rounded-full" style={{ background: "#C2DF0C" }}></div>
                            <span className="text-xs text-slate-400">Receita Bruta</span>
                        </div>
                    </div>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chart} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gradLime" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#C2DF0C" stopOpacity={0.25} />
                                        <stop offset="100%" stopColor="#C2DF0C" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="4" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#475569", fontSize: 10 }} dy={8} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#475569", fontSize: 10 }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}K`} />
                                <Tooltip
                                    contentStyle={{ background: "rgba(10,9,20,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                                    formatter={(v: number | string | undefined) => [typeof v === "number" ? formatCurrency(v) : v, "Receita"]}
                                    labelStyle={{ color: "#94a3b8" }}
                                />
                                <Area type="monotone" dataKey="vendas" name="Receita" strokeWidth={3} stroke="#C2DF0C" fill="url(#gradLime)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Offers */}
                <div className="glass-card rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6">Performance por Produto</h3>
                    <div className="space-y-5">
                        {loading
                            ? Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="space-y-2 animate-pulse">
                                    <div className="h-3 w-full rounded" style={{ background: "rgba(255,255,255,0.06)" }}></div>
                                    <div className="h-1.5 w-full rounded-full" style={{ background: "rgba(255,255,255,0.04)" }}></div>
                                </div>
                            ))
                            : offers.map((o) => (
                                <div key={o.product_name} className="space-y-2">
                                    <div className="flex justify-between text-xs font-medium">
                                        <span className="text-slate-300 truncate max-w-[150px]" title={o.product_name}>{o.product_name}</span>
                                        <span style={{ color: "#C2DF0C" }}>{formatCurrency(o.total)}</span>
                                    </div>
                                    <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                                        <div className="h-full rounded-full" style={{ width: `${(o.total / maxOffer) * 100}%`, background: "#C2DF0C" }}></div>
                                    </div>
                                    <p className="text-[10px] text-slate-600">{o.count} vendas</p>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="glass-card rounded-xl overflow-hidden">
                <div className="p-6 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <h3 className="text-lg font-bold text-white">Transações Recentes</h3>
                    <span className="text-xs text-slate-500">Últimas 10 • {period}</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="text-[10px] text-slate-500 uppercase tracking-widest font-bold" style={{ background: "rgba(23,6,157,0.07)" }}>
                                {["Status", "Cliente", "Produto", "Bruto", "Líquido", "Data"].map(h => (
                                    <th key={h} className="px-6 py-4">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading
                                ? Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                                        <td className="px-6 py-4" colSpan={6}>
                                            <div className="h-4 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.05)" }}></div>
                                        </td>
                                    </tr>
                                ))
                                : transactions.map((tx, i) => {
                                    const label = STATUS_LABEL[tx.status] ?? tx.status;
                                    const cls = STATUS_CLASS[label] ?? "badge-paused";
                                    const date = tx.order_date ? new Date(tx.order_date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";
                                    return (
                                        <tr key={i} className="transition-colors" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
                                            onMouseEnter={e => (e.currentTarget.style.background = "rgba(23,6,157,0.07)")}
                                            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                                        >
                                            <td className="px-6 py-4"><span className={cls}>{label}</span></td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-slate-100 text-sm">{tx.buyer_name}</div>
                                                <div className="text-[10px] text-slate-500 truncate max-w-[160px]">{tx.buyer_email}</div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-300 text-xs max-w-[180px] truncate" title={tx.product_name}>{tx.product_name}</td>
                                            <td className="px-6 py-4 text-xs font-bold"
                                                style={{ color: label === "Chargeback" || label === "Reembolso" ? "#f87171" : label === "Aprovada" ? "#C2DF0C" : "#f1f5f9" }}>
                                                {formatCurrency(tx.price_value ?? 0)}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-300">{formatCurrency(tx.net_value ?? 0)}</td>
                                            <td className="px-6 py-4 text-xs text-slate-500">{date}</td>
                                        </tr>
                                    );
                                })
                            }
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-3 flex justify-between" style={{ background: "rgba(23,6,157,0.05)" }}>
                    <p className="text-xs text-slate-500">Dados reais • <strong className="text-slate-300">{period}</strong></p>
                    <span className="text-[10px] text-slate-600">via Supabase • hotmart_transactions</span>
                </div>
            </div>
        </div>
    );
}
