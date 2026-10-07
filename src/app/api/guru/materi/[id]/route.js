import Materi from "@/models/Materi";
import FileDoc from "@/models/FileDoc";
import { guruRoute, json } from "@/lib/api";
import { validasiTarget } from "@/lib/penugasan";
import { bacaForm, isUpload, simpanPdf, hapusFile } from "@/lib/files";

export const PUT = guruRoute(async (req, { params }, session) => {
  const m = await Materi.findOne({ _id: params.id, guru: session.user.id });
  if (!m) return json({ message: "Materi tidak ditemukan" }, 404);

  const f = await bacaForm(req);
  if (!f.judul) return json({ message: "Judul materi wajib diisi" }, 400);
  const t = await validasiTarget(session.user.id, f.mapel, f.kelas);

  let fileId = m.file;
  let fileNama = m.fileNama;
  if (isUpload(f.file)) {
    const baru = await simpanPdf(f.file, { owner: session.user.id, kelas: t.kelas });
    await hapusFile(m.file);
    fileId = baru._id;
    fileNama = baru.nama;
  } else if (f.hapusFile) {
    await hapusFile(m.file);
    fileId = null;
    fileNama = "";
  }
  if (!fileId && f.links.length === 0)
    return json({ message: "Materi harus punya file PDF atau minimal satu tautan" }, 400);

  Object.assign(m, { mapel: t.mapel, kelas: t.kelas, judul: f.judul, deskripsi: f.deskripsi, file: fileId, fileNama, links: f.links });
  await m.save();
  if (fileId) await FileDoc.updateOne({ _id: fileId }, { $set: { kelas: t.kelas } });
  return json({ message: "Materi diperbarui" });
});

export const DELETE = guruRoute(async (req, { params }, session) => {
  const m = await Materi.findOne({ _id: params.id, guru: session.user.id });
  if (!m) return json({ message: "Materi tidak ditemukan" }, 404);
  await hapusFile(m.file);
  await m.deleteOne();
  return json({ message: "Materi dihapus" });
});
