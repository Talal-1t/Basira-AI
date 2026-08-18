import { cn } from '../../utils/cn';

export default function FormField({
  id,
  label,
  icon: Icon,
  error,
  type = 'text',
  ...props
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-text">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            className="pointer-events-none absolute top-1/2 -translate-y-1/2 start-3.5 size-4 text-muted"
            strokeWidth={1.9}
          />
        )}
        <input
          id={id}
          type={type}
          className={cn(
            'w-full rounded-xl border bg-surface py-2.5 text-sm text-text placeholder:text-muted',
            'transition-colors duration-150 focus:border-primary focus:outline-none',
            Icon ? 'ps-10 pe-3.5' : 'px-3.5',
            error ? 'border-danger' : 'border-border'
          )}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        />
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
