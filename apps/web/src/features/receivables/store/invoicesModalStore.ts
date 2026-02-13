import { create } from "zustand";

interface InvoicesModalState {
  isOpen: boolean;
  erpId: string;
  erpName: string;
  openModal: (erpId: string, erpName: string) => void;
  closeModal: () => void;
}

export const useInvoicesModalStore = create<InvoicesModalState>((set) => ({
  isOpen: false,
  erpId: "",
  erpName: "",

  openModal: (erpId: string, erpName: string) =>
    set({
      isOpen: true,
      erpId,
      erpName,
    }),

  closeModal: () =>
    set({
      isOpen: false,
      erpId: "",
      erpName: "",
    }),
}));
