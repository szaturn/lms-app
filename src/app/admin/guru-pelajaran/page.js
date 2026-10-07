import GuruPelajaranView from "@/components/GuruPelajaranView";

export default function Page({ searchParams }) {
  return <GuruPelajaranView initialTab={searchParams?.tab === "mapel" ? "mapel" : "guru"} />;
}
