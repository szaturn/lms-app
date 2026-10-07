"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/client";
import { RowActions } from "./ui";

const KATEGORI = {
  Wajib: "bg-[#d9f2df] text-[#2f8f4e]",
  Peminatan: "bg-[#e3e7fb] text-[#4a58d6]",
  Mulok: "bg-[#fde9d2] text-[#c5701b]",
};

export default function MapelGrid({ version, onEdit, onChanged }) {
  const [list, setList] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/api/admin/mapel").then((d) => setList(d.mapel)).catch((e) => setError(e.message));
  }, [version]);

  async function remove(m) {
    if (!confirm(`Hapus mata pelajaran ${m.nama}?`)) return;
    try {
      await api(`/api/admin/mapel/${m._id}`, { method: "DELETE" });
      onChanged();
    } catch (e) {
      alert(e.message);
    }
  }

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!list) return <p className="text-sm text-slate-500">Memuat...</p>;
  if (list.length === 0)
    return <div className="card p-8 text-center text-sm text-slate-500">Belum ada mata pelajaran. Klik <b>Tambah Mapel</b>.</div>;

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {list.map((m) => (
        <div key={m._id} className="card p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-brand/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-brand">{m.kode}</span>
              <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${KATEGORI[m.kategori] || ""}`}>{m.kategori}</span>
            </div>
            <RowActions onEdit={() => onEdit(m)} onDelete={() => remove(m)} />
          </div>
          <h3 className="mt-4 text-xl font-bold">{m.nama}</h3>
          <div className="mt-3 space-y-1 font-mono text-xs text-slate-400">
            <p>Guru · {m.guru?.nama || "Belum ditentukan"}</p>
            <p>{m.jamPerMinggu} jam/minggu · Kelas {(m.tingkat || []).join(", ")}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
