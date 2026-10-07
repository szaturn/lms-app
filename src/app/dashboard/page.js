import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

const LABEL = { siswa: "Siswa", kurikulum: "Kurikulum", kepsek: "Kepala Sekolah" };

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role === "admin") redirect("/admin");
  if (session.user.role === "guru") redirect("/guru");

  // Placeholder: dashboard guru/siswa/kurikulum/kepsek akan dibuat di tahap berikutnya
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="card max-w-md space-y-3 p-8 text-center">
        <h1 className="text-xl font-bold">Halo, {session.user.name}</h1>
        <p className="text-sm text-slate-500">Dashboard {LABEL[session.user.role]} sedang dalam pengembangan.</p>
        <LogoutButton className="btn btn-dark" />
      </div>
    </main>
  );
}
