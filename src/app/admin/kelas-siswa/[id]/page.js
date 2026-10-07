import KelasDetail from "@/components/KelasDetail";

export default function Page({ params }) {
  return <KelasDetail id={params.id} />;
}
