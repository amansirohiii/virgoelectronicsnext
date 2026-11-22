/**
 * Line icons for the header and footer: 24 px grid, 1.5 px stroke, hidden from
 * assistive technology (the link or button next to them carries the words).
 */
type IconProps = { className?: string };

function Svg({ className = "size-5", children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}

export const PhoneIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M21 16.4v2.8a1.9 1.9 0 0 1-2.1 1.9 18.7 18.7 0 0 1-8.2-2.9 18.4 18.4 0 0 1-5.7-5.7A18.7 18.7 0 0 1 2.1 4.3 1.9 1.9 0 0 1 4 2.2h2.8a1.9 1.9 0 0 1 1.9 1.6c.1.9.4 1.8.7 2.7a1.9 1.9 0 0 1-.4 2L7.8 9.7a15.2 15.2 0 0 0 5.7 5.7l1.2-1.2a1.9 1.9 0 0 1 2-.4c.9.3 1.8.6 2.7.7a1.9 1.9 0 0 1 1.6 1.9z" />
  </Svg>
);

export const WhatsAppIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3.5 20.5l1.2-4.2a8.6 8.6 0 1 1 3.2 3.1z" />
    <path d="M9.2 8.4c.2-.4.6-.4.8-.1l.8 1.4c.1.3 0 .5-.2.7l-.4.4c.5 1.1 1.4 2 2.5 2.5l.4-.4c.2-.2.5-.3.7-.2l1.4.8c.3.2.3.6-.1.8-.6.5-1.3.7-2 .5a6.7 6.7 0 0 1-4.4-4.4c-.2-.7 0-1.4.5-2z" />
  </Svg>
);

export const MailIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 5.5h18v13H3z" />
    <path d="M3.5 6.5l8.5 6 8.5-6" />
  </Svg>
);

export const PinIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 21s-6.5-5.8-6.5-11a6.5 6.5 0 0 1 13 0c0 5.2-6.5 11-6.5 11z" />
    <circle cx="12" cy="10" r="2.3" />
  </Svg>
);

export const SearchIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="M15.5 15.5L20 20" />
  </Svg>
);

export const ArrowIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4.5 12h15" />
    <path d="M13.5 6l6 6-6 6" />
  </Svg>
);

export const ChevronIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 9.5l6 6 6-6" />
  </Svg>
);

export const MenuIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3.5 7h17M3.5 12h17M3.5 17h17" />
  </Svg>
);

export const CloseIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Svg>
);

export const FactoryIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M2.5 20.5h19" />
    <path d="M4 20.5V10.5l5 3v-3l5 3V4.5h4v16" />
    <path d="M7 17h1.5M11.5 17H13" />
  </Svg>
);

export const ClockIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Svg>
);

export const NoFeeIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 3h8.5L19 7.5V21H6z" />
    <path d="M14 3.5V8h4.5" />
    <path d="M9.5 14l2 2 4-4" />
  </Svg>
);

export const InstagramIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
    <circle cx="12" cy="12" r="3.8" />
    <path d="M17 7h.01" />
  </Svg>
);

export const YouTubeIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="2.5" y="5.5" width="19" height="13" rx="3.5" />
    <path d="M10 9.3v5.4l4.6-2.7z" />
  </Svg>
);

export const FacebookIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14.5 21v-7.5H17l.5-3h-3V8.6c0-.9.4-1.6 1.7-1.6h1.5V4.3c-.4-.1-1.4-.2-2.4-.2-2.4 0-3.8 1.4-3.8 4V10.5H9v3h2.5V21" />
  </Svg>
);
