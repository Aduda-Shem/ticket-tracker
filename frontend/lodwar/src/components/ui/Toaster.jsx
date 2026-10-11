import { useToasts } from '@/utils/hooks/useCommonToast'

const toneClasses = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    warning: 'border-amber-200 bg-amber-50 text-amber-800',
    danger: 'border-rose-200 bg-rose-50 text-rose-800',
}

const Toaster = () => {
    const toasts = useToasts()

    return (
        <div
            className="fixed right-4 bottom-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2"
            aria-live="polite"
        >
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    role="status"
                    className={`rounded-lg border px-4 py-3 text-sm shadow-sm ${toneClasses[toast.type] || toneClasses.warning}`}
                >
                    {toast.text}
                </div>
            ))}
        </div>
    )
}

export default Toaster
