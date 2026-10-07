"use client";
import { useState } from "react";
import { api } from "@/lib/client";
import { Modal, Field, ErrorBox, ModalActions } from "./ui";

const JURUSAN = ["IPA", "IPS"];

export default function KelasModal({ kelas, onClose, onSaved }) {
  const editing = !!kelas;
  const [f, setF] = useState({
    tingkat: kelas?.tingkat || "X",
    jurusan: kelas?.jurusan || "IPA",
    nama: kelas?.nama || "",
    waliKelas: kelas?.waliKelas || "",
    ruangan: kelas?.ruangan || "",
    kapasitas: kelas?.kapasitas ?? 36,
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const jurusanOpsi = JURUSAN.includes(f.jurusan) ? JURUSAN : [...JURUSAN, f.jurusan];

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api(editing ? `/api/admin/kelas/${kelas._id}` : "/api/admin/kelas", {
        method: editing ? "PUT" : "POST",
        body: { ...f, kapasitas: Number(f.kapasitas) },
      });
      onSaved();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <Modal title={editing ? "Edit Kelas" : "Tambah Kelas Baru"} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <ErrorBox>{error}</ErrorBox>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Tingkat">
            <select className="input" value={f.tingkat} onChange={set("tingkat")}>
              <option>X</option><option>XI</option><option>XII</option>
            </select>
          </Field>
          <Field label="Jurusan">
            <select className="input" value={f.jurusan} onChange={set("jurusan")}>
              {jurusanOpsi.map((j) => <option key={j}>{j}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Nama Kelas">
          <input className="input" placeholder="cth. X IPA 1" value={f.nama} onChange={set("nama")} required />
        </Field>
        <Field label="Wali Kelas">
          <input className="input" placeholder="Nama lengkap + gelar" value={f.waliKelas} onChange={set("waliKelas")} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Ruangan">
            <input className="input" placeholder="cth. A-01" value={f.ruangan} onChange={set("ruangan")} />
          </Field>
          <Field label="Kapasitas Siswa">
            <input className="input" type="number" min={1} value={f.kapasitas} onChange={set("kapasitas")} required />
          </Field>
        </div>
        <ModalActions onCancel={onClose} saving={saving} submitLabel={editing ? "Simpan" : "Tambah Kelas"} />
      </form>
    </Modal>
  );
}
