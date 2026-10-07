import mongoose from "mongoose";

export const ROLES = ["admin", "guru", "siswa", "kurikulum", "kepsek"];

const UserSchema = new mongoose.Schema(
  {
    nama: { type: String, required: true, trim: true },
    // NISN untuk siswa, NIP untuk guru, atau username biasa (kurikulum/kepsek/admin)
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, required: true },
    aktif: { type: Boolean, default: true },
    jenisKelamin: { type: String, enum: ["L", "P"] },

    // siswa
    kelas: { type: mongoose.Schema.Types.ObjectId, ref: "Kelas", default: null },
    tempatTanggalLahir: { type: String, trim: true },
    namaWali: { type: String, trim: true },

    // guru
    email: { type: String, trim: true },
    mapelUtama: { type: String, trim: true },
    jabatan: { type: String, trim: true },
    pendidikan: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
