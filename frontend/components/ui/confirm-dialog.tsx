"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { FiAlertTriangle, FiCheckCircle, FiHelpCircle, FiTrash2 } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ConfirmTone = "default" | "destructive" | "warning" | "success";

export type ConfirmOptions = {
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
  /**
   * Ixtiyoriy: tasdiqlangach bajariladigan amal. Berilsa, dialog amal tugaguncha
   * "loading" holatda turadi va xatolik bo'lsa ochiqligicha qoladi.
   */
  onConfirm?: () => void | Promise<void>;
};

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

const toneIcon: Record<ConfirmTone, React.ReactNode> = {
  default: <FiHelpCircle className="h-5 w-5 text-sky-400" />,
  destructive: <FiTrash2 className="h-5 w-5 text-red-400" />,
  warning: <FiAlertTriangle className="h-5 w-5 text-amber-400" />,
  success: <FiCheckCircle className="h-5 w-5 text-emerald-400" />,
};

const toneRing: Record<ConfirmTone, string> = {
  default: "bg-sky-500/10 ring-sky-500/30",
  destructive: "bg-red-500/10 ring-red-500/30",
  warning: "bg-amber-500/10 ring-amber-500/30",
  success: "bg-emerald-500/10 ring-emerald-500/30",
};

const toneButton: Record<ConfirmTone, React.ComponentProps<typeof Button>["variant"]> = {
  default: "default",
  destructive: "destructive",
  warning: "warning",
  success: "success",
};

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const settle = useCallback((value: boolean) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
  }, []);

  const confirm = useCallback<ConfirmFn>((next) => {
    setOptions(next);
    setBusy(false);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const handleOpenChange = useCallback(
    (value: boolean) => {
      if (busy) return; // amal ketayotganda yopishni bloklaymiz
      if (!value) {
        setOpen(false);
        settle(false);
      }
    },
    [busy, settle],
  );

  const handleCancel = useCallback(() => {
    if (busy) return;
    setOpen(false);
    settle(false);
  }, [busy, settle]);

  const handleConfirm = useCallback(async () => {
    if (!options) return;
    if (options.onConfirm) {
      try {
        setBusy(true);
        await options.onConfirm();
      } catch {
        // Amal muvaffaqiyatsiz — dialog ochiqligicha qoladi (toast'ni amalning o'zi ko'rsatadi).
        setBusy(false);
        return;
      }
      setBusy(false);
    }
    setOpen(false);
    settle(true);
  }, [options, settle]);

  const tone = options?.tone ?? "default";
  const value = useMemo(() => confirm, [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="w-[min(92vw,440px)]">
          <DialogHeader>
            <div className="flex items-start gap-3">
              <span className={`mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-1 ${toneRing[tone]}`}>
                {toneIcon[tone]}
              </span>
              <div className="space-y-1.5">
                <DialogTitle>{options?.title}</DialogTitle>
                {options?.description ? <DialogDescription>{options.description}</DialogDescription> : null}
              </div>
            </div>
          </DialogHeader>
          <DialogFooter className="mt-1">
            <Button variant="secondary" onClick={handleCancel} disabled={busy}>
              {options?.cancelLabel ?? "Bekor qilish"}
            </Button>
            <Button variant={toneButton[tone]} onClick={handleConfirm} disabled={busy}>
              {busy ? "Bajarilmoqda…" : options?.confirmLabel ?? "Tasdiqlash"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConfirmContext.Provider>
  );
}

/**
 * Imperativ tasdiqlash. Misol:
 *   const confirm = useConfirm();
 *   if (await confirm({ title: "O'chirilsinmi?", tone: "destructive" })) doDelete();
 * Yoki amalni to'g'ridan-to'g'ri berib (loading holati bilan):
 *   await confirm({ title: "...", onConfirm: () => deleteBooking(id) });
 */
export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within a ConfirmProvider");
  return ctx;
}
