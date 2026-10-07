import User from "@/models/User";
import Tugas from "@/models/Tugas";
import Asesmen from "@/models/Asesmen";
import Submission from "@/models/Submission";
import Attempt from "@/models/Attempt";
import { getPenugasan } from "./penugasan";

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const avg = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
const r1 = (n) => (n == null ? null : Math.round(n * 10) / 10);

/**
 * Rekap nilai satu mata pelajaran milik seorang guru.
 * Komponen: rata-rata tugas, rata-rata kuis, rata-rata ujian -> nilai akhir berbobot.
 * Aturan: tugas/asesmen yang sudah lewat tenggat tapi belum ada nilai dihitung 0;
 * yang belum jatuh tempo dan belum dinilai tidak dihitung. Komponen yang belum ada
 * dikeluarkan dan bobotnya dinormalkan.
 */
export async function hitungRekap({ guruId, mapel, kelasId, bobot }) {
  const w = { tugas: 30, kuis: 20, ujian: 50, ...(bobot || {}) };
  const pen = (await getPenugasan(guruId)).filter((p) => p.mapel.toLowerCase() === String(mapel).toLowerCase());
  const target = kelasId ? pen.filter((p) => p.kelasId === String(kelasId)) : pen;
  if (!target.length) return { rows: [], perKelas: [], perJurusan: [], rata: null };

  const kelasMap = Object.fromEntries(target.map((p) => [p.kelasId, p]));
  const kelasIds = Object.keys(kelasMap);
  const rx = new RegExp(`^${esc(String(mapel))}$`, "i");

  const siswa = await User.find({ role: "siswa", aktif: true, kelas: { $in: kelasIds } })
    .select("nama username kelas").sort({ nama: 1 }).lean();
  const [tugasList, asesList] = await Promise.all([
    Tugas.find({ guru: guruId, mapel: rx, kelas: { $in: kelasIds } }).select("kelas deadline nilaiMaks").lean(),
    Asesmen.find({ guru: guruId, mapel: rx, status: "terbit", kelas: { $in: kelasIds } }).select("kelas jenis selesai").lean(),
  ]);
  const [subs, atts] = await Promise.all([
    Submission.find({ tugas: { $in: tugasList.map((t) => t._id) } }).select("tugas siswa nilai").lean(),
    Attempt.find({ asesmen: { $in: asesList.map((a) => a._id) } }).select("asesmen siswa nilai").lean(),
  ]);
  const subMap = new Map(subs.map((s) => [`${s.tugas}|${s.siswa}`, s.nilai]));
  const attMap = new Map(atts.map((a) => [`${a.asesmen}|${a.siswa}`, a.nilai]));
  const now = new Date();
  const dalamKelas = (arr, kid) => arr.some((k) => String(k) === kid);

  const rows = siswa.map((s) => {
    const kid = String(s.kelas);
    const tugas = [], kuis = [], ujian = [];
    for (const t of tugasList) {
      if (!dalamKelas(t.kelas, kid)) continue;
      const n = subMap.get(`${t._id}|${s._id}`);
      if (n != null) tugas.push((n / (t.nilaiMaks || 100)) * 100);
      else if (t.deadline && t.deadline < now) tugas.push(0);
    }
    for (const a of asesList) {
      if (!dalamKelas(a.kelas, kid)) continue;
      const n = attMap.get(`${a._id}|${s._id}`);
      const bucket = a.jenis === "kuis" ? kuis : ujian;
      if (n != null) bucket.push(n);
      else if (a.selesai && a.selesai < now) bucket.push(0);
    }
    const komp = [[avg(tugas), w.tugas], [avg(kuis), w.kuis], [avg(ujian), w.ujian]].filter(([v, b]) => v != null && b > 0);
    const sumB = komp.reduce((x, [, b]) => x + b, 0);
    const akhir = sumB > 0 ? komp.reduce((x, [v, b]) => x + v * b, 0) / sumB : null;
    const p = kelasMap[kid];
    return {
      siswaId: String(s._id), nama: s.nama, nisn: s.username, kelasId: kid, kelas: p.kelasNama, jurusan: p.jurusan,
      tugas: r1(avg(tugas)), kuis: r1(avg(kuis)), ujian: r1(avg(ujian)), akhir: r1(akhir),
    };
  });

  const stat = (list) => {
    const v = list.map((r) => r.akhir).filter((x) => x != null);
    return { jumlah: list.length, rata: r1(avg(v)), tertinggi: v.length ? Math.max(...v) : null, terendah: v.length ? Math.min(...v) : null };
  };
  const perKelas = target.map((p) => ({
    kelasId: p.kelasId, kelas: p.kelasNama, jurusan: p.jurusan, ...stat(rows.filter((r) => r.kelasId === p.kelasId)),
  }));
  const perJurusan = [...new Set(target.map((p) => p.jurusan))].map((j) => ({
    jurusan: j, jumlahKelas: target.filter((p) => p.jurusan === j).length, ...stat(rows.filter((r) => r.jurusan === j)),
  }));
  return { rows, perKelas, perJurusan, rata: stat(rows).rata };
}
