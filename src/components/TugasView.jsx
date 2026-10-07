"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { api } from "@/lib/client";
import { formatTanggal } from "@/lib/format";
import { Pills, RowActions } from "./ui";
import TugasModal from "./TugasModal";

const FILTER = [{ value: "", label: "Semua" }, { value: "tugas", label: "Tugas" }, { value: "projek", label: "Projek" }];

export default function TugasView() {
  const [list, setList] = useState(null);
  const [tipe, setTipe] = useState("");
  const [modal, setModal] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    api("/api/guru/tugas").then((d) => setList(d.tugas)).catch((e) => setError(e.message));
  }, []);
  useEffect(load, [load]);

  async function remove(t) {
    if (!confirm(`Hapus "${t.judul}"? Semua pengumpulan dan nilai pada tugas ini ikut terhapus.`)) return;
    try {
      await api(`/api/guru/tugas/${t._id}`, { method: "DELETE" });
      load();
    } catch (e) {
      alert(e.message);
    }
  }

  const shown = (list || []).filter((t) => !tipe || t.tipe === tipe);
  const now = new Date();

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Pills items={FILTER} value={tipe} onChange={setTipe} />
        <button className="btn btn-dark !px-6 !py-3" onClick={() => setModal({})}><Plus size={16} /> Buat Tugas</button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {!list && !error && <p className="text-sm text-slate-500">Memuat...</p>}
      {list && shown.length === 0 && <div className="card p-8 text-center text-sm text-slate-500">Belum ada tugas.</div>}

      <div className="space-y-4">
        {shown.map((t) => {
          const lewat = t.deadline && new Date(t.deadline) < now;
          return (
            <div key={t._id} className="card flex flex-wrap items-center gap-4 p-5">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold ${t.tipe === "projek" ? "bg-[#fde9d2] text-[#c5701b]" : "bg-[#e3e7fb] text-[#4a58d6]"}`}>
                    {t.tipe === "projek" ? "Projek" : "Tugas"}
                  </span>
                  <span className="font-mono text-xs text-slate-400">{t.mapel} · {t.kelas.map((k) => k.nama).join(", ")}</span>
                </div>
                <Link href={`/guru/tugas/${t._id}`} className="mt-1 block text-lg font-bold hover:underline">{t.judul}</Link>
                <p className={`font-mono text-xs ${lewat ? "text-red-500" : "text-slate-400"}`}>
                  Tenggat · {t.deadline ? formatTanggal(t.deadline) : "tanpa tenggat"}{lewat ? " (lewat)" : ""}
                </p>
              </div>
              <div className="flex gap-6 text-center">
                <div><p className="text-xl font-bold">{t.terkumpul}/{t.totalSiswa}</p><p className="font-mono text-[11px] text-slate-400">terkumpul</p></div>
                <div><p className="text-xl font-bold">{t.dinilai}</p><p className="font-mono text-[11px] text-slate-400">dinilai</p></div>
              </div>
              <RowActions onEdit={() => setModal(t)} onDelete={() => remove(t)} />
            </div>
          );
        })}
      </div>

      {modal && <TugasModal tugas={modal._id ? modal : null} onClose={() => setModal(null)} onSaved={() => { setModal(null); load(); }} />}
    </div>
  );
}
