import Kelas from "@/models/Kelas";
import User from "@/models/User";
import { adminRoute, json } from "@/lib/api";
import { kelasBody } from "@/lib/kelas";

export const GET = adminRoute(async () => {
  const list = await Kelas.find().sort({ tingkat: 1, nama: 1 }).lean();
  const counts = await User.aggregate([
    { $match: { role: "siswa", kelas: { $ne: null } } },
    { $group: { _id: "$kelas", n: { $sum: 1 } } },
  ]);
  const map = Object.fromEntries(counts.map((c) => [String(c._id), c.n]));
  return json({
    kelas: list.map((k) => ({
      ...k,
      kapasitas: k.kapasitas ?? 36,
      waliKelas: k.waliKelas || "",
      ruangan: k.ruangan || "",
      jumlahSiswa: map[String(k._id)] || 0,
    })),
  });
});

export const POST = adminRoute(async (req) => {
  const data = kelasBody(await req.json());
  if (!data.nama || !data.tingkat || !data.jurusan)
    return json({ message: "Tingkat, jurusan, dan nama kelas wajib diisi" }, 400);
  if (data.kapasitas !== undefined && !(data.kapasitas >= 1))
    return json({ message: "Kapasitas minimal 1 siswa" }, 400);
  const k = await Kelas.create(data);
  return json({ message: "Kelas ditambahkan", id: k._id }, 201);
});
