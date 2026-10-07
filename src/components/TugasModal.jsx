"use client";
import { useState } from "react";
import { apiForm } from "@/lib/client";
import { toLocalInput } from "@/lib/format";
import { Modal, Field, ErrorBox, ModalActions } from "./ui";
import PenugasanPicker, { usePenugasan } from "./PenugasanPicker";
import LampiranFields from "./LampiranFields";

export default function TugasModal({ tugas, onClose, onSaved }) {
  const editing = !!tugas;
  const penugasan = usePenugasan();
  const [target, setTarget] = useState({ mapel: tugas?.mapel || "", kelas: tugas?.kelas?.map((k) => k._id) || [] });
  const [f, setF] = useState({
    tipe: tugas?.tipe || "tugas",
    judul: tugas?.judul || "",
    deskripsi: tugas?.deskripsi || "",
    deadline: toLocalInput(tugas?.deadline),
    nilaiMaks: tugas?.nilaiMaks ?? 100,
  });
  const [file, setFile] = useState(null);
  const [hapusFile, setHapusFile] = useState(false);
  const [links, setLinks] = useState(tugas?.links?.map((l) => ({ label: l.label, url: l.url })) || []);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const fd = new FormData();
    fd.set("judul", f.judul);
    fd.set("deskripsi", f.deskripsi);
    fd.set("tipe", f.tipe);
    fd.set("nilaiMaks", String(f.nilaiMaks));
    fd.set("deadline", f.deadline ? new Date(f.deadline).toISOString() : "");
    fd.set("mapel", target.mapel);
    fd.set("kelas", JSON.stringify(target.kelas));
    fd.set("links", JSON.stringify(links.filter((l) => l.url.trim())));
    if (file) fd.set("file", file);
    if (hapusFile) fd.set("hapusFile", "1");
    try {
      await apiForm(editing ? `/api/guru/tugas/${tugas._id}` : "/api/guru/tugas", editing ? "PUT" : "POST", fd);
      onSaved();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <Modal title={editing ? "Edit Tugas" : "Buat Tugas Baru"} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <ErrorBox>{error}</ErrorBox>
        <PenugasanPicker penugasan={penugasan} value={target} onChange={setTarget} />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Jenis">
            <select className="input" value={f.tipe} onChange={set("tipe")}>
              <option value="tugas">Tugas</option>
              <option value="projek">Projek</option>
            </select>
          </Field>
          <Field label="Nilai Maksimal">
            <input className="input" type="number" min={1} value={f.nilaiMaks} onChange={set("nilaiMaks")} required />
          </Field>
        </div>
        <Field label="Judul">
          <input className="input" placeholder="cth. Latihan Soal Bab 3" value={f.judul} onChange={set("judul")} required />
        </Field>
        <Field label="Instruksi">
          <textarea className="input" rows={3} placeholder="Petunjuk pengerjaan" value={f.deskripsi} onChange={set("deskripsi")} />
        </Field>
        <Field label="Tenggat Pengumpulan">
          <input className="input" type="datetime-local" value={f.deadline} onChange={set("deadline")} />
        </Field>
        <LampiranFields
          file={file} setFile={setFile} links={links} setLinks={setLinks}
          existing={tugas?.file ? { id: tugas.file, nama: tugas.fileNama } : null}
          hapusFile={hapusFile} setHapusFile={setHapusFile}
        />
        <ModalActions onCancel={onClose} saving={saving} submitLabel={editing ? "Simpan" : "Buat Tugas"} />
      </form>
    </Modal>
  );
}
