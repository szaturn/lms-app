import FileDoc from "@/models/FileDoc";
import { UserError } from "./errors";

export const MAX_PDF = 10 * 1024 * 1024; // 10 MB

export const isUpload = (v) => v && typeof v === "object" && typeof v.arrayBuffer === "function" && v.size > 0;

/** Simpan PDF ke MongoDB. Memvalidasi ukuran dan isi file (bukan hanya ekstensi). */
export async function simpanPdf(file, { owner, kelas = [] }) {
  if (file.size > MAX_PDF) throw new UserError("Ukuran PDF maksimal 10 MB");
  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.subarray(0, 4).toString() !== "%PDF") throw new UserError("File harus berupa PDF");
  return FileDoc.create({ nama: file.name || "dokumen.pdf", mime: "application/pdf", size: buf.length, data: buf, owner, kelas });
}

export async function hapusFile(id) {
  if (id) await FileDoc.deleteOne({ _id: id });
}

/** Hanya tautan http(s) yang diterima (mencegah javascript: dll). */
export function bersihkanLinks(links) {
  if (!Array.isArray(links)) return [];
  const out = [];
  for (const l of links) {
    const url = String(l?.url || "").trim();
    if (!url) continue;
    if (!/^https?:\/\/\S+$/i.test(url)) throw new UserError("Tautan harus diawali http:// atau https://");
    out.push({ label: String(l?.label || "").trim().slice(0, 100), url });
  }
  return out;
}

/** Baca multipart form untuk materi/tugas. */
export async function bacaForm(req) {
  const fd = await req.formData();
  const parse = (k, def) => {
    try { return JSON.parse(fd.get(k) || def); } catch { throw new UserError("Data tidak valid"); }
  };
  return {
    fd,
    judul: String(fd.get("judul") || "").trim(),
    deskripsi: String(fd.get("deskripsi") || "").trim(),
    mapel: String(fd.get("mapel") || "").trim(),
    kelas: parse("kelas", "[]"),
    links: bersihkanLinks(parse("links", "[]")),
    file: fd.get("file"),
    hapusFile: fd.get("hapusFile") === "1",
  };
}
