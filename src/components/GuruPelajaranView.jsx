"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Tabs } from "./ui";
import GuruTable from "./GuruTable";
import GuruModal from "./GuruModal";
import MapelGrid from "./MapelGrid";
import MapelModal from "./MapelModal";

export default function GuruPelajaranView({ initialTab }) {
  const [tab, setTab] = useState(initialTab);
  const [version, setVersion] = useState(0);
  const [guruModal, setGuruModal] = useState(null); // {} = baru, objek = edit
  const [mapelModal, setMapelModal] = useState(null);

  const refresh = () => setVersion((v) => v + 1);
  const changeTab = (t) => {
    setTab(t);
    window.history.replaceState(null, "", `?tab=${t}`);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          tabs={[{ value: "guru", label: "Guru" }, { value: "mapel", label: "Mata Pelajaran" }]}
          value={tab}
          onChange={changeTab}
        />
        <button className="btn btn-dark !px-6 !py-3" onClick={() => (tab === "guru" ? setGuruModal({}) : setMapelModal({}))}>
          <Plus size={16} /> {tab === "guru" ? "Tambah Guru" : "Tambah Mapel"}
        </button>
      </div>

      {tab === "guru" ? (
        <GuruTable version={version} onEdit={setGuruModal} onChanged={refresh} />
      ) : (
        <MapelGrid version={version} onEdit={setMapelModal} onChanged={refresh} />
      )}

      {guruModal && (
        <GuruModal guru={guruModal._id ? guruModal : null} onClose={() => setGuruModal(null)} onSaved={() => { setGuruModal(null); refresh(); }} />
      )}
      {mapelModal && (
        <MapelModal mapel={mapelModal._id ? mapelModal : null} onClose={() => setMapelModal(null)} onSaved={() => { setMapelModal(null); refresh(); }} />
      )}
    </div>
  );
}
