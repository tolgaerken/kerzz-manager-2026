import { create } from "zustand";
import type { LogPanelContext, PipelineLogPanelContext } from "../types";

interface LogPanelState {
  isOpen: boolean;
  context: LogPanelContext | null;
  // Pipeline modu için
  isPipelineMode: boolean;
  pipelineContext: PipelineLogPanelContext | null;
}

interface LogPanelActions {
  openPanel: (context?: LogPanelContext) => void;
  openPipelinePanel: (context: PipelineLogPanelContext) => void;
  closePanel: () => void;
  setContext: (context: LogPanelContext) => void;
  setPipelineContext: (context: PipelineLogPanelContext) => void;
}

type LogPanelStore = LogPanelState & LogPanelActions;

const initialState: LogPanelState = {
  isOpen: false,
  context: null,
  isPipelineMode: false,
  pipelineContext: null,
};

export const useLogPanelStore = create<LogPanelStore>((set) => ({
  ...initialState,

  openPanel: (context?: LogPanelContext) => {
    set({
      isOpen: true,
      context: context || null,
      isPipelineMode: false,
      pipelineContext: null,
    });
  },

  openPipelinePanel: (context: PipelineLogPanelContext) => {
    set({
      isOpen: true,
      context: null,
      isPipelineMode: true,
      pipelineContext: context,
    });
  },

  closePanel: () => {
    set({
      isOpen: false,
    });
  },

  setContext: (context: LogPanelContext) => {
    set({ context, isPipelineMode: false, pipelineContext: null });
  },

  setPipelineContext: (context: PipelineLogPanelContext) => {
    set({ pipelineContext: context, isPipelineMode: true, context: null });
  },
}));
