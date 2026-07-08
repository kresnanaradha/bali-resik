import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useScheduleCalendar } from "@/features/schedules/api/useSchedules";
import { wasteTagStyle, cancelledTagStyle } from "@/features/schedules/api/scheduleTagStyle";
import type { CalendarEvent } from "@/types/schedule";

const WEEKDAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const VIEWS = ["Bulan", "Minggu", "Hari"] as const;
type ViewMode = (typeof VIEWS)[number];

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function toISO(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function startOfWeek(date: Date) {
  const offset = (date.getDay() + 6) % 7; // 0=Senin
  return addDays(date, -offset);
}

function buildMonthGrid(year: number, month: number) {
  const firstOfMonth = new Date(year, month, 1);
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

function EventTag({ event }: { event: CalendarEvent }) {
  const style = event.status === "cancelled" ? cancelledTagStyle : (wasteTagStyle[event.waste_type] ?? wasteTagStyle.lainnya);
  return (
    <span
      title={`${event.tps_name} — ${event.start_time}`}
      className={`truncate rounded px-1.5 py-0.5 text-[10px] font-medium ${style.className}`}
    >
      {event.start_time.slice(0, 5)} {style.label}
    </span>
  );
}

export function ScheduleCalendar() {
  const [cursor, setCursor] = useState(() => new Date());
  const [view, setView] = useState<ViewMode>("Bulan");

  const monthISO = `${cursor.getFullYear()}-${pad(cursor.getMonth() + 1)}-01`;
  const weekStart = startOfWeek(cursor);
  const weekEnd = addDays(weekStart, 6);
  // The week or day in view might spill into an adjacent month — the
  // calendar endpoint returns a whole month at a time, so fetch that
  // adjacent month too when needed (React Query dedupes if it's the same
  // key as monthISO).
  const spillMonthISO =
    weekEnd.getMonth() !== cursor.getMonth() ? `${weekEnd.getFullYear()}-${pad(weekEnd.getMonth() + 1)}-01` : monthISO;

  const { data: monthEvents, isLoading: loadingMonth } = useScheduleCalendar(monthISO);
  const { data: spillEvents, isLoading: loadingSpill } = useScheduleCalendar(spillMonthISO);
  const isLoading = loadingMonth || loadingSpill;

  const allEvents = useMemo(() => {
    const merged = [...(monthEvents ?? []), ...(spillEvents ?? [])];
    const seen = new Set<string>();
    return merged.filter((e) => {
      const key = `${e.schedule_id}|${e.date}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [monthEvents, spillEvents]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of allEvents) {
      const list = map.get(e.date) ?? [];
      list.push(e);
      map.set(e.date, list);
    }
    return map;
  }, [allEvents]);

  function shiftPeriod(delta: number) {
    setCursor((c) => {
      if (view === "Bulan") return new Date(c.getFullYear(), c.getMonth() + delta, 1);
      if (view === "Minggu") return addDays(c, delta * 7);
      return addDays(c, delta);
    });
  }

  const periodLabel =
    view === "Bulan"
      ? cursor.toLocaleDateString("id-ID", { month: "long", year: "numeric" })
      : view === "Minggu"
        ? `${weekStart.toLocaleDateString("id-ID", { day: "numeric", month: "short" })} - ${weekEnd.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}`
        : cursor.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-gray-900">{periodLabel}</p>
          <button
            type="button"
            onClick={() => shiftPeriod(-1)}
            aria-label="Sebelumnya"
            className="flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:bg-gray-100"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => shiftPeriod(1)}
            aria-label="Berikutnya"
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

      {isLoading ? (
        <div className="flex h-64 items-center justify-center text-sm text-gray-400">Memuat kalender...</div>
      ) : view === "Bulan" ? (
        <MonthGrid cursor={cursor} eventsByDate={eventsByDate} />
      ) : view === "Minggu" ? (
        <WeekGrid weekStart={weekStart} eventsByDate={eventsByDate} />
      ) : (
        <DayList date={cursor} events={eventsByDate.get(toISO(cursor)) ?? []} />
      )}
    </div>
  );
}

function MonthGrid({ cursor, eventsByDate }: { cursor: Date; eventsByDate: Map<string, CalendarEvent[]> }) {
  const cells = useMemo(() => buildMonthGrid(cursor.getFullYear(), cursor.getMonth()), [cursor]);

  return (
    <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-gray-100 bg-gray-100 text-center text-xs font-medium text-gray-400">
      {WEEKDAYS.map((w) => (
        <div key={w} className="bg-gray-50 py-2">
          {w}
        </div>
      ))}
      {cells.map((cell, i) => {
        const cellDate = new Date(cursor.getFullYear(), cursor.getMonth(), cell.day);
        const dayEvents = cell.inMonth ? (eventsByDate.get(toISO(cellDate)) ?? []) : [];
        return (
          <div key={i} className="min-h-[76px] bg-white p-1.5 text-left">
            <span className={cell.inMonth ? "text-xs text-gray-700" : "text-xs text-gray-300"}>{cell.day}</span>
            <div className="mt-1 flex flex-col gap-1">
              {dayEvents.map((e, idx) => (
                <EventTag key={idx} event={e} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function WeekGrid({ weekStart, eventsByDate }: { weekStart: Date; eventsByDate: Map<string, CalendarEvent[]> }) {
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  return (
    <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-gray-100 bg-gray-100 text-center text-xs font-medium text-gray-400">
      {days.map((d, i) => (
        <div key={i} className="bg-gray-50 py-2">
          {WEEKDAYS[i]} <span className="text-gray-500">{d.getDate()}</span>
        </div>
      ))}
      {days.map((d, i) => {
        const dayEvents = eventsByDate.get(toISO(d)) ?? [];
        return (
          <div key={i} className="min-h-[220px] bg-white p-1.5 text-left">
            <div className="flex flex-col gap-1">
              {dayEvents.length === 0 ? (
                <span className="text-[10px] text-gray-300">-</span>
              ) : (
                dayEvents.map((e, idx) => <EventTag key={idx} event={e} />)
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DayList({ events }: { date: Date; events: CalendarEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-gray-200 text-sm text-gray-400">
        Tidak ada jadwal pada tanggal ini.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-100 rounded-lg border border-gray-100">
      {events.map((e, idx) => {
        const style = e.status === "cancelled" ? cancelledTagStyle : (wasteTagStyle[e.waste_type] ?? wasteTagStyle.lainnya);
        return (
          <li key={idx} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-900">{e.tps_name}</p>
              <p className="text-xs text-gray-500">{e.start_time.slice(0, 5)}</p>
            </div>
            <span className={`rounded px-2 py-1 text-xs font-medium ${style.className}`}>{style.label}</span>
          </li>
        );
      })}
    </ul>
  );
}
