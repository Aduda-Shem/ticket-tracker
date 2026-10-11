import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { getTickets, getTicketStats } from '@/redux/actions/ticket'
import { TICKET_PAGE_LIMIT } from '@/constants/ticket.constant'
import TicketStats from './components/TicketStats'
import NewTicket from './components/NewTicket'
import TicketList from './components/TicketList'

const Tickets = () => {
    const dispatch = useDispatch()
    const { list, loading } = useSelector((state) => state.ticketReducer)
    const [status, setStatus] = useState('')
    const [page, setPage] = useState(1)

    const refresh = useCallback(() => {
        getTickets({ dispatch }, { page, limit: TICKET_PAGE_LIMIT, ...(status && { status }) })
        getTicketStats({ dispatch })
    }, [dispatch, page, status])

    useEffect(refresh, [refresh])

    // If a status change empties the current page, step back one.
    useEffect(() => {
        if (!loading && list.length === 0 && page > 1) setPage(page - 1)
    }, [loading, list.length, page])

    return (
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Support tickets</h1>
            <p className="mt-1 mb-6 text-sm text-slate-500">Ticket Tracker</p>

            <TicketStats
                active={status}
                onSelect={(value) => {
                    setStatus(value)
                    setPage(1)
                }}
            />

            <div className="mt-6 grid items-start gap-6 lg:grid-cols-[20rem_1fr]">
                <NewTicket onCreated={refresh} />
                <TicketList onChanged={refresh} onPage={setPage} />
            </div>
        </div>
    )
}

export default Tickets
