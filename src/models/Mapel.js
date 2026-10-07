import mongoose from "mongoose";

const MapelSchema = new mongoose.Schema(
  {
    nama: { type: String, required: true, trim: true },
    kode: { type: String, required: true, unique: true, uppercase: true, trim: true },
    guru: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // guru pengampu
    jamPerMinggu: { type: Number, min: 1, default: 2 },
    kategori: { type: String, enum: ["Wajib", "Peminatan", "Mulok"], default: "Wajib" },
    tingkat: [{ type: String, enum: ["X", "XI", "XII"] }],
  },
  { timestamps: true }
);

export default mongoose.models.Mapel || mongoose.model("Mapel", MapelSchema);
