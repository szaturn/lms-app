"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { api } from "@/lib/client";
import { formatTanggal } from "@/lib/format";
import { Avatar, ErrorBox } from "./ui";
import { LampiranList } from "./LampiranFields";
import TugasModal from "./TugasModal";

export default function TugasDetail({ id }) {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [draft, setDraft] = useState({}); // { [siswaId]: { nilai, feedback } }
  const [saving, setSaving] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [edit, setEdit] = useState(false);

  const load = useCallback(async () => {
    try {
      const d = await api(`/api/guru/tugas/${id}`);
      setData(d);
      setDraft(Object.fromEntries(d.siswa.map((s) => [s._id, { nilai: s.submission?.nilai ?? "", feedback: s.submission?.feedback ?? "" }])));
    } catch (e) {
      setError(e.message);
    }
  }, [id]);
  useEffect(() => { load(); }, [load]);

  async function simpan(s) {
    setSaving(s._id);
    setError("");
    setMsg("");
    try {
      const d = draft[s._id];
      await api(`/api/guru/tugas/${id}/nilai`, { method: "PUT", body: { siswa: s._id, nilai: d.nilai === "" ? null : Number(d.nilai), feedback: d.feedback } });
      setMsg(`Nilai ${s.nama} tersimpan`);
      await load();
    } catch (e) {
      setError(e.message);
    }
    setSaving("");
  }

  async function hapus() {
    if (!confirm("Hapus tugas ini beserta semua pengumpulan dan nilainya?")) return;
    try {
      await api(`/api/guru/tugas/${id}`, { method: "DELETE" });
      router.push("/guru/tugas");
    } catch (e) {
      setError(e.message);
    }
  }

  if (!data) return <p className="text-sm text-slate-500">{error || "Memuat..."}</p>;
  const { tugas, siswa } = data;
  const setD = (sid, k, v) => setDraft({ ...draft, [sid]: { ...draft[sid], [k]: v } });

  const status = (s) => {
    const sub = s.submission;
    if (!sub?.submittedAt) return <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">Belum</span>;
    const telat = tugas.deadline && new Date(sub.submittedAt) > new Date(tugas.deadline);
    return (
      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${telat ? "bg-[#fde9d2] text-[#c5701b]" : "bg-[#d9f2df] text-[#2f8f4e]"}`}>
        {telat ? "Terlambat" : "Terkumpul"}
      </span>
    );
  };

  return (
    <div className="space-y-5">
      <Link href="/guru/tugas" className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:underline">
        <ArrowLeft size={16} /> Kembali ke daftar tugas
      </Link>
      <ErrorBox>{error}</ErrorBox>
      {msg && <div className="rounded-xl bg-[#d9f2df] px-4 py-3 text-sm text-[#2f8f4e]">{msg}</div>}

      <section className="card p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs text-slate-400">{tugas.tipe === "projek" ? "Projek" : "Tugas"} · {tugas.mapel} · {tugas.kelas.map((k) => k.nama).join(", ")}</p>
            <h2 className="mt-1 text-2xl font-bold">{tugas.judul}</h2>
            <p className="mt-1 font-mono text-xs text-slate-400">
              Tenggat · {tugas.deadline ? formatTanggal(tugas.deadline) : "tanpa tenggat"} · Nilai maks. {tugas.nilaiMaks}
            </p>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-sand" onClick={() => setEdit(true)}><Pencil size={15} /> Edit</button>
            <button className="btn btn-sand !text-red-600" onClick={hapus}><Trash2 size={15} /> Hapus</button>
          </div>
        </div>
        {tugas.deskripsi && <p className="mt-4 whitespace-pre-line text-sm text-slate-600">{tugas.deskripsi}</p>}
        <div className="mt-4"><LampiranList file={tugas.file} fileNama={tugas.fileNama} links={tugas.links} /></div>
      </section>

      <section className="card overflow-hidden">
        <p className="px-6 py-5 font-mono text-xs text-slate-500">Pengumpulan & penilaian · {siswa.length} siswa</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-plum">
              <tr>
                <th className="th pl-6">Siswa</th>
                <th className="th">Kelas</th>
                <th className="th">Status</th>
                <th className="th">Berkas</th>
                <th className="th w-28">Nilai</th>
                <th className="th">Catatan</th>
                <th className="th">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {siswa.length === 0 ? (
                <tr><td className="td pl-6 text-slate-500" colSpan={7}>Belum ada siswa di kelas tujuan.</td></tr>
              ) : siswa.map((s) => {
                const sub = s.submission;
                const d = draft[s._id] || { nilai: "", feedback: "" };
                return (
                  <tr key={s._id}>
                    <td className="td pl-6"><div className="flex items-center gap-3"><Avatar nama={s.nama} jk={s.jenisKelamin} /><div><p className="font-semibold">{s.nama}</p><p className="font-mono text-[11px] text-slate-400">{s.username}</p></div></div></td>
                    <td className="td">{s.kelas?.nama}</td>
                    <td className="td">{status(s)}{sub?.submittedAt && <p className="mt-1 font-mono text-[10px] text-slate-400">{formatTanggal(sub.submittedAt)}</p>}</td>
                    <td className="td">
                      <div className="flex flex-col gap-1 text-xs">
                        {sub?.file && <a className="font-semibold text-brand hover:underline" href={`/api/files/${sub.file}`} target="_blank" rel="noopener noreferrer">{sub.fileNama || "Buka PDF"}</a>}
                        {sub?.link && /^https?:\/\//i.test(sub.link) && <a className="font-semibold text-brand hover:underline" href={sub.link} target="_blank" rel="noopener noreferrer">Tautan</a>}
                        {!sub?.file && !sub?.link && <span className="text-slate-400">-</span>}
                      </div>
                    </td>
                    <td className="td"><input className="input !px-3 !py-2" type="number" min={0} max={tugas.nilaiMaks} placeholder={`/${tugas.nilaiMaks}`} value={d.nilai} onChange={(e) => setD(s._id, "nilai", e.target.value)} /></td>
                    <td className="td"><input className="input !px-3 !py-2" placeholder="Umpan balik" value={d.feedback} onChange={(e) => setD(s._id, "feedback", e.target.value)} /></td>
                    <td className="td"><button className="btn btn-dark !px-4 !py-2" disabled={saving === s._id} onClick={() => simpan(s)}>{saving === s._id ? "..." : "Simpan"}</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {edit && <TugasModal tugas={tugas} onClose={() => setEdit(false)} onSaved={() => { setEdit(false); load(); }} />}
    </div>
  );
}
