import Link from "next/link";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { getPenugasan } from "@/lib/penugasan";
import User from "@/models/User";
import { JurusanChip } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function GuruKelas() {
  const session = await getServerSession(authOptions);
  await connectDB();
  const pen = await getPenugasan(session.user.id);

  const kelasMap = new Map();
  for (const p of pen) {
    if (!kelasMap.has(p.kelasId)) kelasMap.set(p.kelasId, { ...p, mapel: [] });
    kelasMap.get(p.kelasId).mapel.push(p.mapel);
  }
  const counts = await User.aggregate([
    { $match: { role: "siswa", aktif: true, kelas: { $in: [...kelasMap.keys()].map((k) => new mongoose.Types.ObjectId(k)) } } },
    { $group: { _id: "$kelas", n: { $sum: 1 } } },
  ]);
  const jumlah = Object.fromEntries(counts.map((c) => [String(c._id), c.n]));

  if (kelasMap.size === 0)
    return <div className="card p-8 text-center text-sm text-slate-500">Anda belum ditugaskan ke kelas mana pun. Hubungi admin.</div>;

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {[...kelasMap.values()].map((k) => (
        <Link key={k.kelasId} href={`/guru/kelas/${k.kelasId}`} className="card block p-6 transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center gap-2">
            <JurusanChip jurusan={k.jurusan} />
            <span className="font-mono text-xs text-slate-400">Tk. {k.tingkat}</span>
          </div>
          <h3 className="mt-4 text-xl font-bold">{k.kelasNama}</h3>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {k.mapel.map((m) => <span key={m} className="rounded-md bg-sand px-2 py-1 text-xs font-semibold">{m}</span>)}
          </div>
          <p className="mt-4 font-mono text-xs text-slate-400">{jumlah[k.kelasId] || 0} siswa aktif</p>
        </Link>
      ))}
    </div>
  );
}
