/** Small line icons for form controls. Decorative: the text beside them carries the meaning. */
type IconProps = { className?: string };

export function CheckIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true" className={className}>
      <path d="M4.5 10.5 8.5 14.5 15.5 6" />
    </svg>
  );
}

export function AlertIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true" className={className}>
      <circle cx="10" cy="10" r="7.25" />
      <path d="M10 6v5" />
      <path d="M10 13.25v1.5" />
    </svg>
  );
}

export function ChevronIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true" className={className}>
      <path d="M5.5 8 10 12.5 14.5 8" />
    </svg>
  );
}

export function SpinnerIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true" className={className}>
      <circle cx="10" cy="10" r="7.5" strokeOpacity={0.3} />
      <path d="M17.5 10A7.5 7.5 0 0 0 10 2.5" />
    </svg>
  );
}
