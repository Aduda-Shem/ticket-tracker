import { useSelector } from 'react-redux'

import { TICKET_STATUSES } from '@/constants/ticket.constant'

const TILES = [{ value: '', label: 'All tickets', key: 'total' }].concat(
    TICKET_STATUSES.map((status) => ({ ...status, key: status.value }))
)

// Doubles as the status filter: click a tile to filter the list.
const TicketStats = ({ active, onSelect }) => {
    const stats = useSelector((state) => state.ticketReducer.stats)

    return (
        <div
            className="grid grid-cols-2 gap-3 sm:grid-cols-4"
            role="tablist"
            aria-label="Filter by status"
        >
            {TILES.map((tile) => {
                const selected = active === tile.value
                return (
                    <button
                        key={tile.key}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        onClick={() => onSelect(tile.value)}
                        className={`rounded-xl border p-4 text-left transition ${
                            selected
                                ? 'border-slate-900 bg-white shadow-sm ring-1 ring-slate-900'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                    >
                        <div className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                            {tile.label}
                        </div>
                        <div className="mt-1 text-2xl font-semibold text-slate-900 tabular-nums">
                            {stats ? stats[tile.key] : '–'}
                        </div>
                    </button>
                )
            })}
        </div>
    )
}

export default TicketStats
