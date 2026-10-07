import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

const NAV = [
  { href: "/admin", label: "Beranda", desc: "Ringkasan & statistik", icon: "BarChart3" },
  { href: "/admin/kelas-siswa", label: "Kelas & Siswa", desc: "Manajemen kelas & siswa", icon: "Users" },
  { href: "/admin/guru-pelajaran", label: "Guru & Pelajaran", desc: "Manajemen guru & mapel", icon: "BookOpen" },
  { href: "/admin/pimpinan", label: "Kurikulum & Kepsek", desc: "Akun kurikulum & kepsek", icon: "UserCog" },
];

const TITLES = [
  { prefix: "/admin", title: "Dashboard Admin", exact: true },
  { prefix: "/admin/kelas-siswa", title: "Manajemen Kelas & Siswa" },
  { prefix: "/admin/kelas-siswa/", title: "Detail Kelas" },
  { prefix: "/admin/guru-pelajaran", title: "Guru & Pelajaran" },
  { prefix: "/admin/pimpinan", title: "Kurikulum & Kepala Sekolah" },
];

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "admin") redirect("/dashboard");

  return (
    <div className="min-h-screen lg:pl-[280px]">
      <Sidebar name={session.user.name} username={session.user.username} nav={NAV} home="/admin" roleLabel="Admin Panel" />
      <div className="px-5 pb-12 pt-6 lg:px-9">
        <Topbar name={session.user.name} titles={TITLES} />
        <main className="mt-6">{children}</main>
      </div>
    </div>
  );
}
