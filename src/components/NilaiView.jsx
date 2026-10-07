"use client";
import { useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";
import { api } from "@/lib/client";
import { Tabs, ErrorBox } from "./ui";
import { usePenugasan } from "./PenugasanPicker";

// Hindari "formula injection" saat dibuka di Excel
const aman = (v) => (typeof v === "string" && /^[=+\-@]/.test(v) ? "'" + v : v);
const csvCell = (v) => `"${String(aman(v ?? "")).replace(/"/g, '""')}"`;

function unduhCsv(nama, header, baris) {
  const isi = [header, ...baris].map((r) => r.map(csvCell).join(",")).join("\r\n");
  const blob = new Blob(["\uFEFF" + isi], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nama;
  a.click();
  URL.revokeObjectURL(url);
}

const fmt = (n) => (n == null ? "-" : n);
const warna = (n) => (n == null ? "" : n >= 75 ? "text-[#2f8f4e]" : n >= 60 ? "text-[#c5701b]" : "text-red-600");

export default function NilaiView() {
  const penugasan = usePenugasan();
  const [mapel, setMapel] = useState("");
  const [kelas, setKelas] = useState("");
  const [bobot, setBobot] = useState({ bt: 30, bk: 20, bu: 50 });
  const [tab, setTab] = useState("siswa");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const mapelOpsi = useMemo(() => [...new Set((penugasan || []).map((p) => p.mapel))], [penugasan]);
  const kelasOpsi = (penugasan || []).filter((p) => p.mapel === mapel);

  useEffect(() => {
    if (!mapel && mapelOpsi.length) setMapel(mapelOpsi[0]);
  }, [mapelOpsi, mapel]);

  useEffect(() => {
    if (!mapel) return;
    const t = setTimeout(() => {
      setLoading(true);
      const p = new URLSearchParams({ mapel, bt: bobot.bt, bk: bobot.bk, bu: bobot.bu });
      if (kelas) p.set("kelas", kelas);
      api("/api/guru/nilai?" + p)
        .then((d) => { setData(d); setError(""); })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [mapel, kelas, bobot]);

  function unduh() {
    if (!data) return;
    const slug = mapel.replace(/\W+/g, "_");
    if (tab === "siswa")
      unduhCsv(`nilai_${slug}_siswa.csv`, ["No", "Nama", "NISN", "Kelas", "Jurusan", "Rata Tugas", "Rata Kuis", "Ujian", "Nilai Akhir"],
        data.rows.map((r, i) => [i + 1, r.nama, r.nisn, r.kelas, r.jurusan, r.tugas, r.kuis, r.ujian, r.akhir]));
    else if (tab === "kelas")
      unduhCsv(`nilai_${slug}_per_kelas.csv`, ["Kelas", "Jurusan", "Jumlah Siswa", "Rata-rata", "Tertinggi", "Terendah"],
        data.perKelas.map((k) => [k.kelas, k.jurusan, k.jumlah, k.rata, k.tertinggi, k.terendah]));
    else
      unduhCsv(`nilai_${slug}_per_jurusan.csv`, ["Jurusan", "Jumlah Kelas", "Jumlah Siswa", "Rata-rata", "Tertinggi", "Terendah"],
        data.perJurusan.map((j) => [j.jurusan, j.jumlahKelas, j.jumlah, j.rata, j.tertinggi, j.terendah]));
  }

  if (!penugasan) return <p className="text-sm text-slate-500">Memuat...</p>;
  if (penugasan.length === 0)
    return <div className="card p-8 text-center text-sm text-slate-500">Anda belum ditugaskan ke kelas atau mata pelajaran. Hubungi admin.</div>;

  const setB = (k) => (e) => setBobot({ ...bobot, [k]: e.target.value });
  const totalB = Number(bobot.bt) + Number(bobot.bk) + Number(bobot.bu);

  return (
    <div className="space-y-5">
      <section className="card space-y-4 p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <label className="label">Mata Pelajaran</label>
            <select className="input" value={mapel} onChange={(e) => { setMapel(e.target.value); setKelas(""); }}>
              {mapelOpsi.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Kelas</label>
            <select className="input" value={kelas} onChange={(e) => setKelas(e.target.value)}>
              <option value="">Semua kelas</option>
              {kelasOpsi.map((k) => <option key={k.kelasId} value={k.kelasId}>{k.kelasNama}</option>)}
            </select>
          </div>
          <div className="lg:col-span-2">
            <label className="label">Bobot nilai akhir (%) · total {totalB}</label>
            <div className="grid grid-cols-3 gap-2">
              {[["bt", "Tugas"], ["bk", "Kuis"], ["bu", "Ujian"]].map(([k, l]) => (
                <div key={k} className="flex items-center gap-2">
                  <span className="font-mono text-xs text-slate-500">{l}</span>
                  <input className="input !px-3 !py-2" type="number" min={0} value={bobot[k]} onChange={setB(k)} />
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className="font-mono text-[11px] text-slate-400">
          Tugas/asesmen yang sudah lewat tenggat tanpa nilai dihitung 0. Komponen yang belum ada dikeluarkan dan bobotnya dinormalkan.
        </p>
      </section>

      <ErrorBox>{error}</ErrorBox>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          tabs={[{ value: "siswa", label: "Per Siswa" }, { value: "kelas", label: "Per Kelas" }, { value: "jurusan", label: "Per Jurusan" }]}
          value={tab}
          onChange={setTab}
        />
        <button className="btn btn-dark !px-6 !py-3" onClick={unduh} disabled={!data}><Download size={16} /> Unduh CSV</button>
      </div>

      <div className="card overflow-hidden">
        <p className="px-6 py-5 font-mono text-xs text-slate-500">
          {loading ? "Menghitung..." : data ? `${mapel} · rata-rata keseluruhan ${fmt(data.rata)}` : ""}
        </p>
        <div className="overflow-x-auto">
          {tab === "siswa" && (
            <table className="w-full min-w-[760px]">
              <thead className="bg-plum"><tr>
                <th className="th w-14 pl-6">No</th><th className="th">Nama</th><th className="th">NISN</th><th className="th">Kelas</th>
                <th className="th">Tugas</th><th className="th">Kuis</th><th className="th">Ujian</th><th className="th">Nilai Akhir</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {data && data.rows.length === 0 && <tr><td className="td pl-6 text-slate-500" colSpan={8}>Belum ada siswa.</td></tr>}
                {(data?.rows || []).map((r, i) => (
                  <tr key={r.siswaId}>
                    <td className="td pl-6 font-mono text-xs text-slate-400">{i + 1}</td>
                    <td className="td font-semibold">{r.nama}</td>
                    <td className="td font-mono text-[13px]">{r.nisn}</td>
                    <td className="td">{r.kelas}</td>
                    <td className="td">{fmt(r.tugas)}</td><td className="td">{fmt(r.kuis)}</td><td className="td">{fmt(r.ujian)}</td>
                    <td className={`td font-bold ${warna(r.akhir)}`}>{fmt(r.akhir)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {tab === "kelas" && (
            <table className="w-full min-w-[640px]">
              <thead className="bg-plum"><tr>
                <th className="th pl-6">Kelas</th><th className="th">Jurusan</th><th className="th">Siswa</th><th className="th">Rata-rata</th><th className="th">Tertinggi</th><th className="th">Terendah</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {(data?.perKelas || []).map((k) => (
                  <tr key={k.kelasId}>
                    <td className="td pl-6 font-semibold">{k.kelas}</td><td className="td">{k.jurusan}</td><td className="td">{k.jumlah}</td>
                    <td className={`td font-bold ${warna(k.rata)}`}>{fmt(k.rata)}</td><td className="td">{fmt(k.tertinggi)}</td><td className="td">{fmt(k.terendah)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {tab === "jurusan" && (
            <table className="w-full min-w-[640px]">
              <thead className="bg-plum"><tr>
                <th className="th pl-6">Jurusan</th><th className="th">Kelas</th><th className="th">Siswa</th><th className="th">Rata-rata</th><th className="th">Tertinggi</th><th className="th">Terendah</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {(data?.perJurusan || []).map((j) => (
                  <tr key={j.jurusan}>
                    <td className="td pl-6 font-semibold">{j.jurusan}</td><td className="td">{j.jumlahKelas}</td><td className="td">{j.jumlah}</td>
                    <td className={`td font-bold ${warna(j.rata)}`}>{fmt(j.rata)}</td><td className="td">{fmt(j.tertinggi)}</td><td className="td">{fmt(j.terendah)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
