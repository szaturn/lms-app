"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { api } from "@/lib/client";
import { Avatar, ErrorBox, JurusanChip } from "./ui";
import KelasModal from "./KelasModal";

export default function KelasDetail({ id }) {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [gurus, setGurus] = useState([]);
  const [mapelList, setMapelList] = useState([]);
  const [guru, setGuru] = useState("");
  const [mapel, setMapel] = useState("");
  const [error, setError] = useState("");
  const [edit, setEdit] = useState(false);

  const load = useCallback(async () => {
    try {
      setData(await api(`/api/admin/kelas/${id}`));
    } catch (e) {
      setError(e.message);
    }
  }, [id]);

  useEffect(() => {
    load();
    api("/api/admin/users?role=guru").then((d) => setGurus(d.users || [])).catch(() => {});
    api("/api/admin/mapel").then((d) => setMapelList(d.mapel || [])).catch(() => {});
  }, [load]);

  async function savePengajar(list) {
    setError("");
    try {
      await api(`/api/admin/kelas/${id}`, {
        method: "PUT",
        body: { pengajar: list.map((p) => ({ guru: p.guru._id || p.guru, mapel: p.mapel })) },
      });
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  function add(e) {
    e.preventDefault();
    if (!guru || !mapel.trim()) return;
    savePengajar([...data.kelas.pengajar, { guru, mapel: mapel.trim() }]);
    setGuru("");
    setMapel("");
  }

  async function hapusKelas() {
    if (!confirm(`Hapus kelas ${data.kelas.nama}? Siswa di kelas ini akan menjadi belum punya kelas.`)) return;
    try {
      await api(`/api/admin/kelas/${id}`, { method: "DELETE" });
      router.push("/admin/kelas-siswa");
    } catch (e) {
      setError(e.message);
    }
  }

  if (!data) return <p className="text-sm text-slate-500">{error || "Memuat..."}</p>;
  const { kelas, siswa } = data;
  const pct = (siswa.length / kelas.kapasitas) * 100;

  return (
    <div className="space-y-5">
      <Link href="/admin/kelas-siswa" className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:underline">
        <ArrowLeft size={16} /> Kembali ke daftar kelas
      </Link>

      <ErrorBox>{error}</ErrorBox>

      <section className="card p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <JurusanChip jurusan={kelas.jurusan} />
              <span className="font-mono text-xs text-slate-400">Tk. {kelas.tingkat}</span>
            </div>
            <h2 className="mt-3 text-2xl font-bold">{kelas.nama}</h2>
            <div className="mt-2 space-y-1 font-mono text-xs text-slate-400">
              <p>Wali Kelas · {kelas.waliKelas || "-"}</p>
              <p>Ruangan · {kelas.ruangan || "-"}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-sand" onClick={() => setEdit(true)}><Pencil size={15} /> Edit</button>
            <button className="btn btn-sand !text-red-600" onClick={hapusKelas}><Trash2 size={15} /> Hapus</button>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between text-sm">
          <span className="text-slate-400">Siswa</span>
          <span className="font-bold">{siswa.length}/{kelas.kapasitas}</span>
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-slate-100">
          <div className={`h-full rounded-full ${pct >= 90 ? "bg-ember" : "bg-brand"}`} style={{ width: `${Math.min(100, pct)}%` }} />
        </div>
      </section>

      <section className="card space-y-4 p-7">
        <h3 className="text-lg font-bold">Guru pengajar</h3>
        <form onSubmit={add} className="flex flex-wrap gap-3">
          <select className="input !w-auto min-w-[200px] flex-1" value={guru} onChange={(e) => setGuru(e.target.value)} required>
            <option value="">Pilih guru</option>
            {gurus.map((g) => <option key={g._id} value={g._id}>{g.nama}</option>)}
          </select>
          <input className="input !w-auto min-w-[200px] flex-1" list="daftar-mapel" placeholder="Mata pelajaran" value={mapel} onChange={(e) => setMapel(e.target.value)} required />
          <datalist id="daftar-mapel">{mapelList.map((m) => <option key={m._id} value={m.nama} />)}</datalist>
          <button className="btn btn-dark">Tambah</button>
        </form>

        {kelas.pengajar.length === 0 ? (
          <p className="text-sm text-slate-500">Belum ada guru di kelas ini.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {kelas.pengajar.map((p, i) => (
              <li key={i} className="flex items-center justify-between py-3 text-sm">
                <span><span className="font-semibold">{p.guru?.nama}</span> <span className="font-mono text-xs text-slate-400">· {p.mapel}</span></span>
                <button className="text-red-600 hover:underline" onClick={() => savePengajar(kelas.pengajar.filter((_, x) => x !== i))}>Hapus</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card p-7">
        <h3 className="mb-4 text-lg font-bold">Siswa ({siswa.length})</h3>
        {siswa.length === 0 ? (
          <p className="text-sm text-slate-500">Belum ada siswa. Tambahkan lewat tab Siswa dengan memilih kelas ini.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {siswa.map((s) => (
              <li key={s._id} className="flex items-center gap-3 py-2.5 text-sm">
                <Avatar nama={s.nama} jk={s.jenisKelamin} />
                <span className="flex-1 font-semibold">{s.nama}</span>
                <span className="font-mono text-xs text-slate-400">{s.username}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {edit && <KelasModal kelas={kelas} onClose={() => setEdit(false)} onSaved={() => { setEdit(false); load(); }} />}
    </div>
  );
}
