export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-charcoal-900/60" onClick={onCancel} />
      <div role="alertdialog" aria-modal="true" className="relative bg-white rounded-xl2 shadow-pop p-6 w-full max-w-sm">
        <h3 className="font-display font-bold text-lg">{title}</h3>
        <p className="text-sm text-charcoal-500 mt-2">{message}</p>
        <div className="flex gap-3 mt-6">
          <button className="btn-ghost flex-1" onClick={onCancel}>Cancel</button>
          <button className="btn-primary flex-1 !bg-burgundy-700" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
