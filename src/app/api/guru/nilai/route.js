import { guruRoute, json } from "@/lib/api";
import { hitungRekap } from "@/lib/rekap";

// GET /api/guru/nilai?mapel=Matematika&kelas=<id>&bt=30&bk=20&bu=50
export const GET = guruRoute(async (req, ctx, session) => {
  const sp = new URL(req.url).searchParams;
  const mapel = sp.get("mapel");
  if (!mapel) return json({ message: "Pilih mata pelajaran" }, 400);
  const num = (k, d) => { const v = Number(sp.get(k) ?? d); return isNaN(v) || v < 0 ? d : v; };
  const bobot = { tugas: num("bt", 30), kuis: num("bk", 20), ujian: num("bu", 50) };
  if (bobot.tugas + bobot.kuis + bobot.ujian <= 0) return json({ message: "Total bobot harus lebih dari 0" }, 400);
  const data = await hitungRekap({ guruId: session.user.id, mapel, kelasId: sp.get("kelas") || null, bobot });
  return json(data);
});
