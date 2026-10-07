"use client";
import { Plus, Trash2 } from "lucide-react";
import { Field } from "./ui";

/** Input lampiran: satu file PDF + beberapa tautan. */
export default function LampiranFields({ file, setFile, existing, hapusFile, setHapusFile, links, setLinks }) {
  const setLink = (i, k, v) => setLinks(links.map((l, x) => (x === i ? { ...l, [k]: v } : l)));
  return (
    <div className="space-y-4">
      <Field label="File PDF (maks. 10 MB)">
        {existing && !hapusFile && (
          <div className="mb-2 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5 text-sm">
            <a href={`/api/files/${existing.id}`} target="_blank" rel="noopener noreferrer" className="truncate font-medium text-brand hover:underline">{existing.nama}</a>
            <button type="button" className="ml-3 shrink-0 text-red-600 hover:underline" onClick={() => setHapusFile(true)}>Hapus file</button>
          </div>
        )}
        {existing && hapusFile && <p className="mb-2 text-xs text-red-600">File akan dihapus saat disimpan. Pilih file baru untuk menggantinya.</p>}
        <input
          type="file"
          accept="application/pdf,.pdf"
          className="input file:mr-3 file:rounded-lg file:border-0 file:bg-night file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </Field>

      <Field label="Tautan (YouTube, Google Drive, dll.)">
        <div className="space-y-2">
          {links.map((l, i) => (
            <div key={i} className="flex gap-2">
              <input className="input !w-1/3" placeholder="Label" value={l.label} onChange={(e) => setLink(i, "label", e.target.value)} />
              <input className="input" type="url" placeholder="https://..." value={l.url} onChange={(e) => setLink(i, "url", e.target.value)} />
              <button type="button" className="icon-btn !h-11 !w-11 shrink-0" onClick={() => setLinks(links.filter((_, x) => x !== i))} aria-label="Hapus tautan"><Trash2 size={15} /></button>
            </div>
          ))}
          <button type="button" className="btn btn-sand !px-4 !py-2" onClick={() => setLinks([...links, { label: "", url: "" }])}>
            <Plus size={14} /> Tambah tautan
          </button>
        </div>
      </Field>
    </div>
  );
}

/** Tampilan tautan & file (read-only) */
export function LampiranList({ file, fileNama, links }) {
  if (!file && (!links || links.length === 0)) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {file && (
        <a href={`/api/files/${file}`} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand hover:bg-brand/20">
          PDF · {fileNama || "Buka"}
        </a>
      )}
      {(links || []).map((l, i) => (
        <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-sand px-3 py-1.5 text-xs font-semibold hover:bg-[#e4dccb]">
          {l.label || l.url}
        </a>
      ))}
    </div>
  );
}
