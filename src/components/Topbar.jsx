"use client";
import { usePathname } from "next/navigation";
import { Bell, Layers } from "lucide-react";
import { SCHOOL } from "@/lib/config";
import { initials } from "@/lib/format";

/**
 * titles: [{ prefix, title, exact?, endsWith? }]
 * Dipilih entri yang cocok dengan path; yang lebih spesifik (endsWith, prefix lebih panjang) menang.
 */
function judul(path, titles) {
  const cocok = titles
    .filter((t) => (t.exact ? path === t.prefix : path.startsWith(t.prefix)) && (!t.endsWith || path.endsWith(t.endsWith)))
    .sort((a, b) => (b.endsWith ? 1 : 0) - (a.endsWith ? 1 : 0) || b.prefix.length - a.prefix.length);
  return cocok[0]?.title || "";
}

export default function Topbar({ name, titles }) {
  const path = usePathname();
  return (
    <header className="flex items-center justify-between border-b border-slate-200/80 pb-5">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10 text-brand"><Layers size={18} /></span>
        <div>
          <h1 className="text-xl font-bold leading-tight sm:text-2xl">{judul(path, titles)}</h1>
          <p className="font-mono text-xs text-slate-400">{SCHOOL.nama} · Tahun Ajaran {SCHOOL.tahunAjaran}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm" aria-label="Notifikasi"><Bell size={17} /></button>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-xs font-bold text-white">{initials(name)}</span>
      </div>
    </header>
  );
}
