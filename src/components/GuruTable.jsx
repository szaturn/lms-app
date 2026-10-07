"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/client";
import { Avatar, StatusBadge, RowActions } from "./ui";

export default function GuruTable({ version, onEdit, onChanged }) {
  const [list, setList] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/api/admin/users?role=guru").then((d) => setList(d.users)).catch((e) => setError(e.message));
  }, [version]);

  async function remove(u) {
    if (!confirm(`Hapus guru ${u.nama}? Guru ini juga dilepas dari mata pelajaran dan kelas.`)) return;
    try {
      await api(`/api/admin/users/${u._id}`, { method: "DELETE" });
      onChanged();
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div className="card overflow-hidden">
      <p className="px-6 py-5 font-mono text-xs text-slate-500">{list ? `Total ${list.length} guru` : "Memuat..."}</p>
      {error && <p className="px-6 pb-4 text-sm text-red-600">{error}</p>}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px]">
          <thead className="bg-plum">
            <tr>
              <th className="th w-14 pl-6">No</th>
              <th className="th">Nama Guru</th>
              <th className="th">NIP</th>
              <th className="th">Pelajaran Utama</th>
              <th className="th">Jabatan</th>
              <th className="th">Status</th>
              <th className="th">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list && list.length === 0 ? (
              <tr><td className="td pl-6 text-slate-500" colSpan={7}>Belum ada data guru.</td></tr>
            ) : (list || []).map((u, i) => (
              <tr key={u._id} className="hover:bg-slate-50/60">
                <td className="td pl-6 font-mono text-xs text-slate-400">{i + 1}</td>
                <td className="td">
                  <div className="flex items-center gap-3">
                    <Avatar nama={u.nama} jk={u.jenisKelamin} />
                    <div>
                      <p className="font-semibold">{u.nama}</p>
                      <p className="font-mono text-[11px] text-slate-400">{u.email || "-"}</p>
                    </div>
                  </div>
                </td>
                <td className="td font-mono text-[13px]">{u.username}</td>
                <td className="td">{u.mapelUtama || "-"}</td>
                <td className="td">{u.jabatan || "-"}</td>
                <td className="td"><StatusBadge aktif={u.aktif} /></td>
                <td className="td"><RowActions onEdit={() => onEdit(u)} onDelete={() => remove(u)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
