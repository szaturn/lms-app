import Asesmen from "@/models/Asesmen";
import Attempt from "@/models/Attempt";
import "@/models/Kelas";
import { guruRoute, json } from "@/lib/api";
import { UserError } from "@/lib/errors";
import { validasiTarget } from "@/lib/penugasan";
import { bacaAsesmen, bersihkanSoal } from "@/lib/asesmen-input";

export const GET = guruRoute(async (req, ctx, session) => {
  const list = await Asesmen.find({ guru: session.user.id }).populate("kelas", "nama").sort({ createdAt: -1 }).lean();
  const att = await Attempt.aggregate([
    { $match: { asesmen: { $in: list.map((a) => a._id) } } },
    { $group: { _id: "$asesmen", n: { $sum: 1 } } },
  ]);
  const map = Object.fromEntries(att.map((a) => [String(a._id), a.n]));
  return json({
    asesmen: list.map(({ soal, ...a }) => ({ ...a, jumlahSoal: soal.length, dikerjakan: map[String(a._id)] || 0 })),
  });
});

export const POST = guruRoute(async (req, ctx, session) => {
  const body = await req.json();
  const data = bacaAsesmen(body);
  const t = await validasiTarget(session.user.id, body.mapel, body.kelas);
  const soal = bersihkanSoal(body.soal || []);
  if (data.status === "terbit" && soal.length === 0) throw new UserError("Tambahkan minimal satu soal sebelum menerbitkan");
  const a = await Asesmen.create({ ...data, guru: session.user.id, mapel: t.mapel, kelas: t.kelas, soal });
  return json({ message: "Asesmen disimpan", id: a._id }, 201);
});
