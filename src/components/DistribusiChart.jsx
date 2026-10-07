// Diagram batang sederhana (server component, tanpa library)
export default function DistribusiChart({ data }) {
  const maxVal = Math.max(0, ...data.flatMap((d) => [d.ipa, d.ips]));
  const max = Math.max(20, Math.ceil(maxVal / 20) * 20);
  const ticks = [0, 1, 2, 3, 4].map((i) => (max / 4) * i);

  return (
    <div>
      <div className="flex">
        <div className="flex h-56 flex-col-reverse justify-between pr-3 font-mono text-[11px] text-slate-400">
          {ticks.map((t) => <span key={t}>{Math.round(t)}</span>)}
        </div>
        <div className="relative h-56 flex-1">
          {ticks.map((t) => (
            <div key={t} className="absolute inset-x-0 border-t border-slate-100" style={{ bottom: `${(t / max) * 100}%` }} />
          ))}
          <div className="absolute inset-0 flex items-end justify-around px-4">
            {data.map((d) => (
              <div key={d.label} className="flex h-full items-end gap-1.5">
                <div className="w-10 rounded-t-md bg-plum sm:w-14" style={{ height: `${(d.ipa / max) * 100}%` }} title={`${d.label} IPA: ${d.ipa}`} />
                <div className="w-10 rounded-t-md bg-ember sm:w-14" style={{ height: `${(d.ips / max) * 100}%` }} title={`${d.label} IPS: ${d.ips}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="ml-8 mt-2 flex justify-around font-mono text-xs text-slate-500">
        {data.map((d) => <span key={d.label}>{d.label}</span>)}
      </div>
      <div className="mt-5 flex gap-5 text-xs font-medium">
        <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-plum" /> IPA</span>
        <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-ember" /> IPS</span>
      </div>
    </div>
  );
}
