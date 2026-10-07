"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Tabs } from "./ui";
import KelasGrid from "./KelasGrid";
import SiswaTable from "./SiswaTable";
import KelasModal from "./KelasModal";
import SiswaModal from "./SiswaModal";

export default function KelasSiswaView({ initialTab }) {
  const [tab, setTab] = useState(initialTab);
  const [version, setVersion] = useState(0);
  const [kelasModal, setKelasModal] = useState(false);
  const [siswaModal, setSiswaModal] = useState(null); // {} = baru, objek siswa = edit

  const refresh = () => setVersion((v) => v + 1);
  const changeTab = (t) => {
    setTab(t);
    window.history.replaceState(null, "", `?tab=${t}`);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          tabs={[{ value: "kelas", label: "Kelas" }, { value: "siswa", label: "Siswa" }]}
          value={tab}
          onChange={changeTab}
        />
        <button className="btn btn-dark !px-6 !py-3" onClick={() => (tab === "kelas" ? setKelasModal(true) : setSiswaModal({}))}>
          <Plus size={16} /> {tab === "kelas" ? "Tambah Kelas" : "Tambah Siswa"}
        </button>
      </div>

      {tab === "kelas" ? <KelasGrid version={version} /> : <SiswaTable version={version} onEdit={setSiswaModal} onChanged={refresh} />}

      {kelasModal && (
        <KelasModal onClose={() => setKelasModal(false)} onSaved={() => { setKelasModal(false); refresh(); }} />
      )}
      {siswaModal && (
        <SiswaModal
          siswa={siswaModal._id ? siswaModal : null}
          onClose={() => setSiswaModal(null)}
          onSaved={() => { setSiswaModal(null); refresh(); }}
        />
      )}
    </div>
  );
}
