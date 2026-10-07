"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, BarChart3 } from "lucide-react";
import { api } from "@/lib/client";
import { formatTanggal } from "@/lib/format";
import { Pills } from "./ui";

const FILTER = [{ value: "", label: "Semua" }, { value: "kuis", label: "Kuis" }, { value: "ujian", label: "Ujian" }];

export default function AsesmenView() {
  const [list, setList] = useState(null);
  const [jenis, setJenis] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(() => {
    api("/api/guru/asesmen").then((d) => setList(d.asesmen)).catch((e) => setError(e.message));
  }, []);
  useEffect(load, [load]);

  async function remove(a) {
    const peringatan = a.dikerjakan > 0 ? ` ${a.dikerjakan} hasil pengerjaan siswa juga akan terhapus.` : "";
    if (!confirm(`Hapus "${a.judul}"?${peringatan}`)) return;
    try {
      await api(`/api/guru/asesmen/${a._id}`, { method: "DELETE" });
      load();
    } catch (e) {
      alert(e.message);
    }
  }

  const shown = (list || []).filter((a) => !jenis || a.jenis === jenis);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Pills items={FILTER} value={jenis} onChange={setJenis} />
        <Link href="/guru/asesmen/baru" className="btn btn-dark !px-6 !py-3"><Plus size={16} /> Buat Asesmen</Link>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {!list && !error && <p className="text-sm text-slate-500">Memuat...</p>}
      {list && shown.length === 0 && <div className="card p-8 text-center text-sm text-slate-500">Belum ada kuis atau ujian.</div>}

      <div className="space-y-4">
        {shown.map((a) => (
          <div key={a._id} className="card flex flex-wrap items-center gap-4 p-5">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold ${a.jenis === "ujian" ? "bg-[#fde9d2] text-[#c5701b]" : "bg-[#e3e7fb] text-[#4a58d6]"}`}>
                  {a.jenis === "ujian" ? "Ujian" : "Kuis"}
                </span>
                <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${a.status === "terbit" ? "bg-[#d9f2df] text-[#2f8f4e]" : "bg-slate-100 text-slate-500"}`}>
                  {a.status === "terbit" ? "Terbit" : "Draft"}
                </span>
                <span className="font-mono text-xs text-slate-400">{a.mapel} · {a.kelas.map((k) => k.nama).join(", ")}</span>
              </div>
              <Link href={`/guru/asesmen/${a._id}`} className="mt-1 block text-lg font-bold hover:underline">{a.judul}</Link>
              <p className="font-mono text-xs text-slate-400">
                {a.jumlahSoal} soal · {a.durasiMenit} menit · {a.mulai ? formatTanggal(a.mulai) : "tanpa jadwal"}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">{a.dikerjakan}</p>
              <p className="font-mono text-[11px] text-slate-400">dikerjakan</p>
            </div>
            <div className="flex gap-1.5">
              <Link href={`/guru/asesmen/${a._id}/hasil`} className="icon-btn" title="Hasil & penilaian" aria-label="Hasil"><BarChart3 size={15} /></Link>
              <Link href={`/guru/asesmen/${a._id}`} className="icon-btn" title="Edit" aria-label="Edit"><Pencil size={15} /></Link>
              <button className="icon-btn" onClick={() => remove(a)} title="Hapus" aria-label="Hapus"><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
