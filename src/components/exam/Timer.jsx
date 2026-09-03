import { useEffect, useState } from "react";

export function Timer({ durationMinutes, startedAt, onTimeUp }) {
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    const start = startedAt?.toDate ? startedAt.toDate() : startedAt ? new Date(startedAt) : new Date();
    const totalSeconds = durationMinutes * 60;

    const tick = () => {
      const elapsed = Math.floor((Date.now() - start.getTime()) / 1000);
      const left = Math.max(0, totalSeconds - elapsed);
      setRemaining(left);
      if (left === 0) {
        onTimeUp?.();
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [durationMinutes, startedAt, onTimeUp]);

  if (remaining === null) return <div className="h-10 w-24 bg-slate-100 rounded-xl animate-pulse" />;

  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  const isLow = remaining < 300; // 5 min
  const isCritical = remaining < 60;

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-lg border ${isCritical ? "bg-rose-50 border-rose-200 text-rose-700 animate-pulse" : isLow ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-slate-900 text-white border-slate-900"}`}>
      <span>⏱</span>
      <span>{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}</span>
    </div>
  );
}
