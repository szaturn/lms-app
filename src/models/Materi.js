import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema.Types;

const MateriSchema = new mongoose.Schema(
  {
    guru: { type: ObjectId, ref: "User", required: true, index: true },
    mapel: { type: String, required: true, trim: true },
    kelas: [{ type: ObjectId, ref: "Kelas" }],
    judul: { type: String, required: true, trim: true },
    deskripsi: { type: String, trim: true, default: "" },
    file: { type: ObjectId, ref: "FileDoc", default: null },
    fileNama: { type: String, default: "" },
    links: [{ label: { type: String, trim: true, default: "" }, url: { type: String, required: true }, _id: false }],
  },
  { timestamps: true }
);

export default mongoose.models.Materi || mongoose.model("Materi", MateriSchema);
