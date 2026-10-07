"use client";
import { Fragment, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/client";
import { Avatar, ErrorBox } from "./ui";

export default function AsesmenHasil({ id }) {
  const [data, setData] = useState(null);
  const [open, setOpen] = useState(null); // id siswa yang dibuka
  const [skor, setSkor] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setData(await api(`/api/guru/asesmen/${id}/hasil`));
    } catch (e) {
      setError(e.message);
    }
  }, [id]);
  useEffect(() => { load(); }, [load]);

  function buka(s) {
    if (open === s._id) return setOpen(null);
    setOpen(s._id);
    setSkor(Object.fromEntries((s.attempt?.jawaban || []).map((j) => [String(j.soal), j.skor ?? 0])));
  }

  async function simpan(s) {
    setSaving(true);
    setError("");
    try {
      await api(`/api/guru/asesmen/${id}/hasil`, { method: "PUT", body: { attempt: s.attempt._id, skor } });
      await load();
    } catch (e) {
      setError(e.message);
    }
    setSaving(false);
  }

  if (!data) return <p className="text-sm text-slate-500">{error || "Memuat..."}</p>;
  const { asesmen, siswa } = data;
  const selesai = siswa.filter((s) => s.attempt).length;
  const nilaiList = siswa.map((s) => s.attempt?.nilai).filter((n) => n != null);
  const rata = nilaiList.length ? Math.round((nilaiList.reduce((a, b) => a + b, 0) / nilaiList.length) * 10) / 10 : null;

  return (
    <div className="space-y-5">
      <Link href="/guru/asesmen" className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:underline">
        <ArrowLeft size={16} /> Kembali ke daftar asesmen
      </Link>
      <ErrorBox>{error}</ErrorBox>

      <section className="card p-7">
        <p className="font-mono text-xs text-slate-400">{asesmen.jenis === "ujian" ? "Ujian" : "Kuis"} · {asesmen.mapel} · {asesmen.kelas.map((k) => k.nama).join(", ")}</p>
        <h2 className="mt-1 text-2xl font-bold">{asesmen.judul}</h2>
        <div className="mt-4 flex gap-8">
          <div><p className="text-2xl font-bold">{selesai}/{siswa.length}</p><p className="font-mono text-[11px] text-slate-400">sudah mengerjakan</p></div>
          <div><p className="text-2xl font-bold">{rata ?? "-"}</p><p className="font-mono text-[11px] text-slate-400">rata-rata nilai</p></div>
        </div>
      </section>

      <section className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-plum">
              <tr>
                <th className="th pl-6">Siswa</th>
                <th className="th">Kelas</th>
                <th className="th">Status</th>
                <th className="th">Nilai</th>
                <th className="th">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {siswa.length === 0 && <tr><td className="td pl-6 text-slate-500" colSpan={5}>Belum ada siswa di kelas tujuan.</td></tr>}
              {siswa.map((s) => (
                <Fragment key={s._id}>
                  <tr>
                    <td className="td pl-6"><div className="flex items-center gap-3"><Avatar nama={s.nama} /><div><p className="font-semibold">{s.nama}</p><p className="font-mono text-[11px] text-slate-400">{s.username}</p></div></div></td>
                    <td className="td">{s.kelas?.nama}</td>
                    <td className="td">
                      {!s.attempt ? <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">Belum</span>
                        : s.attempt.dinilai ? <span className="rounded-full bg-[#d9f2df] px-3 py-1 text-xs font-semibold text-[#2f8f4e]">Dinilai</span>
                        : <span className="rounded-full bg-[#fde9d2] px-3 py-1 text-xs font-semibold text-[#c5701b]">Selesai</span>}
                    </td>
                    <td className="td font-bold">{s.attempt?.nilai ?? "-"}</td>
                    <td className="td">{s.attempt && <button className="text-sm font-medium text-brand hover:underline" onClick={() => buka(s)}>{open === s._id ? "Tutup" : "Periksa"}</button>}</td>
                  </tr>
                  {open === s._id && (
                    <tr>
                      <td colSpan={5} className="bg-slate-50 px-6 py-5">
                        <div className="space-y-4">
                          {asesmen.soal.map((q, i) => {
                            const j = s.attempt.jawaban.find((x) => String(x.soal) === String(q._id)) || {};
                            return (
                              <div key={q._id} className="rounded-xl bg-white p-4">
                                <p className="text-sm font-semibold">{i + 1}. {q.teks}</p>
                                {q.tipe === "pilihan_ganda" ? (
                                  <p className="mt-2 text-sm">
                                    Jawaban: <b>{j.pilihan != null ? `${String.fromCharCode(65 + j.pilihan)}. ${q.opsi[j.pilihan] ?? ""}` : "(kosong)"}</b>
                                    <span className={`ml-2 font-mono text-xs ${j.pilihan === q.kunci ? "text-[#2f8f4e]" : "text-red-500"}`}>
                                      {j.pilihan === q.kunci ? "benar" : `salah (kunci ${String.fromCharCode(65 + q.kunci)})`}
                                    </span>
                                  </p>
                                ) : (
                                  <div className="mt-2 space-y-2">
                                    <p className="whitespace-pre-line rounded-lg bg-slate-50 p-3 text-sm">{j.teks || "(kosong)"}</p>
                                    <div className="flex items-center gap-2">
                                      <label className="label !mb-0">Skor (maks {q.bobot})</label>
                                      <input className="input !w-24 !py-2" type="number" min={0} max={q.bobot} step={0.5} value={skor[String(q._id)] ?? 0} onChange={(e) => setSkor({ ...skor, [String(q._id)]: e.target.value })} />
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                          <button className="btn btn-dark" disabled={saving} onClick={() => simpan(s)}>{saving ? "Menyimpan..." : "Simpan Penilaian"}</button>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
