import User from "@/models/User";

export const TINGKAT = ["X", "XI", "XII"];

/** Validasi & rapikan input mapel. Mengembalikan { data } atau { error } */
export async function mapelBody(body) {
  const data = {};
  if (body.nama !== undefined) data.nama = String(body.nama).trim();
  if (body.kode !== undefined) data.kode = String(body.kode).trim().toUpperCase();
  if (body.jamPerMinggu !== undefined) data.jamPerMinggu = Number(body.jamPerMinggu);
  if (body.kategori !== undefined) data.kategori = body.kategori;
  if (body.tingkat !== undefined) data.tingkat = (body.tingkat || []).filter((t) => TINGKAT.includes(t));
  if (body.guru !== undefined) {
    data.guru = body.guru || null;
    if (data.guru && !(await User.exists({ _id: data.guru, role: "guru" }))) return { error: "Guru tidak valid" };
  }
  if (data.jamPerMinggu !== undefined && !(data.jamPerMinggu >= 1)) return { error: "Jam per minggu minimal 1" };
  if (data.tingkat && data.tingkat.length === 0) return { error: "Pilih minimal satu tingkat" };
  return { data };
}
