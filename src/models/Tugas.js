import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema.Types;

const TugasSchema = new mongoose.Schema(
  {
    guru: { type: ObjectId, ref: "User", required: true, index: true },
    mapel: { type: String, required: true, trim: true },
    kelas: [{ type: ObjectId, ref: "Kelas" }],
    tipe: { type: String, enum: ["tugas", "projek"], default: "tugas" },
    judul: { type: String, required: true, trim: true },
    deskripsi: { type: String, trim: true, default: "" },
    deadline: { type: Date, default: null },
    nilaiMaks: { type: Number, default: 100, min: 1 },
    file: { type: ObjectId, ref: "FileDoc", default: null }, // soal/lampiran PDF
    fileNama: { type: String, default: "" },
    links: [{ label: { type: String, trim: true, default: "" }, url: { type: String, required: true }, _id: false }],
  },
  { timestamps: true }
);

export default mongoose.models.Tugas || mongoose.model("Tugas", TugasSchema);
