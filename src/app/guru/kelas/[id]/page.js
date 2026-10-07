import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { ArrowLeft } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { getPenugasan } from "@/lib/penugasan";
import Kelas from "@/models/Kelas";
import User from "@/models/User";
import { Avatar, JurusanChip, StatusBadge } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function GuruKelasDetail({ params }) {
  const session = await getServerSession(authOptions);
  await connectDB();

  const pen = (await getPenugasan(session.user.id)).filter((p) => p.kelasId === params.id);
  if (pen.length === 0) notFound(); // guru hanya boleh melihat kelas yang diajar

  const [kelas, siswa] = await Promise.all([
    Kelas.findById(params.id).lean(),
    User.find({ role: "siswa", kelas: params.id }).select("nama username jenisKelamin aktif namaWali").sort({ nama: 1 }).lean(),
  ]);

  return (
    <div className="space-y-5">
      <Link href="/guru/kelas" className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:underline">
        <ArrowLeft size={16} /> Kembali ke daftar kelas
      </Link>

      <section className="card p-7">
        <div className="flex items-center gap-2">
          <JurusanChip jurusan={kelas.jurusan} />
          <span className="font-mono text-xs text-slate-400">Tk. {kelas.tingkat}</span>
        </div>
        <h2 className="mt-3 text-2xl font-bold">{kelas.nama}</h2>
        <div className="mt-2 space-y-1 font-mono text-xs text-slate-400">
          <p>Wali Kelas · {kelas.waliKelas || "-"}</p>
          <p>Ruangan · {kelas.ruangan || "-"}</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {pen.map((p) => <span key={p.mapel} className="rounded-md bg-sand px-2 py-1 text-xs font-semibold">{p.mapel}</span>)}
        </div>
      </section>

      <section className="card overflow-hidden">
        <p className="px-6 py-5 font-mono text-xs text-slate-500">{siswa.length} siswa</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-plum">
              <tr>
                <th className="th w-14 pl-6">No</th>
                <th className="th">Nama Siswa</th>
                <th className="th">NISN</th>
                <th className="th">JK</th>
                <th className="th">Nama Wali</th>
                <th className="th">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {siswa.length === 0 ? (
                <tr><td className="td pl-6 text-slate-500" colSpan={6}>Belum ada siswa di kelas ini.</td></tr>
              ) : siswa.map((s, i) => (
                <tr key={s._id}>
                  <td className="td pl-6 font-mono text-xs text-slate-400">{i + 1}</td>
                  <td className="td"><div className="flex items-center gap-3"><Avatar nama={s.nama} jk={s.jenisKelamin} /><span className="font-semibold">{s.nama}</span></div></td>
                  <td className="td font-mono text-[13px]">{s.username}</td>
                  <td className="td font-bold text-brand">{s.jenisKelamin || "-"}</td>
                  <td className="td">{s.namaWali || "-"}</td>
                  <td className="td"><StatusBadge aktif={s.aktif} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
