// The "right now" strip — live state for a bed (sensor temp/humidity, reservoir
// level, irrigation on/off) with a pulsing live indicator. This is the moat:
// the garden as a living spatial dashboard, not a static plan.
import type { BedLive } from '@/domain';

export function LiveStrip({ label, live }: { label: string; live: BedLive }) {
  const items: [string, string, boolean?][] = [];
  if (live.reading?.tempF !== undefined) items.push(['Temp', `${live.reading.tempF}°F`]);
  if (live.reading?.humidityPct !== undefined) items.push(['Humidity', `${live.reading.humidityPct}%`]);
  if (typeof live.reservoirLevel === 'number') items.push(['Reservoir', `${Math.round(live.reservoirLevel * 100)}%`]);
  if (live.irrigationOn !== undefined) items.push(['Water', live.irrigationOn ? 'On' : 'Off', live.irrigationOn]);
  if (items.length === 0) return null;

  return (
    <div className="rounded-card bg-card border border-line p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="relative flex h-2.5 w-2.5">
          <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-live opacity-60" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-live" />
        </span>
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-clay">{label} · right now</span>
      </div>
      <div className="flex flex-wrap gap-x-8 gap-y-3">
        {items.map(([k, v, on]) => (
          <div key={k}>
            <div className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-muted">{k}</div>
            <div className={`text-[18px] font-semibold mt-0.5 tabular-nums ${on === false ? 'text-faint' : on === true ? 'text-live' : 'text-ink'}`}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
