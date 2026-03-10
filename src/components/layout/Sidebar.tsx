"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
    { href: "/traffic", label: "Tráfego (Ads)", icon: "public" },
    { href: "/hotmart", label: "Vendas Hotmart", icon: "payments" },
    { href: "/instagram", label: "Instagram", icon: "brand_awareness" },
    { href: "/ai-consultant", label: "Agente IA", icon: "query_stats" },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 flex-shrink-0 flex flex-col" style={{ background: "rgba(10,9,20,0.8)", backdropFilter: "blur(12px)", borderRight: "1px solid rgba(255,255,255,0.05)" }}>
            {/* Logo */}
            <div className="p-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: "#17069d", boxShadow: "0 4px 20px rgba(23,6,157,0.4)" }}>
                    <span className="material-symbols-outlined text-xl" style={{ color: "#C2DF0C" }}>bolt</span>
                </div>
                <div>
                    <h1 className="text-sm font-bold tracking-tight text-slate-100">Marketing Na Moral</h1>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">Premium Dashboard</p>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-4 space-y-1 mt-2">
                {navItems.map((item) => {
                    const active = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`sidebar-item${active ? " active" : ""}`}
                        >
                            <span className="material-symbols-outlined text-xl">{item.icon}</span>
                            {item.label}
                        </Link>
                    );
                })}

                <div className="pt-4 border-t border-white/5 mt-4">
                    <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Configurações</p>
                    <Link href="#" className="sidebar-item">
                        <span className="material-symbols-outlined text-xl">settings</span>
                        Ajustes
                    </Link>
                </div>
            </nav>

            {/* User card */}
            <div className="p-4">
                <div className="glass-card rounded-xl p-3 flex items-center gap-3">
                    <div className="size-8 rounded-full overflow-hidden border border-white/10 bg-slate-700 flex items-center justify-center">
                        <span className="material-symbols-outlined text-sm text-slate-300">person</span>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-xs font-bold text-slate-100 truncate">Admin</p>
                        <p className="text-[10px] text-slate-500 truncate">Marketing Na Moral</p>
                    </div>
                    <span className="material-symbols-outlined text-slate-500 text-sm cursor-pointer hover:text-slate-300 transition-colors">logout</span>
                </div>
            </div>
        </aside>
    );
}
