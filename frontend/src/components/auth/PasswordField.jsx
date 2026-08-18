import { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function PasswordField({ id, label, error, ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-text">
        {label}
      </label>
      <div className="relative">
        <Lock
          className="pointer-events-none absolute top-1/2 -translate-y-1/2 start-3.5 size-4 text-muted"
          strokeWidth={1.9}
        />
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          className={cn(
            'w-full rounded-xl border bg-surface py-2.5 ps-10 pe-11 text-sm text-text placeholder:text-muted',
            'transition-colors duration-150 focus:border-primary focus:outline-none',
            error ? 'border-danger' : 'border-border'
          )}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute top-1/2 -translate-y-1/2 end-3 text-muted transition-colors hover:text-text"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff className="size-4" strokeWidth={1.9} /> : <Eye className="size-4" strokeWidth={1.9} />}
        </button>
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
