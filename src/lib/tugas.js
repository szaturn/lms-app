import { UserError } from "./errors";

/** Ambil field khusus tugas dari form: tipe, deadline, nilaiMaks */
export function bacaFieldTugas(fd) {
  const tipe = fd.get("tipe") === "projek" ? "projek" : "tugas";
  const dl = String(fd.get("deadline") || "").trim();
  let deadline = null;
  if (dl) {
    deadline = new Date(dl);
    if (isNaN(deadline.getTime())) throw new UserError("Format tenggat tidak valid");
  }
  const nilaiMaks = Number(fd.get("nilaiMaks") || 100);
  if (!(nilaiMaks >= 1)) throw new UserError("Nilai maksimal minimal 1");
  return { tipe, deadline, nilaiMaks };
}
