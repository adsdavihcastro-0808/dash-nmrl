import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Marketing Na Moral — Dashboard",
  description: "Dashboard de Inteligência de Marketing Digital",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className={`${inter.variable} antialiased overflow-hidden`} style={{ background: "#0A0914", color: "#f1f5f9", fontFamily: "Inter, sans-serif" }}>
        <div className="flex h-screen w-full overflow-hidden" style={{ background: "#0A0914" }}>
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden" style={{ background: "radial-gradient(circle at top right, rgba(23,6,157,0.12) 0%, #0A0914 60%)" }}>
            <Header />
            <main className="flex-1 overflow-y-auto custom-scrollbar">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
