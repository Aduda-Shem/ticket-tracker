import { useState } from 'react'

import { addTicket } from '@/redux/actions/ticket'
import { TICKET_PRIORITIES } from '@/constants/ticket.constant'

const emptyForm = { title: '', description: '', priority: 'medium' }

const NewTicket = ({ onCreated }) => {
    const [form, setForm] = useState(emptyForm)
    const [saving, setSaving] = useState(false)

    const field = (name) => ({
        name,
        value: form[name],
        onChange: (event) => setForm({ ...form, [name]: event.target.value }),
        className:
            'mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none',
    })

    const submit = async (event) => {
        event.preventDefault()
        setSaving(true)
        if (await addTicket(form)) {
            setForm(emptyForm)
            onCreated()
        }
        setSaving(false)
    }

    return (
        <form onSubmit={submit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 lg:sticky lg:top-6">
            <h2 className="font-semibold text-slate-900">New ticket</h2>
            <label className="block text-sm font-medium text-slate-700">
                Title
                <input {...field('title')} maxLength={255} placeholder="e.g. Printer on 3rd floor jammed" required />
            </label>
            <label className="block text-sm font-medium text-slate-700">
                Description <span className="font-normal text-slate-400">(optional)</span>
                <textarea {...field('description')} rows={3} />
            </label>
            <label className="block text-sm font-medium text-slate-700">
                Priority
                <select {...field('priority')}>
                    {TICKET_PRIORITIES.map(({ value, label }) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>
            </label>
            <button
                type="submit"
                disabled={saving}
                className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
            >
                {saving ? 'Creating…' : 'Create ticket'}
            </button>
        </form>
    )
}

export default NewTicket
