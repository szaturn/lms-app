import Materi from "@/models/Materi";
import "@/models/Kelas";
import { guruRoute, json } from "@/lib/api";
import { validasiTarget } from "@/lib/penugasan";
import { bacaForm, isUpload, simpanPdf, hapusFile } from "@/lib/files";

export const GET = guruRoute(async (req, ctx, session) => {
  const materi = await Materi.find({ guru: session.user.id }).populate("kelas", "nama").sort({ createdAt: -1 }).lean();
  return json({ materi });
});

export const POST = guruRoute(async (req, ctx, session) => {
  const f = await bacaForm(req);
  if (!f.judul) return json({ message: "Judul materi wajib diisi" }, 400);
  const t = await validasiTarget(session.user.id, f.mapel, f.kelas);
  if (!isUpload(f.file) && f.links.length === 0)
    return json({ message: "Unggah file PDF atau tambahkan minimal satu tautan" }, 400);

  const file = isUpload(f.file) ? await simpanPdf(f.file, { owner: session.user.id, kelas: t.kelas }) : null;
  try {
    const m = await Materi.create({
      guru: session.user.id, mapel: t.mapel, kelas: t.kelas, judul: f.judul, deskripsi: f.deskripsi,
      file: file?._id || null, fileNama: file?.nama || "", links: f.links,
    });
    return json({ message: "Materi ditambahkan", id: m._id }, 201);
  } catch (e) {
    await hapusFile(file?._id);
    throw e;
  }
});
