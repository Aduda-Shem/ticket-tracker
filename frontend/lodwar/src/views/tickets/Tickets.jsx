import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { getTickets, getTicketStats } from '@/redux/actions/ticket'
import { TICKET_PAGE_LIMIT } from '@/constants/ticket.constant'
import TicketStats from './components/TicketStats'
import NewTicket from './components/NewTicket'
import TicketList from './components/TicketList'
import Pagination from './components/Pagination'

const Tickets = () => {
    const dispatch = useDispatch()
    const { list, pagination, loading } = useSelector(
        (state) => state.ticketReducer
    )
    const [statusFilter, setStatusFilter] = useState('')
    const [page, setPage] = useState(1)

    const refresh = useCallback(() => {
        const params = { page, limit: TICKET_PAGE_LIMIT }
        if (statusFilter) params.status = statusFilter
        getTickets({ dispatch }, params)
        getTicketStats({ dispatch })
    }, [dispatch, page, statusFilter])

    useEffect(() => {
        refresh()
    }, [refresh])

    // If a status change empties the current page, step back one.
    useEffect(() => {
        if (!loading && list.length === 0 && page > 1) setPage(page - 1)
    }, [loading, list.length, page])

    const changeFilter = (value) => {
        setStatusFilter(value)
        setPage(1)
    }

    return (
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
            <header className="mb-6">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                    Support tickets
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                    Lodwar Services · Mini Ticket Tracker
                </p>
            </header>

            <TicketStats active={statusFilter} onSelect={changeFilter} />

            <div className="mt-6 grid gap-6 lg:grid-cols-[20rem_1fr]">
                <aside className="lg:sticky lg:top-6 lg:self-start">
                    <NewTicket onCreated={refresh} />
                </aside>

                <section>
                    <TicketList onChanged={refresh} />
                    <Pagination
                        page={pagination.page}
                        totalPages={pagination.total_pages}
                        total={pagination.total}
                        onChange={setPage}
                    />
                </section>
            </div>
        </div>
    )
}

export default Tickets
