import Mapel from "@/models/Mapel";
import { adminRoute, json } from "@/lib/api";
import { mapelBody } from "@/lib/mapel";

export const PUT = adminRoute(async (req, { params }) => {
  const m = await Mapel.findById(params.id);
  if (!m) return json({ message: "Mata pelajaran tidak ditemukan" }, 404);
  const { data, error } = await mapelBody(await req.json());
  if (error) return json({ message: error }, 400);
  Object.assign(m, data);
  await m.save();
  return json({ message: "Mata pelajaran diperbarui" });
});

export const DELETE = adminRoute(async (req, { params }) => {
  const m = await Mapel.findById(params.id);
  if (!m) return json({ message: "Mata pelajaran tidak ditemukan" }, 404);
  await m.deleteOne();
  return json({ message: "Mata pelajaran dihapus" });
});
