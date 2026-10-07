"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/client";
import { Pills, JurusanChip } from "./ui";

const FILTER = [
  { value: "", label: "Semua Tingkat" },
  { value: "X", label: "Kelas X" },
  { value: "XI", label: "Kelas XI" },
  { value: "XII", label: "Kelas XII" },
];

export default function KelasGrid({ version }) {
  const [list, setList] = useState(null);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api("/api/admin/kelas").then((d) => setList(d.kelas)).catch((e) => setError(e.message));
  }, [version]);

  const shown = (list || []).filter((k) => !filter || k.tingkat === filter);

  return (
    <div className="space-y-5">
      <Pills items={FILTER} value={filter} onChange={setFilter} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!list && !error && <p className="text-sm text-slate-500">Memuat...</p>}
      {list && shown.length === 0 && (
        <div className="card p-8 text-center text-sm text-slate-500">Belum ada kelas. Klik <b>Tambah Kelas</b> untuk membuat yang pertama.</div>
      )}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {shown.map((k) => {
          const pct = (k.jumlahSiswa / k.kapasitas) * 100;
          return (
            <Link
              key={k._id}
              href={`/admin/kelas-siswa/${k._id}`}
              className="card block p-6 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center gap-2">
                <JurusanChip jurusan={k.jurusan} />
                <span className="font-mono text-xs text-slate-400">Tk. {k.tingkat}</span>
              </div>
              <h3 className="mt-4 text-xl font-bold">{k.nama}</h3>
              <div className="mt-3 space-y-1 font-mono text-xs text-slate-400">
                <p>Wali Kelas · {k.waliKelas || "-"}</p>
                <p>Ruangan · {k.ruangan || "-"}</p>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-slate-400">Siswa</span>
                <span className="font-bold">{k.jumlahSiswa}/{k.kapasitas}</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-slate-100">
                <div className={`h-full rounded-full ${pct >= 90 ? "bg-ember" : "bg-brand"}`} style={{ width: `${Math.min(100, pct)}%` }} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
