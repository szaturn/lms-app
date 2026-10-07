"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/client";
import { Field } from "./ui";

/** Ambil daftar (kelas, mapel) yang diajar guru yang sedang login. */
export function usePenugasan() {
  const [penugasan, setPenugasan] = useState(null);
  useEffect(() => {
    api("/api/guru/penugasan").then((d) => setPenugasan(d.penugasan)).catch(() => setPenugasan([]));
  }, []);
  return penugasan;
}

/** value: { mapel, kelas: [id] } */
export default function PenugasanPicker({ penugasan, value, onChange }) {
  if (!penugasan) return <p className="text-sm text-slate-500">Memuat...</p>;
  if (penugasan.length === 0)
    return <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">Anda belum ditugaskan ke kelas atau mata pelajaran. Hubungi admin.</p>;

  const mapelOpsi = [...new Set(penugasan.map((p) => p.mapel))];
  if (value.mapel && !mapelOpsi.includes(value.mapel)) mapelOpsi.push(value.mapel);
  const kelasOpsi = penugasan.filter((p) => p.mapel === value.mapel);

  const pilihMapel = (m) => onChange({ mapel: m, kelas: penugasan.filter((p) => p.mapel === m).map((p) => p.kelasId) });
  const toggle = (id) =>
    onChange({ ...value, kelas: value.kelas.includes(id) ? value.kelas.filter((k) => k !== id) : [...value.kelas, id] });

  return (
    <div className="space-y-4">
      <Field label="Mata Pelajaran">
        <select className="input" value={value.mapel} onChange={(e) => pilihMapel(e.target.value)} required>
          <option value="">Pilih mata pelajaran</option>
          {mapelOpsi.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </Field>
      <Field label="Kelas">
        {!value.mapel ? (
          <p className="text-xs text-slate-400">Pilih mata pelajaran terlebih dahulu.</p>
        ) : (
          <div className="flex flex-wrap gap-x-5 gap-y-2 pt-1">
            {kelasOpsi.map((k) => (
              <label key={k.kelasId} className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                <input type="checkbox" className="h-4 w-4 accent-brand" checked={value.kelas.includes(k.kelasId)} onChange={() => toggle(k.kelasId)} />
                {k.kelasNama}
              </label>
            ))}
          </div>
        )}
      </Field>
    </div>
  );
}
