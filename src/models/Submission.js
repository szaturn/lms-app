import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema.Types;

// Pengumpulan tugas oleh siswa + penilaian oleh guru.
// Guru juga bisa mengisi nilai tanpa pengumpulan (submittedAt kosong), mis. tugas luring.
const SubmissionSchema = new mongoose.Schema(
  {
    tugas: { type: ObjectId, ref: "Tugas", required: true },
    siswa: { type: ObjectId, ref: "User", required: true },
    file: { type: ObjectId, ref: "FileDoc", default: null },
    fileNama: { type: String, default: "" },
    link: { type: String, default: "" },
    catatan: { type: String, default: "" },
    submittedAt: { type: Date, default: null },
    nilai: { type: Number, min: 0, default: null },
    feedback: { type: String, default: "" },
    dinilaiAt: { type: Date, default: null },
  },
  { timestamps: true }
);
SubmissionSchema.index({ tugas: 1, siswa: 1 }, { unique: true });

export default mongoose.models.Submission || mongoose.model("Submission", SubmissionSchema);
