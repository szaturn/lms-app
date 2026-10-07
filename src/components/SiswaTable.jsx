"use client";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { api } from "@/lib/client";
import { Avatar, StatusBadge, RowActions, Pager } from "./ui";

const LIMIT = 10;

export default function SiswaTable({ version, onEdit, onChanged }) {
  const [q, setQ] = useState("");
  const [dq, setDq] = useState("");
  const [kelasId, setKelasId] = useState("");
  const [kelas, setKelas] = useState([]);
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ users: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/api/admin/kelas").then((d) => setKelas(d.kelas)).catch(() => {});
  }, [version]);

  useEffect(() => {
    const t = setTimeout(() => { setDq(q); setPage(1); }, 300); // debounce pencarian
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    setLoading(true);
    const p = new URLSearchParams({ role: "siswa", limit: String(LIMIT), page: String(page) });
    if (dq) p.set("q", dq);
    if (kelasId) p.set("kelas", kelasId);
    api("/api/admin/users?" + p)
      .then((d) => { setData(d); setError(""); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [dq, kelasId, page, version]);

  async function remove(u) {
    if (!confirm(`Hapus siswa ${u.nama}? Tindakan ini tidak bisa dibatalkan.`)) return;
    try {
      await api(`/api/admin/users/${u._id}`, { method: "DELETE" });
      onChanged();
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input input-white !pl-11" placeholder="Cari nama atau NISN..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="input input-white !w-auto min-w-[170px]" value={kelasId} onChange={(e) => { setKelasId(e.target.value); setPage(1); }}>
          <option value="">Semua Kelas</option>
          {kelas.map((k) => <option key={k._id} value={k._id}>{k.nama}</option>)}
        </select>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="card overflow-hidden">
        <p className="px-6 py-5 font-mono text-xs text-slate-500">
          Menampilkan {data.users.length} dari {data.total} siswa
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead className="bg-plum">
              <tr>
                <th className="th w-14 pl-6">No</th>
                <th className="th">Nama Siswa</th>
                <th className="th">NISN</th>
                <th className="th">Kelas</th>
                <th className="th">JK</th>
                <th className="th">Nama Wali</th>
                <th className="th">Status</th>
                <th className="th">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && data.users.length === 0 ? (
                <tr><td className="td pl-6 text-slate-500" colSpan={8}>Memuat...</td></tr>
              ) : data.users.length === 0 ? (
                <tr><td className="td pl-6 text-slate-500" colSpan={8}>Belum ada data siswa.</td></tr>
              ) : data.users.map((u, i) => (
                <tr key={u._id} className="hover:bg-slate-50/60">
                  <td className="td pl-6 font-mono text-xs text-slate-400">{(page - 1) * LIMIT + i + 1}</td>
                  <td className="td">
                    <div className="flex items-center gap-3">
                      <Avatar nama={u.nama} jk={u.jenisKelamin} />
                      <div>
                        <p className="font-semibold">{u.nama}</p>
                        <p className="font-mono text-[11px] text-slate-400">{u.tempatTanggalLahir || "-"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="td font-mono text-[13px]">{u.username}</td>
                  <td className="td">
                    {u.kelas ? <span className="rounded-md bg-sand px-2 py-1 text-xs font-semibold">{u.kelas.nama}</span> : <span className="text-slate-400">-</span>}
                  </td>
                  <td className="td font-bold text-brand">{u.jenisKelamin || "-"}</td>
                  <td className="td">{u.namaWali || "-"}</td>
                  <td className="td"><StatusBadge aktif={u.aktif} /></td>
                  <td className="td"><RowActions onEdit={() => onEdit(u)} onDelete={() => remove(u)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pager page={page} pages={data.pages} onChange={setPage} />
      </div>
    </div>
  );
}
