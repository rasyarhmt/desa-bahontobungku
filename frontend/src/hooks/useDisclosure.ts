import { useCallback, useState } from "react";

export interface UseDisclosureResult {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

/** State buka/tutup untuk modal, dropdown, atau panel. */
export function useDisclosure(initial = false): UseDisclosureResult {
  const [isOpen, setOpen] = useState(initial);

  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((value) => !value), []);

  return { isOpen, open, close, toggle, setOpen };
}
