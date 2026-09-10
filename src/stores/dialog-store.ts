import { create } from "zustand";

type DialogVariant = "default" | "destructive";

type DialogOptions = {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: DialogVariant;
};

type DialogState = {
  visible: boolean;
  options: DialogOptions | null;
  resolve: ((value: boolean) => void) | null;
  open: (options: DialogOptions) => Promise<boolean>;
  handle: (result: boolean) => void;
};

export const useDialogStore = create<DialogState>((set, get) => ({
  visible: false,
  options: null,
  resolve: null,
  open: (options) => {
    return new Promise<boolean>((resolve) => {
      set({ visible: true, options, resolve });
    });
  },
  handle: (result) => {
    get().resolve?.(result);
    set({ visible: false, options: null, resolve: null });
  },
}));

/** Herhangi bir yerden: `const ok = await confirm({ title: "...", variant: "destructive" })` */
export function confirm(options: DialogOptions) {
  return useDialogStore.getState().open(options);
}