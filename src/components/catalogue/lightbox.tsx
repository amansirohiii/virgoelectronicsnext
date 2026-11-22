"use client";

import Image from "next/image";
import { useRef, type ReactNode } from "react";

/**
 * Wraps the product photograph in a button that opens it full size in a native
 * dialog. Escape and the Close button shut it, and focus goes back to the photo.
 */
export function Lightbox({
  image,
  label,
  children,
}: {
  image: { src: string; width: number; height: number; alt: string };
  /** Accessible name for the button, e.g. "Enlarge the photo of the Sumo" */
  label: string;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = () => dialogRef.current?.close();

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="dialog"
        onClick={() => dialogRef.current?.showModal()}
        className="group relative block w-full cursor-zoom-in text-left"
      >
        {children}
        <span
          aria-hidden="true"
          className="label absolute bottom-3 right-3 border border-line bg-white px-2.5 py-1.5 !text-ink opacity-90 transition-opacity group-hover:opacity-100"
        >
          Enlarge +
        </span>
      </button>

      <dialog
        ref={dialogRef}
        aria-label={image.alt}
        onClose={() => triggerRef.current?.focus()}
        onClick={(e) => {
          // A click on the backdrop lands on the dialog element itself
          if (e.target === e.currentTarget) close();
        }}
        className="m-auto h-dvh max-h-none w-screen max-w-none bg-white p-0 backdrop:bg-ink/70"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-4 border-b border-line px-4 py-2 sm:px-6">
            <p className="label truncate">{image.alt}</p>
            <button type="button" onClick={close} className="btn btn-line min-h-11 shrink-0 px-4 py-2">
              Close
            </button>
          </div>
          <div className="relative min-h-0 flex-1" onClick={close}>
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="100vw"
              className="cursor-zoom-out object-contain p-4 sm:p-10"
            />
          </div>
        </div>
      </dialog>
    </>
  );
}
