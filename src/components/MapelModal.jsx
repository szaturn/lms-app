"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/client";
import { Modal, Field, ErrorBox, ModalActions } from "./ui";

const TINGKAT = ["X", "XI", "XII"];

export default function MapelModal({ mapel, onClose, onSaved }) {
  const editing = !!mapel;
  const [gurus, setGurus] = useState([]);
  const [f, setF] = useState({
    nama: mapel?.nama || "",
    kode: mapel?.kode || "",
    guru: mapel?.guru?._id || "",
    jamPerMinggu: mapel?.jamPerMinggu ?? 4,
    kategori: mapel?.kategori || "Wajib",
    tingkat: mapel?.tingkat?.length ? mapel.tingkat : TINGKAT,
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const toggle = (t) =>
    setF({ ...f, tingkat: f.tingkat.includes(t) ? f.tingkat.filter((x) => x !== t) : [...f.tingkat, t] });

  useEffect(() => {
    api("/api/admin/users?role=guru").then((d) => {
      setGurus(d.users);
      if (!editing) setF((p) => (p.guru ? p : { ...p, guru: d.users[0]?._id || "" }));
    });
  }, [editing]);

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api(editing ? `/api/admin/mapel/${mapel._id}` : "/api/admin/mapel", {
        method: editing ? "PUT" : "POST",
        body: { ...f, jamPerMinggu: Number(f.jamPerMinggu) },
      });
      onSaved();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <Modal title={editing ? "Edit Mata Pelajaran" : "Tambah Mata Pelajaran"} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <ErrorBox>{error}</ErrorBox>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nama Pelajaran">
            <input className="input" placeholder="cth. Matematika" value={f.nama} onChange={set("nama")} required />
          </Field>
          <Field label="Kode Mapel">
            <input className="input" placeholder="cth. MAT" value={f.kode} onChange={set("kode")} required />
          </Field>
        </div>
        <Field label="Guru Pengampu">
          <select className="input" value={f.guru} onChange={set("guru")}>
            <option value="">Belum ditentukan</option>
            {gurus.map((g) => <option key={g._id} value={g._id}>{g.nama}</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Jam per Minggu">
            <input className="input" type="number" min={1} value={f.jamPerMinggu} onChange={set("jamPerMinggu")} required />
          </Field>
          <Field label="Kategori">
            <select className="input" value={f.kategori} onChange={set("kategori")}>
              <option value="Wajib">Wajib</option>
              <option value="Peminatan">Peminatan</option>
              <option value="Mulok">Mulok</option>
            </select>
          </Field>
        </div>
        <Field label="Tingkat yang Diajar">
          <div className="flex flex-wrap gap-5 pt-1">
            {TINGKAT.map((t) => (
              <label key={t} className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                <input type="checkbox" className="h-4 w-4 accent-brand" checked={f.tingkat.includes(t)} onChange={() => toggle(t)} />
                Kelas {t}
              </label>
            ))}
          </div>
        </Field>
        <ModalActions onCancel={onClose} saving={saving} submitLabel={editing ? "Simpan" : "Tambah Pelajaran"} />
      </form>
    </Modal>
  );
}
