import { cn } from '../../utils/cn';

const VARIANTS = {
  primary:
    'bg-primary text-[#052e17] hover:bg-primary-hover shadow-[0_0_0_1px_rgba(34,197,94,0.15),0_8px_24px_-8px_rgba(34,197,94,0.45)]',
  outline:
    'bg-transparent text-text border border-border hover:border-muted hover:bg-white/5',
  ghost: 'bg-transparent text-muted hover:text-text hover:bg-white/5',
};

const SIZES = {
  sm: 'text-sm px-3.5 py-2',
  md: 'text-sm px-5 py-2.5',
  lg: 'text-base px-6 py-3.5',
};

export default function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'end',
  className,
  children,
  ...props
}) {
  return (
    <Component
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold',
        'transition-all duration-200 ease-out active:scale-[0.98]',
        'disabled:opacity-50 disabled:pointer-events-none',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {Icon && iconPosition === 'start' && <Icon className="size-4" strokeWidth={2.25} />}
      {children}
      {Icon && iconPosition === 'end' && <Icon className="size-4" strokeWidth={2.25} />}
    </Component>
  );
}
