import mongoose from "mongoose";

// File (PDF) disimpan langsung di MongoDB agar bisa dipakai di hosting apa pun.
const FileSchema = new mongoose.Schema(
  {
    nama: { type: String, required: true },
    mime: { type: String, default: "application/pdf" },
    size: { type: Number, required: true },
    data: { type: Buffer, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    kelas: [{ type: mongoose.Schema.Types.ObjectId, ref: "Kelas" }], // kelas yang boleh mengakses (siswa)
  },
  { timestamps: true }
);

export default mongoose.models.FileDoc || mongoose.model("FileDoc", FileSchema);
