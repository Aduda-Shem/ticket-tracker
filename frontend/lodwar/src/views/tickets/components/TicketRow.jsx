import dayjs from 'dayjs'
import { useDispatch, useSelector } from 'react-redux'

import Badge from '@/components/ui/Badge'
import { updateTicket } from '@/redux/actions/ticket'
import {
    TICKET_PRIORITIES,
    TICKET_STATUSES,
    labelFor,
} from '@/constants/ticket.constant'

const selectClasses =
    'rounded-md border border-slate-300 bg-white px-2 py-1 text-xs focus:border-slate-900 focus:outline-none disabled:opacity-60'

const TicketRow = ({ ticket, onChanged }) => {
    const dispatch = useDispatch()
    const updating = useSelector((state) =>
        state.ticketReducer.updatingIds.includes(ticket.id)
    )

    const change = (field) => async (event) => {
        const updated = await updateTicket(
            ticket.id,
            { [field]: event.target.value },
            { dispatch }
        )
        if (updated) onChanged()
    }

    return (
        <li className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-medium text-slate-900">
                        {ticket.title}
                    </h3>
                    <Badge tone={ticket.status}>
                        {labelFor(TICKET_STATUSES, ticket.status)}
                    </Badge>
                    <Badge tone={ticket.priority}>
                        {labelFor(TICKET_PRIORITIES, ticket.priority)} priority
                    </Badge>
                </div>
                {ticket.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                        {ticket.description}
                    </p>
                )}
                <p className="mt-1 text-xs text-slate-400">
                    Created {dayjs(ticket.created_at).format('D MMM YYYY, HH:mm')}
                </p>
            </div>

            <div className="flex shrink-0 gap-2">
                <label className="text-xs text-slate-500">
                    <span className="sr-only">Status</span>
                    <select
                        aria-label={`Status for ${ticket.title}`}
                        className={selectClasses}
                        value={ticket.status}
                        disabled={updating}
                        onChange={change('status')}
                    >
                        {TICKET_STATUSES.map((status) => (
                            <option key={status.value} value={status.value}>
                                {status.label}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="text-xs text-slate-500">
                    <span className="sr-only">Priority</span>
                    <select
                        aria-label={`Priority for ${ticket.title}`}
                        className={selectClasses}
                        value={ticket.priority}
                        disabled={updating}
                        onChange={change('priority')}
                    >
                        {TICKET_PRIORITIES.map((priority) => (
                            <option key={priority.value} value={priority.value}>
                                {priority.label}
                            </option>
                        ))}
                    </select>
                </label>
            </div>
        </li>
    )
}

export default TicketRow
