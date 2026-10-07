"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/client";
import { toLocalInput } from "@/lib/format";
import { Field, ErrorBox } from "./ui";
import PenugasanPicker, { usePenugasan } from "./PenugasanPicker";

const soalBaru = (tipe) =>
  tipe === "esai"
    ? { tipe: "esai", teks: "", opsi: [], bobot: 5 }
    : { tipe: "pilihan_ganda", teks: "", opsi: ["", "", "", ""], kunci: 0, bobot: 1 };

export default function AsesmenEditor({ id }) {
  const router = useRouter();
  const penugasan = usePenugasan();
  const [loaded, setLoaded] = useState(!id);
  const [dikerjakan, setDikerjakan] = useState(0);
  const [target, setTarget] = useState({ mapel: "", kelas: [] });
  const [f, setF] = useState({ jenis: "kuis", judul: "", deskripsi: "", durasiMenit: 30, mulai: "", selesai: "", acakSoal: false, status: "draft" });
  const [soal, setSoal] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const terkunci = dikerjakan > 0;

  useEffect(() => {
    if (!id) return;
    api(`/api/guru/asesmen/${id}`)
      .then(({ asesmen: a, dikerjakan: n }) => {
        setDikerjakan(n);
        setTarget({ mapel: a.mapel, kelas: a.kelas.map(String) });
        setF({
          jenis: a.jenis, judul: a.judul, deskripsi: a.deskripsi || "", durasiMenit: a.durasiMenit,
          mulai: toLocalInput(a.mulai), selesai: toLocalInput(a.selesai), acakSoal: a.acakSoal, status: a.status,
        });
        setSoal(a.soal.map((s) => ({ ...s, opsi: s.opsi || [] })));
        setLoaded(true);
      })
      .catch((e) => { setError(e.message); setLoaded(true); });
  }, [id]);

  const upd = (i, patch) => setSoal(soal.map((s, x) => (x === i ? { ...s, ...patch } : s)));
  const updOpsi = (i, j, v) => upd(i, { opsi: soal[i].opsi.map((o, x) => (x === j ? v : o)) });
  const hapusOpsi = (i, j) => {
    const s = soal[i];
    const opsi = s.opsi.filter((_, x) => x !== j);
    upd(i, { opsi, kunci: s.kunci === j ? 0 : s.kunci > j ? s.kunci - 1 : s.kunci });
  };

  async function simpan(status) {
    setSaving(true);
    setError("");
    const body = {
      ...f, status, mapel: target.mapel, kelas: target.kelas, durasiMenit: Number(f.durasiMenit),
      mulai: f.mulai ? new Date(f.mulai).toISOString() : null,
      selesai: f.selesai ? new Date(f.selesai).toISOString() : null,
    };
    if (!terkunci) body.soal = soal;
    try {
      await api(id ? `/api/guru/asesmen/${id}` : "/api/guru/asesmen", { method: id ? "PUT" : "POST", body });
      router.push("/guru/asesmen");
    } catch (e) {
      setError(e.message);
      setSaving(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  if (!loaded) return <p className="text-sm text-slate-500">Memuat...</p>;
  const totalBobot = soal.reduce((a, s) => a + (Number(s.bobot) || 0), 0);

  return (
    <div className="space-y-5">
      <Link href="/guru/asesmen" className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:underline">
        <ArrowLeft size={16} /> Kembali ke daftar asesmen
      </Link>
      <ErrorBox>{error}</ErrorBox>

      <section className="card space-y-4 p-7">
        <h2 className="text-lg font-bold">Informasi Asesmen</h2>
        <PenugasanPicker penugasan={penugasan} value={target} onChange={setTarget} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Jenis">
            <select className="input" value={f.jenis} onChange={set("jenis")} disabled={terkunci}>
              <option value="kuis">Kuis</option>
              <option value="ujian">Ujian</option>
            </select>
          </Field>
          <Field label="Durasi (menit)">
            <input className="input" type="number" min={1} value={f.durasiMenit} onChange={set("durasiMenit")} required />
          </Field>
        </div>
        <Field label="Judul">
          <input className="input" placeholder="cth. Kuis Bab 3 – Trigonometri" value={f.judul} onChange={set("judul")} required />
        </Field>
        <Field label="Petunjuk">
          <textarea className="input" rows={2} value={f.deskripsi} onChange={set("deskripsi")} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Dibuka pada"><input className="input" type="datetime-local" value={f.mulai} onChange={set("mulai")} /></Field>
          <Field label="Ditutup pada"><input className="input" type="datetime-local" value={f.selesai} onChange={set("selesai")} /></Field>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
          <input type="checkbox" className="h-4 w-4 accent-brand" checked={f.acakSoal} onChange={(e) => setF({ ...f, acakSoal: e.target.checked })} />
          Acak urutan soal untuk setiap siswa
        </label>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold">Soal ({soal.length}) <span className="font-mono text-xs font-normal text-slate-400">· total bobot {totalBobot}</span></h2>
          {!terkunci && (
            <div className="flex gap-2">
              <button type="button" className="btn btn-sand !px-4 !py-2" onClick={() => setSoal([...soal, soalBaru("pilihan_ganda")])}><Plus size={14} /> Pilihan Ganda</button>
              <button type="button" className="btn btn-sand !px-4 !py-2" onClick={() => setSoal([...soal, soalBaru("esai")])}><Plus size={14} /> Esai</button>
            </div>
          )}
        </div>
        {terkunci && (
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {dikerjakan} siswa sudah mengerjakan asesmen ini, sehingga soal dan jenis tidak dapat diubah. Anda masih bisa mengubah jadwal, durasi, dan status.
          </p>
        )}

        {soal.length === 0 && <div className="card p-8 text-center text-sm text-slate-500">Belum ada soal. Tambahkan soal pilihan ganda atau esai.</div>}

        {soal.map((s, i) => (
          <div key={i} className="card space-y-3 p-6">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-semibold text-slate-500">
                SOAL {i + 1} · {s.tipe === "esai" ? "ESAI" : "PILIHAN GANDA"}
              </span>
              {!terkunci && (
                <button type="button" className="icon-btn" onClick={() => setSoal(soal.filter((_, x) => x !== i))} aria-label="Hapus soal"><Trash2 size={15} /></button>
              )}
            </div>
            <textarea className="input" rows={2} placeholder="Tulis pertanyaan..." value={s.teks} onChange={(e) => upd(i, { teks: e.target.value })} disabled={terkunci} />

            {s.tipe === "pilihan_ganda" && (
              <div className="space-y-2">
                {s.opsi.map((o, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <input type="radio" className="h-4 w-4 accent-brand" name={`kunci-${i}`} checked={s.kunci === j} onChange={() => upd(i, { kunci: j })} disabled={terkunci} title="Tandai sebagai jawaban benar" />
                    <span className="w-5 font-mono text-xs text-slate-400">{String.fromCharCode(65 + j)}.</span>
                    <input className="input !py-2" placeholder={`Pilihan ${String.fromCharCode(65 + j)}`} value={o} onChange={(e) => updOpsi(i, j, e.target.value)} disabled={terkunci} />
                    {!terkunci && s.opsi.length > 2 && (
                      <button type="button" className="icon-btn" onClick={() => hapusOpsi(i, j)} aria-label="Hapus pilihan"><Trash2 size={13} /></button>
                    )}
                  </div>
                ))}
                {!terkunci && s.opsi.length < 5 && (
                  <button type="button" className="text-sm font-medium text-brand hover:underline" onClick={() => upd(i, { opsi: [...s.opsi, ""] })}>+ Tambah pilihan</button>
                )}
                <p className="font-mono text-[11px] text-slate-400">Pilih tombol bulat di samping jawaban yang benar.</p>
              </div>
            )}

            <div className="flex items-center gap-2">
              <label className="label !mb-0">Bobot</label>
              <input className="input !w-24 !py-2" type="number" min={0.5} step={0.5} value={s.bobot} onChange={(e) => upd(i, { bobot: e.target.value })} disabled={terkunci} />
            </div>
          </div>
        ))}
      </section>

      <div className="flex flex-wrap justify-end gap-3">
        <button className="btn btn-sand" disabled={saving} onClick={() => simpan("draft")}>Simpan sebagai Draft</button>
        <button className="btn btn-dark" disabled={saving} onClick={() => simpan("terbit")}>{saving ? "Menyimpan..." : "Simpan & Terbitkan"}</button>
      </div>
    </div>
  );
}
