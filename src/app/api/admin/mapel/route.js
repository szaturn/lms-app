import Mapel from "@/models/Mapel";
import { adminRoute, json } from "@/lib/api";
import { mapelBody, TINGKAT } from "@/lib/mapel";

export const GET = adminRoute(async () => {
  const mapel = await Mapel.find().populate("guru", "nama").sort({ nama: 1 }).lean();
  return json({ mapel });
});

export const POST = adminRoute(async (req) => {
  const { data, error } = await mapelBody(await req.json());
  if (error) return json({ message: error }, 400);
  if (!data.nama || !data.kode) return json({ message: "Nama pelajaran dan kode mapel wajib diisi" }, 400);
  if (!data.tingkat) data.tingkat = TINGKAT;
  const m = await Mapel.create(data);
  return json({ message: "Mata pelajaran ditambahkan", id: m._id }, 201);
});
