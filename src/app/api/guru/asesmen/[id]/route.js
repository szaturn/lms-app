import Asesmen from "@/models/Asesmen";
import Attempt from "@/models/Attempt";
import { guruRoute, json } from "@/lib/api";
import { UserError } from "@/lib/errors";
import { validasiTarget } from "@/lib/penugasan";
import { bacaAsesmen, bersihkanSoal } from "@/lib/asesmen-input";

export const GET = guruRoute(async (req, { params }, session) => {
  const a = await Asesmen.findOne({ _id: params.id, guru: session.user.id }).lean();
  if (!a) return json({ message: "Asesmen tidak ditemukan" }, 404);
  const dikerjakan = await Attempt.countDocuments({ asesmen: a._id });
  return json({ asesmen: a, dikerjakan });
});

export const PUT = guruRoute(async (req, { params }, session) => {
  const a = await Asesmen.findOne({ _id: params.id, guru: session.user.id });
  if (!a) return json({ message: "Asesmen tidak ditemukan" }, 404);
  const body = await req.json();
  const data = bacaAsesmen(body);
  const t = await validasiTarget(session.user.id, body.mapel, body.kelas);
  const dikerjakan = await Attempt.countDocuments({ asesmen: a._id });

  if (body.soal !== undefined) {
    if (dikerjakan > 0) throw new UserError("Asesmen sudah dikerjakan siswa, soal tidak dapat diubah");
    a.soal = bersihkanSoal(body.soal);
  }
  if (dikerjakan > 0 && data.jenis !== a.jenis) throw new UserError("Jenis tidak dapat diubah setelah ada yang mengerjakan");
  if (data.status === "terbit" && a.soal.length === 0) throw new UserError("Tambahkan minimal satu soal sebelum menerbitkan");

  Object.assign(a, data, { mapel: t.mapel, kelas: t.kelas });
  await a.save();
  return json({ message: "Asesmen diperbarui" });
});

export const DELETE = guruRoute(async (req, { params }, session) => {
  const a = await Asesmen.findOne({ _id: params.id, guru: session.user.id });
  if (!a) return json({ message: "Asesmen tidak ditemukan" }, 404);
  await Attempt.deleteMany({ asesmen: a._id });
  await a.deleteOne();
  return json({ message: "Asesmen dihapus" });
});
