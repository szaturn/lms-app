import Link from "next/link";
import { getServerSession } from "next-auth";
import { Users, FileText, ClipboardList, ListChecks, School } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { getPenugasan } from "@/lib/penugasan";
import { formatTanggal } from "@/lib/format";
import { SCHOOL } from "@/lib/config";
import User from "@/models/User";
import Materi from "@/models/Materi";
import Tugas from "@/models/Tugas";
import Asesmen from "@/models/Asesmen";
import Submission from "@/models/Submission";
import { JurusanChip } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function GuruHome() {
  const session = await getServerSession(authOptions);
  const me = session.user.id;
  await connectDB();

  const pen = await getPenugasan(me);
  const kelasMap = new Map();
  for (const p of pen) {
    if (!kelasMap.has(p.kelasId)) kelasMap.set(p.kelasId, { ...p, mapel: [] });
    kelasMap.get(p.kelasId).mapel.push(p.mapel);
  }
  const kelasIds = [...kelasMap.keys()];
  const now = new Date();

  const myTugas = await Tugas.find({ guru: me }).select("_id").lean();
  const [jumlahSiswa, jumlahMateri, tugasAktif, asesmenTerbit, perluDinilai, tenggat] = await Promise.all([
    User.countDocuments({ role: "siswa", aktif: true, kelas: { $in: kelasIds } }),
    Materi.countDocuments({ guru: me }),
    Tugas.countDocuments({ guru: me, $or: [{ deadline: null }, { deadline: { $gte: now } }] }),
    Asesmen.countDocuments({ guru: me, status: "terbit" }),
    Submission.countDocuments({ tugas: { $in: myTugas.map((t) => t._id) }, submittedAt: { $ne: null }, nilai: null }),
    Tugas.find({ guru: me, deadline: { $gte: now } }).sort({ deadline: 1 }).limit(4).lean(),
  ]);

  const stats = [
    { icon: School, bg: "bg-[#fde9d2] text-[#c5701b]", n: kelasMap.size, unit: "kelas diajar", title: "Kelas", sub: `${new Set(pen.map((p) => p.mapel)).size} mata pelajaran` },
    { icon: Users, bg: "bg-slate-100 text-slate-600", n: jumlahSiswa, unit: "siswa aktif", title: "Total Siswa", sub: "di semua kelas Anda" },
    { icon: FileText, bg: "bg-brand/10 text-brand", n: jumlahMateri, unit: "materi", title: "Materi", sub: "PDF & tautan" },
    { icon: ClipboardList, bg: "bg-[#d9f2df] text-[#2f8f4e]", n: tugasAktif, unit: "tugas aktif", title: "Tugas & Projek", sub: `${perluDinilai} perlu dinilai` },
  ];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-night p-8 text-white sm:p-10">
        <School size={230} strokeWidth={1} className="absolute -right-6 top-1/2 hidden -translate-y-1/2 text-white/[0.06] md:block" />
        <p className="font-mono text-[11px] uppercase tracking-widest text-white/60">Panel Guru</p>
        <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Selamat Datang, {session.user.name}</h2>
        <p className="mt-3 text-white/60">{SCHOOL.nama} · Tahun Ajaran {SCHOOL.tahunAjaran}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {[["Asesmen Terbit", asesmenTerbit], ["Perlu Dinilai", perluDinilai], ["Tugas Aktif", tugasAktif]].map(([l, v]) => (
            <div key={l} className="rounded-xl bg-white/10 px-4 py-3">
              <p className="font-mono text-[11px] text-white/60">{l}</p>
              <p className="mt-0.5 text-lg font-semibold">{v}</p>
            </div>
          ))}
        </div>
      </section>

      {pen.length === 0 && (
        <div className="card p-6 text-sm text-slate-600">
          Anda belum ditugaskan ke kelas atau mata pelajaran mana pun. Minta admin untuk mengatur guru pengampu di menu <b>Guru &amp; Pelajaran</b> atau guru pengajar di detail kelas.
        </div>
      )}

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.title} className="card p-6">
            <span className={`flex h-9 w-9 items-center justify-center rounded-full ${s.bg}`}><s.icon size={17} /></span>
            <p className="mt-3 text-3xl font-bold">{s.n}</p>
            <p className="text-xs text-[#b7864a]">{s.unit}</p>
            <p className="mt-3 text-sm font-bold">{s.title}</p>
            <p className="font-mono text-[11px] text-[#2f9e5a]">{s.sub}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.15fr_1fr]">
        <div className="card p-7">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-bold">Kelas yang Diajar</h3>
            <Link href="/guru/kelas" className="text-sm font-medium text-brand hover:underline">Lihat semua</Link>
          </div>
          {kelasMap.size === 0 ? (
            <p className="text-sm text-slate-500">Belum ada kelas.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {[...kelasMap.values()].slice(0, 6).map((k) => (
                <li key={k.kelasId}>
                  <Link href={`/guru/kelas/${k.kelasId}`} className="flex items-center gap-3 py-3 hover:opacity-80">
                    <JurusanChip jurusan={k.jurusan} />
                    <span className="font-semibold">{k.kelasNama}</span>
                    <span className="ml-auto truncate font-mono text-xs text-slate-400">{k.mapel.join(", ")}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-7">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-bold">Tenggat Terdekat</h3>
            <Link href="/guru/tugas" className="text-sm font-medium text-brand hover:underline">Semua tugas</Link>
          </div>
          {tenggat.length === 0 ? (
            <p className="text-sm text-slate-500">Tidak ada tenggat mendatang.</p>
          ) : (
            <ul className="space-y-4">
              {tenggat.map((t) => (
                <li key={t._id} className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ember" />
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs text-slate-400">{t.mapel}</p>
                    <Link href={`/guru/tugas/${t._id}`} className="block truncate text-sm font-semibold hover:underline">{t.judul}</Link>
                  </div>
                  <span className="shrink-0 font-mono text-xs text-slate-400">{formatTanggal(t.deadline)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
