"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/client";
import { Modal, Field, ErrorBox, ModalActions } from "./ui";

export default function SiswaModal({ siswa, onClose, onSaved }) {
  const editing = !!siswa;
  const [kelas, setKelas] = useState([]);
  const [f, setF] = useState({
    nama: siswa?.nama || "",
    username: siswa?.username || "",
    jenisKelamin: siswa?.jenisKelamin || "L",
    kelas: siswa?.kelas?._id || "",
    aktif: siswa ? siswa.aktif : true,
    tempatTanggalLahir: siswa?.tempatTanggalLahir || "",
    namaWali: siswa?.namaWali || "",
    password: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  useEffect(() => {
    api("/api/admin/kelas").then((d) => {
      setKelas(d.kelas);
      if (!editing) setF((p) => (p.kelas ? p : { ...p, kelas: d.kelas[0]?._id || "" }));
    });
  }, [editing]);

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const body = { ...f };
      if (!body.password) delete body.password;
      await api(editing ? `/api/admin/users/${siswa._id}` : "/api/admin/users", {
        method: editing ? "PUT" : "POST",
        body: { ...body, role: "siswa" },
      });
      onSaved();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <Modal title={editing ? "Edit Data Siswa" : "Tambah Siswa Baru"} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <ErrorBox>{error}</ErrorBox>
        <Field label="Nama Lengkap">
          <input className="input" placeholder="Nama lengkap siswa" value={f.nama} onChange={set("nama")} required />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="NISN">
            <input className="input" placeholder="10 digit NISN" inputMode="numeric" value={f.username} onChange={set("username")} required />
          </Field>
          <Field label="Jenis Kelamin">
            <select className="input" value={f.jenisKelamin} onChange={set("jenisKelamin")}>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Kelas">
            <select className="input" value={f.kelas} onChange={set("kelas")}>
              <option value="">Belum ada kelas</option>
              {kelas.map((k) => {
                const penuh = k.jumlahSiswa >= k.kapasitas && k._id !== siswa?.kelas?._id;
                return <option key={k._id} value={k._id} disabled={penuh}>{k.nama}{penuh ? " (penuh)" : ""}</option>;
              })}
            </select>
          </Field>
          <Field label="Status">
            <select className="input" value={f.aktif ? "Aktif" : "Nonaktif"} onChange={(e) => setF({ ...f, aktif: e.target.value === "Aktif" })}>
              <option>Aktif</option><option>Nonaktif</option>
            </select>
          </Field>
        </div>
        <Field label="Tempat, Tanggal Lahir">
          <input className="input" placeholder="cth. Bandung, 12 Maret 2008" value={f.tempatTanggalLahir} onChange={set("tempatTanggalLahir")} />
        </Field>
        <Field label="Nama Wali / Orang Tua">
          <input className="input" placeholder="Nama lengkap wali siswa" value={f.namaWali} onChange={set("namaWali")} />
        </Field>
        {editing ? (
          <Field label="Password Baru (opsional)">
            <input className="input" type="password" placeholder="Kosongkan jika tidak diubah" minLength={6} value={f.password} onChange={set("password")} autoComplete="new-password" />
          </Field>
        ) : (
          <p className="font-mono text-xs text-slate-400">Password awal siswa sama dengan NISN.</p>
        )}
        <ModalActions onCancel={onClose} saving={saving} submitLabel={editing ? "Simpan" : "Tambah Siswa"} />
      </form>
    </Modal>
  );
}
