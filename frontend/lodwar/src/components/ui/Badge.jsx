const toneClasses = {
    low: 'bg-slate-100 text-slate-600 ring-slate-200',
    medium: 'bg-amber-50 text-amber-700 ring-amber-200',
    high: 'bg-rose-50 text-rose-700 ring-rose-200',
    open: 'bg-sky-50 text-sky-700 ring-sky-200',
    in_progress: 'bg-violet-50 text-violet-700 ring-violet-200',
    closed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
}

const Badge = ({ tone, children }) => {
    return (
        <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${toneClasses[tone] || toneClasses.low}`}
        >
            {children}
        </span>
    )
}

export default Badge
