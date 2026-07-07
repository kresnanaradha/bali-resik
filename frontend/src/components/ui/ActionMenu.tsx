import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreVertical } from "lucide-react";

export interface ActionMenuItem {
  label: string;
  onClick: () => void;
  tone?: "default" | "danger";
}

interface ActionMenuProps {
  items: ActionMenuItem[];
}

const MENU_WIDTH = 160;

// Renders the dropdown into document.body via a portal, positioned with
// `fixed` from the trigger button's rect. Table cells sit inside DataTable's
// overflow-hidden/overflow-x-auto wrapper (needed for rounded corners + small
// viewports), which silently clips any absolutely-positioned dropdown that
// pops out of a cell — a portal sidesteps that ancestor clipping entirely.
export function ActionMenu({ items }: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function updatePosition() {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (rect) {
        setPosition({ top: rect.bottom + 4, left: rect.right - MENU_WIDTH });
      }
    }
    updatePosition();

    function handleClickOutside(e: MouseEvent) {
      if (buttonRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    }

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label="Menu aksi"
        className="text-gray-400 hover:text-gray-600"
        onClick={() => setOpen((v) => !v)}
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open &&
        createPortal(
          <div
            className="fixed z-50 rounded-lg border border-gray-200 bg-white py-1 text-sm shadow-lg"
            style={{ top: position.top, left: position.left, width: MENU_WIDTH }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  item.onClick();
                  setOpen(false);
                }}
                className={`block w-full px-3 py-1.5 text-left hover:bg-gray-50 ${
                  item.tone === "danger" ? "text-red-600" : "text-gray-700"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}
