"use client";

import { usePathname } from "next/navigation";

const pageMeta: Record<string, { title: string; subtitle?: string }> = {
    "/traffic": { title: "Tráfego Facebook Ads" },
    "/hotmart": { title: "Resumo de Vendas" },
    "/instagram": { title: "Performance Social" },
    "/ai-consultant": { title: "Consulta de Banco de Dados SQL" },
};

export function Header() {
    const pathname = usePathname();
    const page = Object.entries(pageMeta).find(([k]) => pathname.startsWith(k));
    const meta = page?.[1] ?? { title: "Dashboard" };

    return (
        <header
            className="h-16 flex items-center justify-between px-8 z-10 flex-shrink-0"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(10,9,20,0.8)", backdropFilter: "blur(12px)" }}
        >
            <div className="flex items-center gap-4">
                {pathname.startsWith("/ai-consultant") && (
                    <span className="material-symbols-outlined text-slate-400">terminal</span>
                )}
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">{meta.title}</h2>
                {pathname.startsWith("/instagram") && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-[#C2DF0C]" style={{ background: "rgba(194,223,12,0.1)" }}>Live</span>
                )}
            </div>

            <div className="flex items-center gap-4">


                {/* Bell */}
                <button className="relative size-9 flex items-center justify-center rounded-full transition-colors" style={{ background: "rgba(23,6,157,0.15)" }}>
                    <span className="material-symbols-outlined text-slate-400 text-xl">notifications</span>
                    <span className="absolute top-2 right-2 size-2 rounded-full border-2" style={{ background: "#C2DF0C", borderColor: "#0A0914" }}></span>
                </button>

                <div className="h-6 w-px" style={{ background: "rgba(255,255,255,0.08)" }}></div>

                <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold uppercase" style={{ color: "#C2DF0C" }}>Premium Plan</p>
                    <p className="text-[10px] text-slate-500">Expira em 12 dias</p>
                </div>
            </div>
        </header>
    );
}
