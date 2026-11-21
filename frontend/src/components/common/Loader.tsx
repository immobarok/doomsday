interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  fullCard?: boolean;
}

export function Spinner({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dimensions =
    size === 'lg'
      ? 'h-8 w-8 border-3'
      : size === 'md'
        ? 'h-6 w-6 border-2'
        : 'h-4 w-4 border-2';

  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block animate-spin rounded-full border-current border-t-transparent ${dimensions}`}
    />
  );
}

export function Loader({ size = 'lg', fullCard = true }: LoaderProps) {
  if (!fullCard) {
    return (
      <div className="flex items-center justify-center py-6 text-indigo-600">
        <Spinner size={size} />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-14 text-indigo-600 shadow-xs">
      <Spinner size={size} />
    </div>
  );
}
