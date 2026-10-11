import { useSelector } from 'react-redux'

import TicketRow from './TicketRow'

const TicketList = ({ onChanged }) => {
    const { list, loading, error } = useSelector((state) => state.ticketReducer)

    if (error) {
        return (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
                {error}
            </div>
        )
    }

    if (!loading && list.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
                No tickets here yet. Create one to get started.
            </div>
        )
    }

    return (
        <ul
            className={`divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white transition-opacity ${loading ? 'opacity-60' : ''}`}
            aria-busy={loading}
        >
            {list.map((ticket) => (
                <TicketRow key={ticket.id} ticket={ticket} onChanged={onChanged} />
            ))}
        </ul>
    )
}

export default TicketList
