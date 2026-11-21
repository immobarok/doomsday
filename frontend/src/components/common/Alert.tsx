interface AlertProps {
  type: 'error' | 'success';
  message: string;
  onDismiss?: () => void;
}

export function Alert({ type, message, onDismiss }: AlertProps) {
  const styles =
    type === 'error'
      ? 'border-red-200 bg-red-50 text-red-700'
      : 'border-emerald-200 bg-emerald-50 text-emerald-800';

  const buttonStyles =
    type === 'error'
      ? 'text-red-600 hover:text-red-800'
      : 'text-emerald-700 hover:text-emerald-900';

  return (
    <div
      className={`flex items-start justify-between gap-4 rounded-xl border px-4 py-3 text-sm shadow-xs ${styles}`}
    >
      <div>
        {type === 'error' && <strong className="font-semibold">Error: </strong>}
        {message}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className={`shrink-0 text-xs font-semibold ${buttonStyles}`}
        >
          Dismiss
        </button>
      )}
    </div>
  );
}
