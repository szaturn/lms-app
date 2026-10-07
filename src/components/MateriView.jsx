"use client";
import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { api } from "@/lib/client";
import { formatTanggal } from "@/lib/format";
import { RowActions } from "./ui";
import { LampiranList } from "./LampiranFields";
import MateriModal from "./MateriModal";

export default function MateriView() {
  const [list, setList] = useState(null);
  const [mapel, setMapel] = useState("");
  const [modal, setModal] = useState(null); // {} = baru, objek = edit
  const [error, setError] = useState("");

  const load = useCallback(() => {
    api("/api/guru/materi").then((d) => setList(d.materi)).catch((e) => setError(e.message));
  }, []);
  useEffect(load, [load]);

  async function remove(m) {
    if (!confirm(`Hapus materi "${m.judul}"?`)) return;
    try {
      await api(`/api/guru/materi/${m._id}`, { method: "DELETE" });
      load();
    } catch (e) {
      alert(e.message);
    }
  }

  const mapelOpsi = [...new Set((list || []).map((m) => m.mapel))];
  const shown = (list || []).filter((m) => !mapel || m.mapel === mapel);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <select className="input input-white !w-auto min-w-[200px]" value={mapel} onChange={(e) => setMapel(e.target.value)}>
          <option value="">Semua mata pelajaran</option>
          {mapelOpsi.map((m) => <option key={m}>{m}</option>)}
        </select>
        <button className="btn btn-dark !px-6 !py-3" onClick={() => setModal({})}><Plus size={16} /> Tambah Materi</button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {!list && !error && <p className="text-sm text-slate-500">Memuat...</p>}
      {list && shown.length === 0 && (
        <div className="card p-8 text-center text-sm text-slate-500">Belum ada materi. Klik <b>Tambah Materi</b> untuk mengunggah PDF atau menambahkan tautan.</div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        {shown.map((m) => (
          <div key={m._id} className="card p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-xs text-slate-400">{m.mapel} · {m.kelas.map((k) => k.nama).join(", ")}</p>
                <h3 className="mt-1 text-lg font-bold">{m.judul}</h3>
              </div>
              <RowActions onEdit={() => setModal(m)} onDelete={() => remove(m)} />
            </div>
            {m.deskripsi && <p className="mt-2 whitespace-pre-line text-sm text-slate-600">{m.deskripsi}</p>}
            <div className="mt-4"><LampiranList file={m.file} fileNama={m.fileNama} links={m.links} /></div>
            <p className="mt-4 font-mono text-[11px] text-slate-400">Diunggah {formatTanggal(m.createdAt)}</p>
          </div>
        ))}
      </div>

      {modal && (
        <MateriModal materi={modal._id ? modal : null} onClose={() => setModal(null)} onSaved={() => { setModal(null); load(); }} />
      )}
    </div>
  );
}
