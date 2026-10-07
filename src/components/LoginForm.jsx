"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";
import { SCHOOL } from "@/lib/config";

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", { username, password, redirect: false });
    if (!res || res.error) {
      setError(
        res?.error === "CredentialsSignin"
          ? "Username atau password salah"
          : res?.error === "DB_ERROR"
          ? "Tidak bisa terhubung ke database. Cek MONGODB_URI dan pastikan MongoDB berjalan."
          : "Login gagal (" + (res?.error || "error tidak diketahui") + "). Cek terminal npm run dev dan file .env.local."
      );
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-sidebar p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-white">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand"><Shield size={28} /></div>
          <h1 className="mt-4 text-2xl font-bold">{SCHOOL.app}</h1>
          <p className="font-mono text-xs text-white/50">{SCHOOL.nama} · {SCHOOL.tahunAjaran}</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 rounded-3xl bg-white p-8 shadow-2xl">
          <div>
            <h2 className="text-xl font-bold">Masuk</h2>
            <p className="text-sm text-slate-500">Gunakan akun yang diberikan sekolah</p>
          </div>

          {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <div>
            <label className="label" htmlFor="username">NISN / NIP / Username</label>
            <input id="username" className="input" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input id="password" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
          </div>

          <button className="btn btn-dark w-full" disabled={loading}>{loading ? "Memproses..." : "Masuk"}</button>
        </form>
      </div>
    </main>
  );
}
