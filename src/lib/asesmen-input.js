import { UserError } from "./errors";

/** Validasi & rapikan daftar soal dari klien. */
export function bersihkanSoal(soal) {
  if (!Array.isArray(soal)) throw new UserError("Data soal tidak valid");
  return soal.map((s, i) => {
    const no = i + 1;
    const teks = String(s.teks || "").trim();
    if (!teks) throw new UserError(`Soal ${no}: teks soal wajib diisi`);
    const bobot = Number(s.bobot ?? 1);
    if (!(bobot > 0)) throw new UserError(`Soal ${no}: bobot harus lebih dari 0`);
    if (s.tipe === "esai") return { tipe: "esai", teks, opsi: [], bobot };
    if (s.tipe !== "pilihan_ganda") throw new UserError(`Soal ${no}: tipe soal tidak valid`);
    const opsi = (Array.isArray(s.opsi) ? s.opsi : []).map((o) => String(o || "").trim());
    if (opsi.length < 2 || opsi.length > 5 || opsi.some((o) => !o))
      throw new UserError(`Soal ${no}: isi 2 sampai 5 pilihan jawaban`);
    const kunci = Number(s.kunci);
    if (!Number.isInteger(kunci) || kunci < 0 || kunci >= opsi.length)
      throw new UserError(`Soal ${no}: pilih kunci jawaban`);
    return { tipe: "pilihan_ganda", teks, opsi, kunci, bobot };
  });
}

/** Ambil field umum asesmen dari body JSON. */
export function bacaAsesmen(body) {
  const judul = String(body.judul || "").trim();
  if (!judul) throw new UserError("Judul wajib diisi");
  if (!["kuis", "ujian"].includes(body.jenis)) throw new UserError("Jenis harus kuis atau ujian");
  const durasiMenit = Number(body.durasiMenit || 30);
  if (!(durasiMenit >= 1)) throw new UserError("Durasi minimal 1 menit");
  const tgl = (v) => {
    if (!v) return null;
    const d = new Date(v);
    if (isNaN(d.getTime())) throw new UserError("Format tanggal tidak valid");
    return d;
  };
  const mulai = tgl(body.mulai);
  const selesai = tgl(body.selesai);
  if (mulai && selesai && selesai <= mulai) throw new UserError("Waktu selesai harus setelah waktu mulai");
  return {
    judul, jenis: body.jenis, deskripsi: String(body.deskripsi || "").trim(), durasiMenit, mulai, selesai,
    acakSoal: !!body.acakSoal, status: body.status === "terbit" ? "terbit" : "draft",
  };
}
