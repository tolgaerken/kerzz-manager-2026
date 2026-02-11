import { create } from "zustand";
import type {
  LogPanelContext,
  PipelineLogPanelContext,
  EntityLogPanelContext,
} from "../types";

interface LogPanelState {
  isOpen: boolean;
  context: LogPanelContext | null;
  // Pipeline modu için
  isPipelineMode: boolean;
  pipelineContext: PipelineLogPanelContext | null;
  // Entity modu için (tab'lı panel)
  isEntityMode: boolean;
  entityContext: EntityLogPanelContext | null;
  // Highlight edilecek log ID'si (notification'dan gelir)
  highlightLogId: string | null;
}

interface LogPanelActions {
  openPanel: (context?: LogPanelContext, highlightLogId?: string) => void;
  openPipelinePanel: (context: PipelineLogPanelContext, highlightLogId?: string) => void;
  openEntityPanel: (context: EntityLogPanelContext, highlightLogId?: string) => void;
  closePanel: () => void;
  setContext: (context: LogPanelContext) => void;
  setPipelineContext: (context: PipelineLogPanelContext) => void;
  setEntityContext: (context: EntityLogPanelContext) => void;
  clearHighlight: () => void;
}

type LogPanelStore = LogPanelState & LogPanelActions;

const initialState: LogPanelState = {
  isOpen: false,
  context: null,
  isPipelineMode: false,
  pipelineContext: null,
  isEntityMode: false,
  entityContext: null,
  highlightLogId: null,
};

export const useLogPanelStore = create<LogPanelStore>((set) => ({
  ...initialState,

  openPanel: (context?: LogPanelContext, highlightLogId?: string) => {
    set({
      isOpen: true,
      context: context || null,
      isPipelineMode: false,
      pipelineContext: null,
      isEntityMode: false,
      entityContext: null,
      highlightLogId: highlightLogId || null,
    });
  },

  openPipelinePanel: (context: PipelineLogPanelContext, highlightLogId?: string) => {
    set({
      isOpen: true,
      context: null,
      isPipelineMode: true,
      pipelineContext: context,
      isEntityMode: false,
      entityContext: null,
      highlightLogId: highlightLogId || null,
    });
  },

  openEntityPanel: (context: EntityLogPanelContext, highlightLogId?: string) => {
    set({
      isOpen: true,
      context: null,
      isPipelineMode: false,
      pipelineContext: null,
      isEntityMode: true,
      entityContext: context,
      highlightLogId: highlightLogId || null,
    });
  },

  closePanel: () => {
    set({
      isOpen: false,
      highlightLogId: null,
    });
  },

  setContext: (context: LogPanelContext) => {
    set({
      context,
      isPipelineMode: false,
      pipelineContext: null,
      isEntityMode: false,
      entityContext: null,
    });
  },

  setPipelineContext: (context: PipelineLogPanelContext) => {
    set({
      pipelineContext: context,
      isPipelineMode: true,
      context: null,
      isEntityMode: false,
      entityContext: null,
    });
  },

  setEntityContext: (context: EntityLogPanelContext) => {
    set({
      entityContext: context,
      isEntityMode: true,
      context: null,
      isPipelineMode: false,
      pipelineContext: null,
    });
  },

  clearHighlight: () => {
    set({ highlightLogId: null });
  },
}));
