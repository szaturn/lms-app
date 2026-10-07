import KelasSiswaView from "@/components/KelasSiswaView";

export default function Page({ searchParams }) {
  return <KelasSiswaView initialTab={searchParams?.tab === "siswa" ? "siswa" : "kelas"} />;
}
