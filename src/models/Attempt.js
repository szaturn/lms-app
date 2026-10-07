import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema.Types;

// Hasil pengerjaan asesmen oleh siswa (dipakai penuh pada tahap role siswa).
const AttemptSchema = new mongoose.Schema(
  {
    asesmen: { type: ObjectId, ref: "Asesmen", required: true },
    siswa: { type: ObjectId, ref: "User", required: true },
    mulaiAt: { type: Date, default: Date.now },
    selesaiAt: { type: Date, default: null },
    jawaban: [
      {
        soal: { type: ObjectId, required: true },
        pilihan: { type: Number }, // pilihan ganda
        teks: { type: String, default: "" }, // esai
        skor: { type: Number, default: 0 },
        _id: false,
      },
    ],
    nilai: { type: Number, default: null }, // 0-100
    dinilai: { type: Boolean, default: false }, // true jika esai sudah diperiksa guru
  },
  { timestamps: true }
);
AttemptSchema.index({ asesmen: 1, siswa: 1 }, { unique: true });

export default mongoose.models.Attempt || mongoose.model("Attempt", AttemptSchema);
