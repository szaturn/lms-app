"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  BarChart3, Users, BookOpen, UserCog, Settings, Shield, LogOut,
  FileText, ClipboardList, ListChecks, GraduationCap,
} from "lucide-react";
import { SCHOOL } from "@/lib/config";
import { initials } from "@/lib/format";

const ICONS = { BarChart3, Users, BookOpen, UserCog, FileText, ClipboardList, ListChecks, GraduationCap };

/** nav: [{ href, label, desc, icon }] ; home: href beranda (aktif hanya jika persis sama) */
export default function Sidebar({ name, username, nav, home, roleLabel }) {
  const path = usePathname();
  const isActive = (href) => (href === home ? path === home : path.startsWith(href));
  const logout = () => signOut({ callbackUrl: "/login" });

  return (
    <>
      {/* Desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[280px] flex-col bg-sidebar text-white lg:flex">
        <div className="flex items-center gap-3 px-6 pb-4 pt-7">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand"><Shield size={22} /></div>
          <div>
            <p className="text-lg font-bold leading-tight">{SCHOOL.app}</p>
            <p className="text-xs text-white/60">{roleLabel}</p>
          </div>
        </div>

        <nav className="mt-6 flex-1 space-y-1.5 overflow-y-auto px-6">
          {nav.map((n) => {
            const Icon = ICONS[n.icon] || BarChart3;
            const active = isActive(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-3 transition ${active ? "bg-sidebar-active" : "hover:bg-white/5"}`}
              >
                <Icon size={18} className={active ? "text-white" : "text-white/50"} />
                <span>
                  <span className={`block text-sm font-medium ${active ? "text-white" : "text-white/80"}`}>{n.label}</span>
                  <span className="block font-mono text-[10px] text-white/40">{n.desc}</span>
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="space-y-3 px-6 pb-6 pt-3">
          <div className="flex cursor-not-allowed items-center gap-3 px-3.5 py-2 text-white/50" title="Segera hadir">
            <Settings size={18} /> <span className="text-sm">Pengaturan</span>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-sidebar-active p-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand text-xs font-bold">{initials(name)}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{name}</p>
              <p className="truncate font-mono text-[10px] text-white/50">{username}</p>
            </div>
            <button onClick={logout} className="text-white/60 hover:text-white" title="Keluar" aria-label="Keluar"><LogOut size={18} /></button>
          </div>
        </div>
      </aside>

      {/* Mobile */}
      <div className="sticky top-0 z-30 flex items-center gap-2 overflow-x-auto bg-sidebar px-4 py-3 text-white lg:hidden">
        <div className="mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand"><Shield size={18} /></div>
        {nav.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm ${isActive(n.href) ? "bg-sidebar-active font-semibold" : "text-white/70"}`}
          >
            {n.label}
          </Link>
        ))}
        <button onClick={logout} className="ml-auto shrink-0 text-white/70" aria-label="Keluar"><LogOut size={18} /></button>
      </div>
    </>
  );
}
