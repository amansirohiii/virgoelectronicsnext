"use client";

import { useEffect, useState } from "react";

/**
 * Phone-only bar with the model name and an Enquire button. It appears once the
 * page's main Enquire button has scrolled off the top, and goes away again when
 * the enquiry form itself is reached. It sits directly above the site's fixed
 * contact bar (56 px plus the safe area), never over it.
 */
export function StickyEnquire({
  name,
  detail,
  watchId,
  formId,
}: {
  name: string;
  /** Short line under the name, e.g. the key figure */
  detail?: string;
  /** id of the main Enquire button near the top of the page */
  watchId: string;
  /** id of the enquiry form section the button jumps to */
  formId: string;
}) {
  const [past, setPast] = useState(false);
  const [reached, setReached] = useState(false);

  useEffect(() => {
    const button = document.getElementById(watchId);
    const form = document.getElementById(formId);
    if (!button || !form || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target === button) setPast(!e.isIntersecting && e.boundingClientRect.top < 0);
        if (e.target === form) setReached(e.isIntersecting || e.boundingClientRect.top < 0);
      }
    });
    io.observe(button);
    io.observe(form);
    return () => io.disconnect();
  }, [watchId, formId]);

  const show = past && !reached;

  return (
    <div
      aria-hidden={!show}
      inert={!show}
      className={`fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-30 border-t border-line bg-cell transition-[opacity,transform,visibility] duration-300 ease-out-quart lg:hidden ${
        show ? "visible translate-y-0 opacity-100" : "invisible translate-y-3 opacity-0"
      }`}
    >
      <div className="wrap flex items-center justify-between gap-4 py-2">
        <p className="min-w-0">
          <span className="display block truncate text-xl">{name}</span>
          {detail ? <span className="label block truncate">{detail}</span> : null}
        </p>
        <a href={`#${formId}`} className="btn btn-red min-h-11 shrink-0 px-5 py-2">
          Enquire
        </a>
      </div>
    </div>
  );
}
