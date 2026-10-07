import Tugas from "@/models/Tugas";
import Submission from "@/models/Submission";
import User from "@/models/User";
import { guruRoute, json } from "@/lib/api";

// Simpan nilai & feedback untuk satu siswa. Body: { siswa, nilai (angka | null), feedback }
export const PUT = guruRoute(async (req, { params }, session) => {
  const tugas = await Tugas.findOne({ _id: params.id, guru: session.user.id }).select("kelas nilaiMaks").lean();
  if (!tugas) return json({ message: "Tugas tidak ditemukan" }, 404);

  const { siswa, nilai, feedback } = await req.json();
  const s = await User.findOne({ _id: siswa, role: "siswa", kelas: { $in: tugas.kelas } }).select("_id").lean();
  if (!s) return json({ message: "Siswa tidak termasuk dalam kelas tugas ini" }, 400);

  let n = null;
  if (nilai !== null && nilai !== "" && nilai !== undefined) {
    n = Number(nilai);
    if (isNaN(n) || n < 0 || n > tugas.nilaiMaks)
      return json({ message: `Nilai harus antara 0 dan ${tugas.nilaiMaks}` }, 400);
  }
  const sub = await Submission.findOneAndUpdate(
    { tugas: tugas._id, siswa: s._id },
    { $set: { nilai: n, feedback: String(feedback || "").trim().slice(0, 1000), dinilaiAt: n == null ? null : new Date() } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return json({ message: "Nilai disimpan", submission: sub });
});
