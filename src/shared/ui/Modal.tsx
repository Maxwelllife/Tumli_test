import { X } from "lucide-react";
import {
  type PropsWithChildren,
  type RefObject,
  useEffect,
  useRef,
} from "react";
import { useTranslation } from "react-i18next";

import { cn } from "../lib/cn";

type ModalProps = PropsWithChildren<{
  description?: string;
  initialFocusRef?: RefObject<HTMLElement | null>;
  isOpen: boolean;
  onClose: () => void;
  title: string;
}>;

export function Modal({
  children,
  description,
  initialFocusRef,
  isOpen,
  onClose,
  title,
}: ModalProps) {
  const { t } = useTranslation();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    previouslyFocusedElement.current = document.activeElement as HTMLElement;

    const focusTarget = initialFocusRef?.current ?? closeButtonRef.current;
    focusTarget?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedElement.current?.focus();
    };
  }, [initialFocusRef, isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 px-3 py-4 sm:items-center"
      role="dialog"
    >
      <button
        aria-label={t("actions.close")}
        className="absolute inset-0 h-full w-full cursor-default"
        onClick={onClose}
        type="button"
      />
      <section
        className={cn(
          "relative max-h-[calc(100svh-2rem)] w-full max-w-xl overflow-auto",
          "rounded-lg border border-line bg-paper p-4 shadow-soft sm:p-6",
        )}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-ink-950">{title}</h2>
            {description ? (
              <p className="mt-1 text-sm text-ink-600">{description}</p>
            ) : null}
          </div>
          <button
            ref={closeButtonRef}
            aria-label={t("actions.close")}
            className="rounded-md p-2 text-ink-600 transition hover:bg-black/[0.05] focus:outline-none focus:ring-2 focus:ring-accent"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden size={18} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
