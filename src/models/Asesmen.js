import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema.Types;

const SoalSchema = new mongoose.Schema({
  tipe: { type: String, enum: ["pilihan_ganda", "esai"], required: true },
  teks: { type: String, required: true, trim: true },
  opsi: [{ type: String, trim: true }], // khusus pilihan ganda
  kunci: { type: Number }, // indeks opsi yang benar (pilihan ganda)
  bobot: { type: Number, default: 1, min: 0 },
});

const AsesmenSchema = new mongoose.Schema(
  {
    guru: { type: ObjectId, ref: "User", required: true, index: true },
    mapel: { type: String, required: true, trim: true },
    kelas: [{ type: ObjectId, ref: "Kelas" }],
    jenis: { type: String, enum: ["kuis", "ujian"], required: true },
    judul: { type: String, required: true, trim: true },
    deskripsi: { type: String, trim: true, default: "" },
    durasiMenit: { type: Number, default: 30, min: 1 },
    mulai: { type: Date, default: null },
    selesai: { type: Date, default: null },
    acakSoal: { type: Boolean, default: false },
    status: { type: String, enum: ["draft", "terbit"], default: "draft" },
    soal: [SoalSchema],
  },
  { timestamps: true }
);

export default mongoose.models.Asesmen || mongoose.model("Asesmen", AsesmenSchema);
