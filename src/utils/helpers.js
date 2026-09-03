export const formatDate = (date) => {
  if (!date) return "-";
  const d = date.toDate ? date.toDate() : new Date(date);
  return d.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export const formatDuration = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

export const calcPercentage = (score, total) =>
  total === 0 ? 0 : Math.round((score / total) * 100);

export const isTestActive = (test) => {
  const now = new Date();
  const start = test.startTime?.toDate ? test.startTime.toDate() : new Date(test.startTime);
  const end = test.endTime?.toDate ? test.endTime.toDate() : new Date(test.endTime);
  return now >= start && now <= end;
};

export const isTestUpcoming = (test) => {
  const now = new Date();
  const start = test.startTime?.toDate ? test.startTime.toDate() : new Date(test.startTime);
  return now < start;
};

export const getTestStatusBadge = (test) => {
  if (isTestActive(test)) return { label: "Active", color: "bg-emerald-100 text-emerald-700" };
  if (isTestUpcoming(test)) return { label: "Upcoming", color: "bg-amber-100 text-amber-700" };
  return { label: "Ended", color: "bg-slate-100 text-slate-600" };
};
