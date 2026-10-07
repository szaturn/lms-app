import TugasDetail from "@/components/TugasDetail";

export default function Page({ params }) {
  return <TugasDetail id={params.id} />;
}
