import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import FileDoc from "@/models/FileDoc";
import User from "@/models/User";
import Submission from "@/models/Submission";
import Tugas from "@/models/Tugas";

const text = (msg, status) => new NextResponse(msg, { status });

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return text("Belum login", 401);
  try {
    await connectDB();
    const doc = await FileDoc.findById(params.id);
    if (!doc) return text("File tidak ditemukan", 404);

    const { role, id } = session.user;
    let ok = false;
    if (["admin", "kurikulum", "kepsek"].includes(role)) ok = true;
    else if (String(doc.owner) === id) ok = true;
    else if (role === "siswa") {
      const u = await User.findById(id).select("kelas").lean();
      ok = !!u?.kelas && doc.kelas.some((k) => String(k) === String(u.kelas));
    } else if (role === "guru") {
      // guru boleh membuka berkas pengumpulan siswa pada tugas miliknya
      const sub = await Submission.findOne({ file: doc._id }).select("tugas").lean();
      ok = !!sub && !!(await Tugas.exists({ _id: sub.tugas, guru: id }));
    }
    if (!ok) return text("Tidak punya akses ke file ini", 403);

    return new NextResponse(doc.data, {
      headers: {
        "Content-Type": doc.mime,
        "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(doc.nama)}`,
        "Cache-Control": "private, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (e) {
    if (e.name === "CastError") return text("File tidak ditemukan", 404);
    console.error(e);
    return text("Terjadi kesalahan server", 500);
  }
}
