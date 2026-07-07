import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { calendarEvents, wasteTagStyle } from "@/features/schedules/api/mockData";

const WEEKDAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const VIEWS = ["Bulan", "Minggu", "Hari"] as const;

function buildMonthGrid(year: number, month: number) {
  const firstOfMonth = new Date(year, month, 1);
  // getDay(): 0=Min..6=Sab -> convert to Sen-first index (0=Sen..6=Min)
  const startOffset = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: { day: number; inMonth: boolean }[] = [];
  for (let i = startOffset; i > 0; i--) {
    cells.push({ day: daysInPrevMonth - i + 1, inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, inMonth: true });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ day: cells.length - (startOffset + daysInMonth) + 1, inMonth: false });
  }
  return cells;
}

export function ScheduleCalendar() {
  const [cursor, setCursor] = useState(() => new Date(2026, 4, 1));
  const [view, setView] = useState<(typeof VIEWS)[number]>("Bulan");

  const cells = useMemo(() => buildMonthGrid(cursor.getFullYear(), cursor.getMonth()), [cursor]);
  const monthLabel = cursor.toLocaleDateString("id-ID", { month: "long", year: "numeric" });

  function shiftMonth(delta: number) {
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-gray-900">{monthLabel}</p>
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            aria-label="Bulan sebelumnya"
            className="flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:bg-gray-100"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            aria-label="Bulan berikutnya"
            className="flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:bg-gray-100"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex items-center rounded-lg border border-gray-200 p-0.5 text-xs">
          {VIEWS.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`rounded-md px-2.5 py-1 font-medium ${
                view === v ? "bg-brand-700 text-white" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-gray-100 bg-gray-100 text-center text-xs font-medium text-gray-400">
        {WEEKDAYS.map((w) => (
          <div key={w} className="bg-gray-50 py-2">
            {w}
          </div>
        ))}
        {cells.map((cell, i) => {
          const events = cell.inMonth ? calendarEvents.filter((e) => e.date === cell.day) : [];
          return (
            <div key={i} className="min-h-[76px] bg-white p-1.5 text-left">
              <span className={cell.inMonth ? "text-xs text-gray-700" : "text-xs text-gray-300"}>{cell.day}</span>
              <div className="mt-1 flex flex-col gap-1">
                {events.map((e, idx) => {
                  const style = wasteTagStyle[e.tag];
                  return (
                    <span
                      key={idx}
                      className={`truncate rounded px-1.5 py-0.5 text-[10px] font-medium ${style.className}`}
                    >
                      {e.time ? `${e.time} ${style.label}` : style.label}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
