import Kelas from "@/models/Kelas";
import User from "@/models/User";

/** Mengembalikan pesan error jika kelas penuh / tidak ada, atau null jika masih muat. */
export async function cekKapasitas(kelasId, excludeUserId) {
  if (!kelasId) return null;
  const k = await Kelas.findById(kelasId).select("nama kapasitas").lean();
  if (!k) return "Kelas tidak ditemukan";
  const filter = { role: "siswa", kelas: kelasId };
  if (excludeUserId) filter._id = { $ne: excludeUserId };
  const n = await User.countDocuments(filter);
  const kapasitas = k.kapasitas ?? 36;
  return n >= kapasitas ? `Kelas ${k.nama} sudah penuh (${kapasitas} siswa)` : null;
}

export function kelasBody(body) {
  const out = {};
  if (body.nama !== undefined) out.nama = String(body.nama).trim();
  if (body.tingkat !== undefined) out.tingkat = body.tingkat;
  if (body.jurusan !== undefined) out.jurusan = String(body.jurusan).trim();
  if (body.waliKelas !== undefined) out.waliKelas = String(body.waliKelas).trim();
  if (body.ruangan !== undefined) out.ruangan = String(body.ruangan).trim();
  if (body.kapasitas !== undefined) out.kapasitas = Number(body.kapasitas);
  return out;
}
