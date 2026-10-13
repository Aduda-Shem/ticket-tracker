import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useDispatch, useSelector } from "react-redux";

import { updateTicket } from "@/redux/actions/ticket";
import {
  TICKET_PRIORITIES,
  TICKET_STATUSES,
} from "@/constants/ticket.constant";

dayjs.extend(relativeTime);

// A select styled as a coloured pill, so the value and the control are one element.
const PillSelect = ({ options, value, onChange, label }) => (
  <select
    aria-label={label}
    value={value}
    onChange={(event) => onChange(event.target.value)}
    className={`cursor-pointer appearance-none rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset focus:outline-none focus-visible:ring-2 ${options.find((o) => o.value === value)?.tone}`}
  >
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

const pagerButton =
  "rounded-md px-2.5 text-lg leading-7 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent";

const TicketList = ({ onChanged, onPage }) => {
  const dispatch = useDispatch();
  const { list, loading, error, pagination } = useSelector(
    (state) => state.ticketReducer,
  );
  const { page, total_pages: totalPages, total } = pagination;

  const change = (id, field) => async (value) => {
    if (await updateTicket(id, { [field]: value }, { dispatch })) onChanged();
  };

  if (error || (!loading && list.length === 0)) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
        {error || "No tickets here yet. Create one to get started."}
      </div>
    );
  }

  return (
    <section
      className={`rounded-xl border border-slate-200 bg-white transition-opacity ${loading ? "opacity-60" : ""}`}
    >
      <ul className="divide-y divide-slate-100">
        {list.map((ticket) => (
          <li
            key={ticket.id}
            className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center"
          >
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-medium text-slate-900">
                {ticket.title}
              </h3>
              {ticket.description && (
                <p className="mt-0.5 line-clamp-1 text-sm text-slate-500">
                  {ticket.description}
                </p>
              )}
              <p
                className="mt-1 text-xs text-slate-400"
                title={dayjs(ticket.created_at).format("D MMM YYYY, HH:mm")}
              >
                Opened {dayjs(ticket.created_at).fromNow()}
              </p>
            </div>
            <div className="flex gap-2">
              <PillSelect
                label={`Priority of ${ticket.title}`}
                options={TICKET_PRIORITIES}
                value={ticket.priority}
                onChange={change(ticket.id, "priority")}
              />
              <PillSelect
                label={`Status of ${ticket.title}`}
                options={TICKET_STATUSES}
                value={ticket.status}
                onChange={change(ticket.id, "status")}
              />
            </div>
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <nav
          className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm text-slate-500"
          aria-label="Pagination"
        >
          <span>{total} tickets</span>
          <span className="flex items-center gap-1">
            <button
              type="button"
              className={pagerButton}
              disabled={page <= 1}
              onClick={() => onPage(page - 1)}
              aria-label="Previous page"
            >
              ‹
            </button>
            <span className="tabular-nums">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              className={pagerButton}
              disabled={page >= totalPages}
              onClick={() => onPage(page + 1)}
              aria-label="Next page"
            >
              ›
            </button>
          </span>
        </nav>
      )}
    </section>
  );
};

export default TicketList;
