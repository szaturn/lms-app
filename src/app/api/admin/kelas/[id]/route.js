import Kelas from "@/models/Kelas";
import User from "@/models/User";
import { adminRoute, json } from "@/lib/api";
import { kelasBody } from "@/lib/kelas";

export const GET = adminRoute(async (req, { params }) => {
  const kelas = await Kelas.findById(params.id).populate("pengajar.guru", "nama username").lean();
  if (!kelas) return json({ message: "Kelas tidak ditemukan" }, 404);
  const siswa = await User.find({ role: "siswa", kelas: kelas._id })
    .select("nama username aktif jenisKelamin")
    .sort({ nama: 1 })
    .lean();
  return json({
    kelas: { ...kelas, kapasitas: kelas.kapasitas ?? 36, waliKelas: kelas.waliKelas || "", ruangan: kelas.ruangan || "" },
    siswa,
  });
});

export const PUT = adminRoute(async (req, { params }) => {
  const body = await req.json();
  const kelas = await Kelas.findById(params.id);
  if (!kelas) return json({ message: "Kelas tidak ditemukan" }, 404);

  const data = kelasBody(body);
  if (data.kapasitas !== undefined) {
    const jumlah = await User.countDocuments({ role: "siswa", kelas: kelas._id });
    if (!(data.kapasitas >= 1) || data.kapasitas < jumlah)
      return json({ message: `Kapasitas tidak boleh kurang dari jumlah siswa saat ini (${jumlah})` }, 400);
  }
  Object.assign(kelas, data);

  if (Array.isArray(body.pengajar)) {
    // buang kosong + duplikat (guru & mapel yang sama)
    const seen = new Set();
    const clean = [];
    for (const p of body.pengajar) {
      const mapel = String(p.mapel || "").trim();
      if (!p.guru || !mapel) continue;
      const key = `${p.guru}|${mapel.toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      clean.push({ guru: p.guru, mapel });
    }
    const ids = [...new Set(clean.map((p) => String(p.guru)))];
    const valid = await User.countDocuments({ _id: { $in: ids }, role: "guru" });
    if (valid !== ids.length) return json({ message: "Ada guru yang tidak valid" }, 400);
    kelas.pengajar = clean;
  }

  await kelas.save();
  return json({ message: "Kelas diperbarui" });
});

export const DELETE = adminRoute(async (req, { params }) => {
  const kelas = await Kelas.findById(params.id);
  if (!kelas) return json({ message: "Kelas tidak ditemukan" }, 404);
  await User.updateMany({ kelas: kelas._id }, { $set: { kelas: null } });
  await kelas.deleteOne();
  return json({ message: "Kelas dihapus" });
});
