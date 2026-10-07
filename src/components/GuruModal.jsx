"use client";
import { useState } from "react";
import { api } from "@/lib/client";
import { Modal, Field, ErrorBox, ModalActions } from "./ui";

export default function GuruModal({ guru, onClose, onSaved }) {
  const editing = !!guru;
  const [f, setF] = useState({
    nama: guru?.nama || "",
    username: guru?.username || "",
    jenisKelamin: guru?.jenisKelamin || "L",
    email: guru?.email || "",
    mapelUtama: guru?.mapelUtama || "",
    aktif: guru ? guru.aktif : true,
    jabatan: guru?.jabatan || "",
    pendidikan: guru?.pendidikan || "",
    password: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const body = { ...f };
      if (!body.password) delete body.password;
      await api(editing ? `/api/admin/users/${guru._id}` : "/api/admin/users", {
        method: editing ? "PUT" : "POST",
        body: { ...body, role: "guru" },
      });
      onSaved();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <Modal title={editing ? "Edit Data Guru" : "Tambah Guru Baru"} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <ErrorBox>{error}</ErrorBox>
        <Field label="Nama Lengkap + Gelar">
          <input className="input" placeholder="cth. Dewi Rahayu, M.Pd" value={f.nama} onChange={set("nama")} required />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="NIP">
            <input className="input" placeholder="18 digit NIP" inputMode="numeric" value={f.username} onChange={set("username")} required />
          </Field>
          <Field label="Jenis Kelamin">
            <select className="input" value={f.jenisKelamin} onChange={set("jenisKelamin")}>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </Field>
        </div>
        <Field label="Email Sekolah">
          <input className="input" type="email" placeholder="nama@sman3bdg.sch.id" value={f.email} onChange={set("email")} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Pelajaran Utama">
            <input className="input" placeholder="cth. Matematika" value={f.mapelUtama} onChange={set("mapelUtama")} />
          </Field>
          <Field label="Status">
            <select className="input" value={f.aktif ? "Aktif" : "Nonaktif"} onChange={(e) => setF({ ...f, aktif: e.target.value === "Aktif" })}>
              <option>Aktif</option><option>Nonaktif</option>
            </select>
          </Field>
        </div>
        <Field label="Jabatan">
          <input className="input" placeholder="cth. Wali Kelas XI IPA 1 / Guru Mata Pelajaran" value={f.jabatan} onChange={set("jabatan")} />
        </Field>
        <Field label="Pendidikan Terakhir">
          <input className="input" placeholder="cth. S2 Pendidikan Matematika" value={f.pendidikan} onChange={set("pendidikan")} />
        </Field>
        {editing ? (
          <Field label="Password Baru (opsional)">
            <input className="input" type="password" placeholder="Kosongkan jika tidak diubah" minLength={6} value={f.password} onChange={set("password")} autoComplete="new-password" />
          </Field>
        ) : (
          <p className="font-mono text-xs text-slate-400">Password awal guru sama dengan NIP.</p>
        )}
        <ModalActions onCancel={onClose} saving={saving} submitLabel={editing ? "Simpan" : "Tambah Guru"} />
      </form>
    </Modal>
  );
}
