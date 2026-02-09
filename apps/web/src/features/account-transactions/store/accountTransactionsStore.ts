import { create } from "zustand";
import { ACCOUNT_TRANSACTIONS_CONSTANTS } from "../constants/accountTransactions.constants";

interface AccountTransactionsState {
  isOpen: boolean;
  erpId: string;
  erpCompany: string;
  year: number;
  openModal: (erpId: string, erpCompany: string) => void;
  closeModal: () => void;
  setYear: (year: number) => void;
  setCompany: (company: string) => void;
  setErpId: (erpId: string) => void;
}

export const useAccountTransactionsStore = create<AccountTransactionsState>(
  (set) => ({
    isOpen: false,
    erpId: "",
    erpCompany: ACCOUNT_TRANSACTIONS_CONSTANTS.DEFAULT_COMPANY,
    year: ACCOUNT_TRANSACTIONS_CONSTANTS.DEFAULT_YEAR,

    openModal: (erpId: string, erpCompany: string) =>
      set({
        isOpen: true,
        erpId,
        erpCompany: erpCompany || ACCOUNT_TRANSACTIONS_CONSTANTS.DEFAULT_COMPANY,
      }),

    closeModal: () =>
      set({
        isOpen: false,
        erpId: "",
      }),

    setYear: (year: number) => set({ year }),

    setCompany: (company: string) => set({ erpCompany: company }),

    setErpId: (erpId: string) => set({ erpId }),
  })
);
