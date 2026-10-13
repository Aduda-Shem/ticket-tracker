import { useSelector } from "react-redux";

import { TICKET_STATUSES } from "@/constants/ticket.constant";

const TILES = [
  { value: "", label: "All", dot: "bg-slate-900" },
  ...TICKET_STATUSES,
];

// Doubles as the status filter: click a tile to filter the list.
const TicketStats = ({ active, onSelect }) => {
  const stats = useSelector((state) => state.ticketReducer.stats);

  return (
    <div
      className="grid grid-cols-2 gap-3 sm:grid-cols-4"
      role="tablist"
      aria-label="Filter by status"
    >
      {TILES.map((tile) => (
        <button
          key={tile.label}
          type="button"
          role="tab"
          aria-selected={active === tile.value}
          onClick={() => onSelect(tile.value)}
          className="rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-slate-300 aria-selected:border-slate-900 aria-selected:shadow-sm"
        >
          <span className="flex items-center gap-2 text-sm text-slate-500">
            <span className={`size-2 rounded-full ${tile.dot}`} />
            {tile.label}
          </span>
          <span className="mt-1 block text-2xl font-semibold text-slate-900 tabular-nums">
            {stats?.[tile.value || "total"] ?? "–"}
          </span>
        </button>
      ))}
    </div>
  );
};

export default TicketStats;
