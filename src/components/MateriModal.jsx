"use client";
import { useState } from "react";
import { apiForm } from "@/lib/client";
import { Modal, Field, ErrorBox, ModalActions } from "./ui";
import PenugasanPicker, { usePenugasan } from "./PenugasanPicker";
import LampiranFields from "./LampiranFields";

export default function MateriModal({ materi, onClose, onSaved }) {
  const editing = !!materi;
  const penugasan = usePenugasan();
  const [target, setTarget] = useState({ mapel: materi?.mapel || "", kelas: materi?.kelas?.map((k) => k._id) || [] });
  const [judul, setJudul] = useState(materi?.judul || "");
  const [deskripsi, setDeskripsi] = useState(materi?.deskripsi || "");
  const [file, setFile] = useState(null);
  const [hapusFile, setHapusFile] = useState(false);
  const [links, setLinks] = useState(materi?.links?.map((l) => ({ label: l.label, url: l.url })) || []);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const fd = new FormData();
    fd.set("judul", judul);
    fd.set("deskripsi", deskripsi);
    fd.set("mapel", target.mapel);
    fd.set("kelas", JSON.stringify(target.kelas));
    fd.set("links", JSON.stringify(links.filter((l) => l.url.trim())));
    if (file) fd.set("file", file);
    if (hapusFile) fd.set("hapusFile", "1");
    try {
      await apiForm(editing ? `/api/guru/materi/${materi._id}` : "/api/guru/materi", editing ? "PUT" : "POST", fd);
      onSaved();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <Modal title={editing ? "Edit Materi" : "Tambah Materi"} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <ErrorBox>{error}</ErrorBox>
        <PenugasanPicker penugasan={penugasan} value={target} onChange={setTarget} />
        <Field label="Judul Materi">
          <input className="input" placeholder="cth. Bab 3 – Trigonometri" value={judul} onChange={(e) => setJudul(e.target.value)} required />
        </Field>
        <Field label="Deskripsi">
          <textarea className="input" rows={3} placeholder="Keterangan singkat (opsional)" value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} />
        </Field>
        <LampiranFields
          file={file} setFile={setFile} links={links} setLinks={setLinks}
          existing={materi?.file ? { id: materi.file, nama: materi.fileNama } : null}
          hapusFile={hapusFile} setHapusFile={setHapusFile}
        />
        <ModalActions onCancel={onClose} saving={saving} submitLabel={editing ? "Simpan" : "Tambah Materi"} />
      </form>
    </Modal>
  );
}
