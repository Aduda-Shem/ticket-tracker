const buttonClasses =
    'rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50'

const Pagination = ({ page, totalPages, total, onChange }) => {
    if (totalPages <= 1) return null

    return (
        <nav
            className="mt-4 flex items-center justify-between text-sm text-slate-500"
            aria-label="Pagination"
        >
            <span>
                Page {page} of {totalPages} · {total} tickets
            </span>
            <div className="flex gap-2">
                <button
                    type="button"
                    className={buttonClasses}
                    disabled={page <= 1}
                    onClick={() => onChange(page - 1)}
                >
                    Previous
                </button>
                <button
                    type="button"
                    className={buttonClasses}
                    disabled={page >= totalPages}
                    onClick={() => onChange(page + 1)}
                >
                    Next
                </button>
            </div>
        </nav>
    )
}

export default Pagination
