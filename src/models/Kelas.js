import mongoose from "mongoose";

const KelasSchema = new mongoose.Schema(
  {
    nama: { type: String, required: true, unique: true, trim: true }, // contoh: "X IPA 1"
    tingkat: { type: String, enum: ["X", "XI", "XII"], required: true },
    jurusan: { type: String, required: true, trim: true }, // IPA / IPS
    waliKelas: { type: String, trim: true, default: "" },
    ruangan: { type: String, trim: true, default: "" },
    kapasitas: { type: Number, min: 1, default: 36 },
    // guru yang mengajar di kelas ini + mata pelajarannya
    pengajar: [
      {
        guru: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        mapel: { type: String, required: true, trim: true },
        _id: false,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Kelas || mongoose.model("Kelas", KelasSchema);
