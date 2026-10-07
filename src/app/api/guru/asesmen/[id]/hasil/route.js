import Asesmen from "@/models/Asesmen";
import Attempt from "@/models/Attempt";
import User from "@/models/User";
import "@/models/Kelas";
import { guruRoute, json } from "@/lib/api";
import { hitungAttempt } from "@/lib/asesmen";

export const GET = guruRoute(async (req, { params }, session) => {
  const a = await Asesmen.findOne({ _id: params.id, guru: session.user.id }).populate("kelas", "nama").lean();
  if (!a) return json({ message: "Asesmen tidak ditemukan" }, 404);
  const siswa = await User.find({ role: "siswa", aktif: true, kelas: { $in: a.kelas.map((k) => k._id) } })
    .select("nama username kelas").populate("kelas", "nama").sort({ nama: 1 }).lean();
  const atts = await Attempt.find({ asesmen: a._id }).lean();
  const map = Object.fromEntries(atts.map((x) => [String(x.siswa), x]));
  return json({ asesmen: a, siswa: siswa.map((s) => ({ ...s, attempt: map[String(s._id)] || null })) });
});

// Beri skor soal esai. Body: { attempt, skor: { [soalId]: angka } }
export const PUT = guruRoute(async (req, { params }, session) => {
  const a = await Asesmen.findOne({ _id: params.id, guru: session.user.id }).lean();
  if (!a) return json({ message: "Asesmen tidak ditemukan" }, 404);
  const { attempt, skor } = await req.json();
  const att = await Attempt.findOne({ _id: attempt, asesmen: a._id });
  if (!att) return json({ message: "Data pengerjaan tidak ditemukan" }, 404);

  const hasil = hitungAttempt(a, att.jawaban, skor || {});
  att.jawaban = hasil.jawaban;
  att.nilai = hasil.nilai;
  att.dinilai = true;
  await att.save();
  return json({ message: "Penilaian disimpan", nilai: hasil.nilai });
});
