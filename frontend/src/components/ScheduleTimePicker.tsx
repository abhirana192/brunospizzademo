export function ScheduleTimePicker({
  isAsap,
  setIsAsap,
  scheduledTime,
  setScheduledTime,
}: {
  isAsap: boolean;
  setIsAsap: (v: boolean) => void;
  scheduledTime: string;
  setScheduledTime: (v: string) => void;
}) {
  const now = new Date();
  const min = new Date(now.getTime() + 20 * 60 * 1000);
  const max = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const toLocalInput = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  return (
    <div>
      <h3 className="font-semibold text-charcoal-800 mb-3">When do you need it?</h3>
      <div className="flex gap-2.5">
        <button
          type="button"
          onClick={() => setIsAsap(true)}
          className={`flex-1 rounded-xl border-2 py-3 text-sm font-semibold transition ${
            isAsap ? "border-burgundy-600 bg-burgundy-50 text-burgundy-700" : "border-charcoal-100 hover:border-charcoal-300"
          }`}
          aria-pressed={isAsap}
        >
          As Soon As Possible
        </button>
        <button
          type="button"
          onClick={() => setIsAsap(false)}
          className={`flex-1 rounded-xl border-2 py-3 text-sm font-semibold transition ${
            !isAsap ? "border-burgundy-600 bg-burgundy-50 text-burgundy-700" : "border-charcoal-100 hover:border-charcoal-300"
          }`}
          aria-pressed={!isAsap}
        >
          Schedule for Later
        </button>
      </div>
      {!isAsap && (
        <div className="mt-3">
          <label className="label" htmlFor="scheduledTime">
            Choose date &amp; time
          </label>
          <input
            id="scheduledTime"
            type="datetime-local"
            className="input"
            min={toLocalInput(min)}
            max={toLocalInput(max)}
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
            required={!isAsap}
          />
          <p className="text-xs text-charcoal-400 mt-1.5">Must be at least 20 minutes from now, during our opening hours.</p>
        </div>
      )}
    </div>
  );
}
