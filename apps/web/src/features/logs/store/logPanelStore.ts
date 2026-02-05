import { create } from "zustand";
import type { LogPanelContext } from "../types";

interface LogPanelState {
  isOpen: boolean;
  context: LogPanelContext | null;
}

interface LogPanelActions {
  openPanel: (context: LogPanelContext) => void;
  closePanel: () => void;
  setContext: (context: LogPanelContext) => void;
}

type LogPanelStore = LogPanelState & LogPanelActions;

const initialState: LogPanelState = {
  isOpen: false,
  context: null,
};

export const useLogPanelStore = create<LogPanelStore>((set) => ({
  ...initialState,

  openPanel: (context: LogPanelContext) => {
    set({
      isOpen: true,
      context,
    });
  },

  closePanel: () => {
    set({
      isOpen: false,
    });
  },

  setContext: (context: LogPanelContext) => {
    set({ context });
  },
}));
