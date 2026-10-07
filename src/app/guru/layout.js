import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

const NAV = [
  { href: "/guru", label: "Beranda", desc: "Ringkasan mengajar", icon: "BarChart3" },
  { href: "/guru/kelas", label: "Kelas & Siswa", desc: "Kelas yang diajar", icon: "Users" },
  { href: "/guru/materi", label: "Materi", desc: "Upload PDF & tautan", icon: "FileText" },
  { href: "/guru/tugas", label: "Tugas & Projek", desc: "Buat tugas & nilai", icon: "ClipboardList" },
  { href: "/guru/asesmen", label: "Asesmen", desc: "Kuis & ujian online", icon: "ListChecks" },
  { href: "/guru/nilai", label: "Rekap Nilai", desc: "Per mapel, kelas, jurusan", icon: "GraduationCap" },
];

const TITLES = [
  { prefix: "/guru", title: "Dashboard Guru", exact: true },
  { prefix: "/guru/kelas", title: "Kelas & Siswa" },
  { prefix: "/guru/kelas/", title: "Detail Kelas" },
  { prefix: "/guru/materi", title: "Materi Pembelajaran" },
  { prefix: "/guru/tugas", title: "Tugas & Projek" },
  { prefix: "/guru/tugas/", title: "Detail Tugas" },
  { prefix: "/guru/asesmen", title: "Asesmen Online" },
  { prefix: "/guru/asesmen/", title: "Editor Asesmen" },
  { prefix: "/guru/asesmen/", endsWith: "/hasil", title: "Hasil & Penilaian" },
  { prefix: "/guru/nilai", title: "Rekap Nilai" },
];

export default async function GuruLayout({ children }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "guru") redirect("/dashboard");

  return (
    <div className="min-h-screen lg:pl-[280px]">
      <Sidebar name={session.user.name} username={session.user.username} nav={NAV} home="/guru" roleLabel="Panel Guru" />
      <div className="px-5 pb-12 pt-6 lg:px-9">
        <Topbar name={session.user.name} titles={TITLES} />
        <main className="mt-6">{children}</main>
      </div>
    </div>
  );
}
