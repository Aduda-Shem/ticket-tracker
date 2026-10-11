import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { addTicket } from '@/redux/actions/ticket'
import { TICKET_PRIORITIES } from '@/constants/ticket.constant'

const emptyForm = { title: '', description: '', priority: 'medium' }

const inputClasses =
    'mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-xs focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none'

const NewTicket = ({ onCreated }) => {
    const dispatch = useDispatch()
    const { creating, createErrors } = useSelector(
        (state) => state.ticketReducer
    )
    const [form, setForm] = useState(emptyForm)

    const update = (field) => (event) =>
        setForm({ ...form, [field]: event.target.value })

    const submit = async (event) => {
        event.preventDefault()
        const created = await addTicket(form, { dispatch })
        if (created) {
            setForm(emptyForm)
            onCreated()
        }
    }

    return (
        <form
            onSubmit={submit}
            className="rounded-xl border border-slate-200 bg-white p-5"
        >
            <h2 className="text-base font-semibold text-slate-900">New ticket</h2>

            <label className="mt-4 block text-sm font-medium text-slate-700">
                Title
                <input
                    className={inputClasses}
                    value={form.title}
                    onChange={update('title')}
                    maxLength={255}
                    placeholder="e.g. Printer on 3rd floor jammed"
                    required
                />
            </label>
            {createErrors?.title && (
                <p className="mt-1 text-xs text-rose-600">{createErrors.title[0]}</p>
            )}

            <label className="mt-4 block text-sm font-medium text-slate-700">
                Description <span className="font-normal text-slate-400">(optional)</span>
                <textarea
                    className={inputClasses}
                    rows={3}
                    value={form.description}
                    onChange={update('description')}
                />
            </label>

            <label className="mt-4 block text-sm font-medium text-slate-700">
                Priority
                <select
                    className={inputClasses}
                    value={form.priority}
                    onChange={update('priority')}
                >
                    {TICKET_PRIORITIES.map((priority) => (
                        <option key={priority.value} value={priority.value}>
                            {priority.label}
                        </option>
                    ))}
                </select>
            </label>

            <button
                type="submit"
                disabled={creating}
                className="mt-5 w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
            >
                {creating ? 'Creating…' : 'Create ticket'}
            </button>
        </form>
    )
}

export default NewTicket
