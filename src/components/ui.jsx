"use client";
import { useEffect } from "react";
import { X } from "lucide-react";

export function Modal({ title, onClose, children }) {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-night/50 p-4 backdrop-blur-sm" onMouseDown={onClose}>
      <div className="max-h-[92vh] w-full max-w-[600px] overflow-y-auto rounded-3xl bg-white shadow-2xl" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 px-7 py-5">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-night" aria-label="Tutup"><X size={20} /></button>
        </div>
        <div className="px-7 py-6">{children}</div>
      </div>
    </div>
  );
}

export function Field({ label, children, className = "" }) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

export function ErrorBox({ children }) {
  if (!children) return null;
  return <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{children}</div>;
}

export function ModalActions({ onCancel, saving, submitLabel }) {
  return (
    <div className="grid grid-cols-2 gap-3 pt-2">
      <button type="button" className="btn btn-sand" onClick={onCancel}>Batal</button>
      <button className="btn btn-dark" disabled={saving}>{saving ? "Menyimpan..." : submitLabel}</button>
    </div>
  );
}

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="inline-flex rounded-2xl bg-white p-1.5 shadow-sm">
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
            value === t.value ? "bg-night text-white" : "text-slate-500 hover:text-night"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function Pills({ items, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {items.map((i) => (
        <button
          key={i.value}
          onClick={() => onChange(i.value)}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
            value === i.value ? "bg-night text-white" : "border border-slate-200 bg-white text-night hover:border-slate-300"
          }`}
        >
          {i.label}
        </button>
      ))}
    </div>
  );
}

export function JurusanChip({ jurusan }) {
  const style =
    jurusan === "IPA" ? "bg-[#e3e7fb] text-[#4a58d6]" : jurusan === "IPS" ? "bg-[#fde9d2] text-[#c5701b]" : "bg-slate-100 text-slate-600";
  return <span className={`rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold ${style}`}>{jurusan}</span>;
}

export function StatusBadge({ aktif }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${aktif ? "bg-[#d9f2df] text-[#2f8f4e]" : "bg-slate-200 text-slate-600"}`}>
      {aktif ? "Aktif" : "Nonaktif"}
    </span>
  );
}

export function Avatar({ nama, jk }) {
  const style = jk === "P" ? "bg-[#fbe3f0] text-[#c0368a]" : "bg-[#e3e7fb] text-[#4a58d6]";
  return (
    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${style}`}>
      {(nama || "?")[0].toUpperCase()}
    </span>
  );
}

export function RowActions({ onEdit, onDelete }) {
  return (
    <div className="flex gap-1.5">
      <button className="icon-btn" onClick={onEdit} aria-label="Edit" title="Edit">{/* pensil */}
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
      </button>
      <button className="icon-btn" onClick={onDelete} aria-label="Hapus" title="Hapus">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
      </button>
    </div>
  );
}

export function Pager({ page, pages, onChange }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
      <span className="font-mono text-xs text-slate-400">Halaman {page} dari {pages}</span>
      <div className="flex gap-2">
        <button className="btn btn-sand !px-4 !py-1.5" disabled={page <= 1} onClick={() => onChange(page - 1)}>Sebelumnya</button>
        <button className="btn btn-sand !px-4 !py-1.5" disabled={page >= pages} onClick={() => onChange(page + 1)}>Berikutnya</button>
      </div>
    </div>
  );
}
