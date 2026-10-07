import Tugas from "@/models/Tugas";
import Submission from "@/models/Submission";
import FileDoc from "@/models/FileDoc";
import User from "@/models/User";
import "@/models/Kelas";
import { guruRoute, json } from "@/lib/api";
import { validasiTarget } from "@/lib/penugasan";
import { bacaForm, isUpload, simpanPdf, hapusFile } from "@/lib/files";
import { bacaFieldTugas } from "@/lib/tugas";

// Detail tugas + daftar siswa target beserta pengumpulan/nilainya
export const GET = guruRoute(async (req, { params }, session) => {
  const tugas = await Tugas.findOne({ _id: params.id, guru: session.user.id }).populate("kelas", "nama").lean();
  if (!tugas) return json({ message: "Tugas tidak ditemukan" }, 404);

  const siswa = await User.find({ role: "siswa", aktif: true, kelas: { $in: tugas.kelas.map((k) => k._id) } })
    .select("nama username kelas jenisKelamin").populate("kelas", "nama").sort({ nama: 1 }).lean();
  const subs = await Submission.find({ tugas: tugas._id }).lean();
  const map = Object.fromEntries(subs.map((s) => [String(s.siswa), s]));

  return json({ tugas, siswa: siswa.map((s) => ({ ...s, submission: map[String(s._id)] || null })) });
});

export const PUT = guruRoute(async (req, { params }, session) => {
  const doc = await Tugas.findOne({ _id: params.id, guru: session.user.id });
  if (!doc) return json({ message: "Tugas tidak ditemukan" }, 404);

  const f = await bacaForm(req);
  if (!f.judul) return json({ message: "Judul tugas wajib diisi" }, 400);
  const t = await validasiTarget(session.user.id, f.mapel, f.kelas);
  const extra = bacaFieldTugas(f.fd);

  let fileId = doc.file;
  let fileNama = doc.fileNama;
  if (isUpload(f.file)) {
    const baru = await simpanPdf(f.file, { owner: session.user.id, kelas: t.kelas });
    await hapusFile(doc.file);
    fileId = baru._id;
    fileNama = baru.nama;
  } else if (f.hapusFile) {
    await hapusFile(doc.file);
    fileId = null;
    fileNama = "";
  }

  Object.assign(doc, { mapel: t.mapel, kelas: t.kelas, judul: f.judul, deskripsi: f.deskripsi, file: fileId, fileNama, links: f.links, ...extra });
  await doc.save();
  if (fileId) await FileDoc.updateOne({ _id: fileId }, { $set: { kelas: t.kelas } });
  return json({ message: "Tugas diperbarui" });
});

export const DELETE = guruRoute(async (req, { params }, session) => {
  const doc = await Tugas.findOne({ _id: params.id, guru: session.user.id });
  if (!doc) return json({ message: "Tugas tidak ditemukan" }, 404);
  const subs = await Submission.find({ tugas: doc._id }).select("file").lean();
  await FileDoc.deleteMany({ _id: { $in: [doc.file, ...subs.map((s) => s.file)].filter(Boolean) } });
  await Submission.deleteMany({ tugas: doc._id });
  await doc.deleteOne();
  return json({ message: "Tugas dihapus" });
});
