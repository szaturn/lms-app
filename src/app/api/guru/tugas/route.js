import mongoose from "mongoose";
import Tugas from "@/models/Tugas";
import Submission from "@/models/Submission";
import User from "@/models/User";
import "@/models/Kelas";
import { guruRoute, json } from "@/lib/api";
import { validasiTarget } from "@/lib/penugasan";
import { bacaForm, isUpload, simpanPdf, hapusFile } from "@/lib/files";
import { bacaFieldTugas } from "@/lib/tugas";

export const GET = guruRoute(async (req, ctx, session) => {
  const list = await Tugas.find({ guru: session.user.id }).populate("kelas", "nama").sort({ createdAt: -1 }).lean();
  const subs = await Submission.find({ tugas: { $in: list.map((t) => t._id) } }).select("tugas submittedAt nilai").lean();

  const kelasIds = [...new Set(list.flatMap((t) => t.kelas.map((k) => String(k._id))))];
  const counts = await User.aggregate([
    { $match: { role: "siswa", aktif: true, kelas: { $in: kelasIds.map((k) => new mongoose.Types.ObjectId(k)) } } },
    { $group: { _id: "$kelas", n: { $sum: 1 } } },
  ]);
  const perKelas = Object.fromEntries(counts.map((c) => [String(c._id), c.n]));

  return json({
    tugas: list.map((t) => {
      const s = subs.filter((x) => String(x.tugas) === String(t._id));
      return {
        ...t,
        totalSiswa: t.kelas.reduce((a, k) => a + (perKelas[String(k._id)] || 0), 0),
        terkumpul: s.filter((x) => x.submittedAt).length,
        dinilai: s.filter((x) => x.nilai != null).length,
      };
    }),
  });
});

export const POST = guruRoute(async (req, ctx, session) => {
  const f = await bacaForm(req);
  if (!f.judul) return json({ message: "Judul tugas wajib diisi" }, 400);
  const t = await validasiTarget(session.user.id, f.mapel, f.kelas);
  const extra = bacaFieldTugas(f.fd);

  const file = isUpload(f.file) ? await simpanPdf(f.file, { owner: session.user.id, kelas: t.kelas }) : null;
  try {
    const doc = await Tugas.create({
      guru: session.user.id, mapel: t.mapel, kelas: t.kelas, judul: f.judul, deskripsi: f.deskripsi,
      file: file?._id || null, fileNama: file?.nama || "", links: f.links, ...extra,
    });
    return json({ message: "Tugas dibuat", id: doc._id }, 201);
  } catch (e) {
    await hapusFile(file?._id);
    throw e;
  }
});
