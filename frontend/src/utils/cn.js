/**
 * Joins class name fragments, dropping any falsy values.
 * Deliberately tiny — this project doesn't need a full clsx/tailwind-merge stack.
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
