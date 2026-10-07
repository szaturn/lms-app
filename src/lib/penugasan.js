import Kelas from "@/models/Kelas";
import Mapel from "@/models/Mapel";
import { UserError } from "./errors";

/**
 * Daftar penugasan guru: kombinasi (kelas, mata pelajaran) yang diajar.
 * Sumber: (1) guru pengajar yang diatur admin di detail kelas, dan
 *         (2) Mapel dengan guru pengampu = guru ini, untuk kelas pada tingkat yang diajar.
 */
export async function getPenugasan(guruId) {
  const [kelasList, mapelList] = await Promise.all([
    Kelas.find().select("nama tingkat jurusan pengajar").lean(),
    Mapel.find({ guru: guruId }).select("nama tingkat").lean(),
  ]);
  const map = new Map();
  const add = (k, mapel) => {
    const key = `${k._id}|${mapel.toLowerCase()}`;
    if (!map.has(key))
      map.set(key, { kelasId: String(k._id), kelasNama: k.nama, tingkat: k.tingkat, jurusan: k.jurusan, mapel });
  };
  for (const k of kelasList) {
    for (const p of k.pengajar || []) if (String(p.guru) === String(guruId)) add(k, p.mapel);
    for (const m of mapelList) if ((m.tingkat || []).includes(k.tingkat)) add(k, m.nama);
  }
  return [...map.values()].sort((a, b) => a.mapel.localeCompare(b.mapel) || a.kelasNama.localeCompare(b.kelasNama));
}

/** Pastikan guru memang mengajar mapel tsb di semua kelas yang dipilih. */
export async function validasiTarget(guruId, mapel, kelasIds) {
  if (!mapel) throw new UserError("Pilih mata pelajaran");
  if (!Array.isArray(kelasIds) || kelasIds.length === 0) throw new UserError("Pilih minimal satu kelas");
  const pen = (await getPenugasan(guruId)).filter((p) => p.mapel.toLowerCase() === String(mapel).toLowerCase());
  const ok = new Set(pen.map((p) => p.kelasId));
  for (const k of kelasIds) {
    if (!ok.has(String(k))) throw new UserError("Anda tidak mengajar mata pelajaran ini di kelas yang dipilih", 403);
  }
  return { mapel: pen[0].mapel, kelas: [...new Set(kelasIds.map(String))] };
}
