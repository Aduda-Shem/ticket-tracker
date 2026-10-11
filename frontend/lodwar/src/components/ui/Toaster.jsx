import { useToasts } from '@/utils/hooks/useCommonToast'

const toneClasses = {
    success: 'bg-slate-900 text-white',
    warning: 'bg-amber-50 text-amber-900 ring-1 ring-amber-200',
    danger: 'bg-rose-50 text-rose-900 ring-1 ring-rose-200',
}

const Toaster = () => (
    <div className="fixed inset-x-4 bottom-4 z-50 flex flex-col items-end gap-2" aria-live="polite">
        {useToasts().map((toast) => (
            <div key={toast.id} className={`max-w-sm rounded-lg px-4 py-2.5 text-sm shadow-lg ${toneClasses[toast.type]}`}>
                {toast.text}
            </div>
        ))}
    </div>
)

export default Toaster
