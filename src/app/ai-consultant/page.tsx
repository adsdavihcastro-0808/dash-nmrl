"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
    role: "user" | "ai";
    content: string;
    time: string;
    hasChart?: boolean;
};

const initialMessages: Message[] = [
    {
        role: "ai",
        content: "Olá, como posso ajudar com seus dados hoje?",
        time: "",
    },
    {
        role: "user",
        content: "Qual foi meu faturamento total em janeiro?",
        time: "09:41 AM",
    },
    {
        role: "ai",
        content: "Analisando o banco de dados de vendas... Encontrei os dados para o período de 01/01 a 31/01.\n\nSeu faturamento total em janeiro foi de **R$ 45.280,00**. Isso representa um crescimento de **+12%** em relação a dezembro.",
        time: "09:41 AM",
        hasChart: true,
    },
];

const channels = [
    { name: "Google Ads", value: "R$ 22.140", pct: 48 },
    { name: "Meta Ads", value: "R$ 18.200", pct: 39 },
    { name: "Direto/Orgânico", value: "R$ 4.940", pct: 13 },
];
const weeklyBars = [20, 80, 100, 70];

const suggestions = [
    "Qual foi o ROI médio das campanhas de Meta Ads em Dezembro?",
    "Quais campanhas tiveram maior CTR na semana passada?",
    "Qual produto gerou mais receita no Hotmart este mês?",
];

function renderContent(content: string) {
    const parts = content.split(/\*\*(.*?)\*\*/g);
    return parts.map((p, i) =>
        i % 2 === 1
            ? <strong key={i} style={{ color: "#C2DF0C", fontSize: "1.1em" }}>{p}</strong>
            : <span key={i}>{p}</span>
    );
}

export default function AIConsultantPage() {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const now = () => new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    function send() {
        if (!input.trim() || loading) return;
        const userMsg: Message = { role: "user", content: input, time: now() };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);
        setTimeout(() => {
            const aiMsg: Message = {
                role: "ai",
                content: "Baseado nos dados disponíveis, vou precisar analisar melhor essa solicitação. Por favor, aguarde enquanto processo os dados do seu banco de dados.",
                time: now(),
            };
            setMessages(prev => [...prev, aiMsg]);
            setLoading(false);
        }, 1200);
    }

    return (
        <div className="flex-1 flex flex-col relative overflow-hidden" style={{ height: "100%" }}>
            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
                {/* Welcome */}
                <div className="max-w-3xl mx-auto text-center mb-8">
                    <h3 className="text-3xl font-bold mb-2" style={{ background: "linear-gradient(to right, #fff, #64748b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                        Olá, como posso ajudar com seus dados hoje?
                    </h3>
                    <p className="text-slate-400 text-sm">Tente perguntar: "Qual foi o ROI médio das campanhas de Meta Ads em Dezembro?"</p>
                </div>

                {messages.map((msg, i) => (
                    <div key={i} className={`flex flex-col gap-2 ${msg.role === "user" ? "max-w-xl ml-auto items-end" : "max-w-4xl items-start"}`}>
                        {msg.role === "ai" && (
                            <div className="flex items-center gap-2 mb-1">
                                <div className="size-6 rounded flex items-center justify-center" style={{ background: "rgba(23,6,157,0.3)" }}>
                                    <span className="material-symbols-outlined text-slate-300" style={{ fontSize: 14, color: "#17069d" }}>smart_toy</span>
                                </div>
                                <span className="text-[10px] text-slate-500 font-bold uppercase">IA Marketing Na Moral</span>
                            </div>
                        )}
                        {msg.role === "user" && (
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] text-slate-500 font-bold uppercase">Você</span>
                            </div>
                        )}

                        <div
                            className="px-5 py-4 rounded-xl text-sm leading-relaxed"
                            style={msg.role === "user"
                                ? { background: "#17069d", borderTopRightRadius: 0, boxShadow: "0 4px 24px rgba(23,6,157,0.35)", color: "#fff" }
                                : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderTopLeftRadius: 0, backdropFilter: "blur(20px)", color: "#e2e8f0" }
                            }
                        >
                            {msg.content.split("\n").map((line, li) => (
                                <p key={li} className={li > 0 ? "mt-2" : ""}>{renderContent(line)}</p>
                            ))}

                            {/* Inline chart for AI response */}
                            {msg.hasChart && (
                                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Weekly bars */}
                                    <div className="p-4 rounded-lg" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Faturamento por Semana</h4>
                                            <span className="material-symbols-outlined text-slate-500" style={{ fontSize: 16 }}>more_horiz</span>
                                        </div>
                                        <div className="flex items-end justify-between h-28 gap-2 px-2">
                                            {weeklyBars.map((h, idx) => (
                                                <div key={idx} className="w-full rounded-t" style={{ height: `${h}%`, background: idx === 2 ? "#17069d" : `rgba(23,6,157,${0.4 + idx * 0.15})` }}></div>
                                            ))}
                                        </div>
                                        <div className="flex justify-between mt-2 text-[9px] text-slate-500 font-bold uppercase px-1">
                                            <span>Sem 1</span><span>Sem 2</span><span>Sem 3</span><span>Sem 4</span>
                                        </div>
                                    </div>
                                    {/* Channels */}
                                    <div className="p-4 rounded-lg" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Principais Canais</h4>
                                            <span className="material-symbols-outlined text-slate-500" style={{ fontSize: 16 }}>bar_chart</span>
                                        </div>
                                        <div className="space-y-3">
                                            {channels.map(ch => (
                                                <div key={ch.name} className="space-y-1">
                                                    <div className="flex justify-between text-[10px] text-slate-300">
                                                        <span>{ch.name}</span><span>{ch.value}</span>
                                                    </div>
                                                    <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                                                        <div className="h-full rounded-full" style={{ width: `${ch.pct}%`, background: "#17069d" }}></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {msg.hasChart && (
                                <div className="flex gap-2 mt-4">
                                    <button className="px-3 py-1.5 rounded-full text-[10px] flex items-center gap-1 text-slate-400 hover:text-white transition-colors" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>download</span> Baixar CSV
                                    </button>
                                    <button className="px-3 py-1.5 rounded-full text-[10px] flex items-center gap-1 text-slate-400 hover:text-white transition-colors" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>add</span> Adicionar ao Dashboard
                                    </button>
                                </div>
                            )}
                        </div>

                        {msg.time && (
                            <span className="text-[10px] text-slate-600">{msg.role === "user" ? `Entregue • ${msg.time}` : msg.time}</span>
                        )}
                    </div>
                ))}

                {loading && (
                    <div className="flex flex-col items-start gap-2 max-w-xl">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="size-6 rounded flex items-center justify-center" style={{ background: "rgba(23,6,157,0.3)" }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 14, color: "#17069d" }}>smart_toy</span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-bold uppercase">IA Marketing Na Moral</span>
                        </div>
                        <div className="px-5 py-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderTopLeftRadius: 0 }}>
                            <div className="flex gap-1.5 items-center py-1">
                                {[0, 1, 2].map(d => (
                                    <div key={d} className="size-2 rounded-full" style={{ background: "#17069d", animation: `pulse-dot 1.5s ease-in-out ${d * 0.3}s infinite` }}></div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="h-36"></div>
            </div>

            {/* Fixed Input Area */}
            <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-none" style={{ background: "linear-gradient(to top, #0A0914 55%, transparent)" }}>
                {/* Suggestions */}
                <div className="max-w-4xl mx-auto flex flex-wrap gap-2 mb-4 justify-center">
                    {suggestions.map((s) => (
                        <button key={s} onClick={() => setInput(s)} className="text-[10px] px-3 py-1.5 rounded-full text-slate-400 hover:text-white transition-all pointer-events-auto" style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)" }}>
                            {s}
                        </button>
                    ))}
                </div>

                <div className="max-w-4xl mx-auto pointer-events-auto">
                    <div className="rounded-2xl flex items-center gap-2 p-2 shadow-2xl" style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)" }}>
                        <button className="p-3 text-slate-500 hover:text-white transition-colors">
                            <span className="material-symbols-outlined">attach_file</span>
                        </button>
                        <input
                            className="flex-1 bg-transparent border-none focus:outline-none text-slate-100 placeholder-slate-600 text-sm py-3 px-2"
                            placeholder="Pergunte qualquer coisa sobre seus dados..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                        />
                        <button className="p-3 text-slate-500 hover:text-white transition-colors">
                            <span className="material-symbols-outlined">mic</span>
                        </button>
                        <button
                            onClick={send}
                            disabled={!input.trim() || loading}
                            className="size-12 flex items-center justify-center rounded-xl text-white transition-all disabled:opacity-40"
                            style={{ background: "#17069d", boxShadow: "0 4px 16px rgba(23,6,157,0.35)" }}
                        >
                            <span className="material-symbols-outlined">send</span>
                        </button>
                    </div>
                    <div className="flex justify-center gap-6 mt-3">
                        <button className="text-[10px] font-bold text-slate-600 uppercase tracking-widest hover:text-slate-400 transition-colors">Limpar Histórico</button>
                        <button className="text-[10px] font-bold text-slate-600 uppercase tracking-widest hover:text-slate-400 transition-colors">Configurações de Banco</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
