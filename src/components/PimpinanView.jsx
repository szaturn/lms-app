"use client";
import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { api } from "@/lib/client";
import { Modal, Field, ErrorBox, ModalActions, StatusBadge, RowActions } from "./ui";

const ROLE_LABEL = { kurikulum: "Kurikulum", kepsek: "Kepala Sekolah" };

export default function PimpinanView() {
  const [list, setList] = useState(null);
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    api("/api/admin/users?role=kurikulum,kepsek").then((d) => setList(d.users)).catch((e) => setError(e.message));
  }, []);
  useEffect(load, [load]);

  const openNew = () => { setError(""); setForm({ nama: "", username: "", password: "", role: "kurikulum", aktif: true }); };
  const openEdit = (u) => { setError(""); setForm({ _id: u._id, nama: u.nama, username: u.username, password: "", role: u.role, aktif: u.aktif }); };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const body = { ...form };
      if (!body.password) delete body.password;
      await api(form._id ? `/api/admin/users/${form._id}` : "/api/admin/users", { method: form._id ? "PUT" : "POST", body });
      setForm(null);
      load();
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  }

  async function remove(u) {
    if (!confirm(`Hapus akun ${u.nama}?`)) return;
    try {
      await api(`/api/admin/users/${u._id}`, { method: "DELETE" });
      load();
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">Akun untuk Kurikulum dan Kepala Sekolah (hak akses lihat &amp; unduh nilai).</p>
        <button className="btn btn-dark !px-6 !py-3" onClick={openNew}><Plus size={16} /> Tambah Akun</button>
      </div>

      <div className="card overflow-hidden">
        <p className="px-6 py-5 font-mono text-xs text-slate-500">{list ? `Total ${list.length} akun` : "Memuat..."}</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-plum">
              <tr>
                <th className="th w-14 pl-6">No</th>
                <th className="th">Nama</th>
                <th className="th">Username</th>
                <th className="th">Role</th>
                <th className="th">Status</th>
                <th className="th">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list && list.length === 0 ? (
                <tr><td className="td pl-6 text-slate-500" colSpan={6}>Belum ada akun.</td></tr>
              ) : (list || []).map((u, i) => (
                <tr key={u._id} className="hover:bg-slate-50/60">
                  <td className="td pl-6 font-mono text-xs text-slate-400">{i + 1}</td>
                  <td className="td font-semibold">{u.nama}</td>
                  <td className="td font-mono text-[13px]">{u.username}</td>
                  <td className="td"><span className="rounded-md bg-sand px-2 py-1 text-xs font-semibold">{ROLE_LABEL[u.role]}</span></td>
                  <td className="td"><StatusBadge aktif={u.aktif} /></td>
                  <td className="td"><RowActions onEdit={() => openEdit(u)} onDelete={() => remove(u)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {form && (
        <Modal title={form._id ? "Edit Akun" : "Tambah Akun Baru"} onClose={() => setForm(null)}>
          <form onSubmit={submit} className="space-y-4">
            <ErrorBox>{error}</ErrorBox>
            <Field label="Nama Lengkap">
              <input className="input" placeholder="Nama lengkap" value={form.nama} onChange={set("nama")} required />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Username">
                <input className="input" value={form.username} onChange={set("username")} required />
              </Field>
              <Field label="Role">
                <select className="input" value={form.role} onChange={set("role")} disabled={!!form._id}>
                  <option value="kurikulum">Kurikulum</option>
                  <option value="kepsek">Kepala Sekolah</option>
                </select>
              </Field>
            </div>
            <Field label={form._id ? "Password Baru (opsional)" : "Password"}>
              <input className="input" type="password" minLength={6} placeholder={form._id ? "Kosongkan jika tidak diubah" : "Minimal 6 karakter"} value={form.password} onChange={set("password")} required={!form._id} autoComplete="new-password" />
            </Field>
            {form._id && (
              <Field label="Status">
                <select className="input" value={form.aktif ? "Aktif" : "Nonaktif"} onChange={(e) => setForm({ ...form, aktif: e.target.value === "Aktif" })}>
                  <option>Aktif</option><option>Nonaktif</option>
                </select>
              </Field>
            )}
            <ModalActions onCancel={() => setForm(null)} saving={saving} submitLabel={form._id ? "Simpan" : "Tambah Akun"} />
          </form>
        </Modal>
      )}
    </div>
  );
}
