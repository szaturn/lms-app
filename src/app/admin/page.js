import { getServerSession } from "next-auth";
import { Users, UserCheck, School, BookOpen } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { SCHOOL } from "@/lib/config";
import { timeAgo } from "@/lib/format";
import User from "@/models/User";
import Kelas from "@/models/Kelas";
import Mapel from "@/models/Mapel";
import DistribusiChart from "@/components/DistribusiChart";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const session = await getServerSession(authOptions);
  await connectDB();

  const bulanIni = new Date();
  bulanIni.setDate(1);
  bulanIni.setHours(0, 0, 0, 0);

  const [siswaAktif, siswaTotal, guruAktif, guruTotal, siswaBaru, guruBaru, kelasList, mapelList, sebaran, recSiswa, recGuru, recKelas, recMapel] =
    await Promise.all([
      User.countDocuments({ role: "siswa", aktif: true }),
      User.countDocuments({ role: "siswa" }),
      User.countDocuments({ role: "guru", aktif: true }),
      User.countDocuments({ role: "guru" }),
      User.countDocuments({ role: "siswa", createdAt: { $gte: bulanIni } }),
      User.countDocuments({ role: "guru", createdAt: { $gte: bulanIni } }),
      Kelas.find().select("tingkat jurusan").lean(),
      Mapel.find().select("kategori").lean(),
      User.aggregate([
        { $match: { role: "siswa", aktif: true, kelas: { $ne: null } } },
        { $group: { _id: "$kelas", n: { $sum: 1 } } },
      ]),
      User.find({ role: "siswa" }).sort({ createdAt: -1 }).limit(4).populate("kelas", "nama").lean(),
      User.find({ role: "guru" }).sort({ createdAt: -1 }).limit(3).lean(),
      Kelas.find().sort({ createdAt: -1 }).limit(3).lean(),
      Mapel.find().sort({ createdAt: -1 }).limit(3).lean(),
    ]);

  // distribusi siswa per tingkat & jurusan
  const countMap = Object.fromEntries(sebaran.map((s) => [String(s._id), s.n]));
  const dist = ["X", "XI", "XII"].map((t) => ({ label: `Kelas ${t}`, ipa: 0, ips: 0 }));
  const idx = { X: 0, XI: 1, XII: 2 };
  const kelasPerTingkat = { X: 0, XI: 0, XII: 0 };
  let kelasTerisi = 0;
  for (const k of kelasList) {
    const n = countMap[String(k._id)] || 0;
    if (n > 0) kelasTerisi++;
    kelasPerTingkat[k.tingkat]++;
    const d = dist[idx[k.tingkat]];
    if (!d) continue;
    if (k.jurusan === "IPA") d.ipa += n;
    else if (k.jurusan === "IPS") d.ips += n;
  }

  // ringkasan mapel
  const kat = { Wajib: 0, Peminatan: 0, Mulok: 0 };
  mapelList.forEach((m) => { kat[m.kategori] = (kat[m.kategori] || 0) + 1; });
  const ringkasMapel =
    [kat.Wajib && `${kat.Wajib} wajib`, kat.Peminatan && `${kat.Peminatan} peminatan`, kat.Mulok && `${kat.Mulok} mulok`]
      .filter(Boolean)
      .join(" + ") || "Belum ada mapel";

  // aktivitas terbaru (diambil dari data yang baru dibuat)
  const aktivitas = [
    ...recSiswa.map((u) => ({ at: u.createdAt, judul: "Siswa baru ditambahkan", isi: `${u.nama} – ${u.kelas?.nama || "belum ada kelas"}` })),
    ...recGuru.map((u) => ({ at: u.createdAt, judul: "Guru baru terdaftar", isi: `${u.nama}${u.mapelUtama ? " – " + u.mapelUtama : ""}` })),
    ...recKelas.map((k) => ({ at: k.createdAt, judul: "Kelas baru dibuat", isi: `${k.nama}${k.ruangan ? " – Ruang " + k.ruangan : ""}` })),
    ...recMapel.map((m) => ({ at: m.createdAt, judul: "Mata pelajaran ditambahkan", isi: m.nama })),
  ]
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 6);

  const stats = [
    { icon: Users, bg: "bg-slate-100 text-slate-600", n: siswaAktif, unit: "siswa aktif", title: "Total Siswa", sub: `+${siswaBaru} bulan ini` },
    { icon: UserCheck, bg: "bg-[#d9f2df] text-[#2f8f4e]", n: guruAktif, unit: "pengajar aktif", title: "Total Guru", sub: `+${guruBaru} guru baru bulan ini` },
    { icon: School, bg: "bg-[#fde9d2] text-[#c5701b]", n: kelasList.length, unit: "rombongan belajar", title: "Total Kelas", sub: `X: ${kelasPerTingkat.X} · XI: ${kelasPerTingkat.XI} · XII: ${kelasPerTingkat.XII}` },
    { icon: BookOpen, bg: "bg-brand/10 text-brand", n: mapelList.length, unit: "mapel aktif", title: "Mata Pelajaran", sub: ringkasMapel },
  ];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-night p-8 text-white sm:p-10">
        <School size={230} strokeWidth={1} className="absolute -right-6 top-1/2 hidden -translate-y-1/2 text-white/[0.06] md:block" />
        <p className="font-mono text-[11px] uppercase tracking-widest text-white/60">Panel Administrator</p>
        <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Selamat Datang, {session?.user?.name || "Admin"}</h2>
        <p className="mt-3 text-white/60">{SCHOOL.nama} · Tahun Ajaran {SCHOOL.tahunAjaran}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {[
            ["Siswa Aktif", `${siswaAktif} / ${siswaTotal}`],
            ["Guru Aktif", `${guruAktif} / ${guruTotal}`],
            ["Kelas Terisi", `${kelasTerisi} / ${kelasList.length}`],
          ].map(([l, v]) => (
            <div key={l} className="rounded-xl bg-white/10 px-4 py-3">
              <p className="font-mono text-[11px] text-white/60">{l}</p>
              <p className="mt-0.5 text-lg font-semibold">{v}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Statistik */}
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

      {/* Chart + aktivitas */}
      <section className="grid gap-5 xl:grid-cols-[1.15fr_1fr]">
        <div className="card p-7">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold">Distribusi Siswa per Tingkat</h3>
            <span className="font-mono text-xs text-slate-400">Siswa aktif</span>
          </div>
          <DistribusiChart data={dist} />
        </div>

        <div className="card p-7">
          <h3 className="mb-5 text-lg font-bold">Aktivitas Terbaru</h3>
          {aktivitas.length === 0 ? (
            <p className="text-sm text-slate-500">Belum ada aktivitas.</p>
          ) : (
            <ul className="space-y-4">
              {aktivitas.map((a, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ember" />
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs text-slate-400">{a.judul}</p>
                    <p className="truncate text-sm font-semibold">{a.isi}</p>
                  </div>
                  <span className="shrink-0 font-mono text-xs text-slate-400">{timeAgo(a.at)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
