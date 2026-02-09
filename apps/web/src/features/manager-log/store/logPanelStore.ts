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
}

interface LogPanelActions {
  openPanel: (context?: LogPanelContext) => void;
  openPipelinePanel: (context: PipelineLogPanelContext) => void;
  openEntityPanel: (context: EntityLogPanelContext) => void;
  closePanel: () => void;
  setContext: (context: LogPanelContext) => void;
  setPipelineContext: (context: PipelineLogPanelContext) => void;
  setEntityContext: (context: EntityLogPanelContext) => void;
}

type LogPanelStore = LogPanelState & LogPanelActions;

const initialState: LogPanelState = {
  isOpen: false,
  context: null,
  isPipelineMode: false,
  pipelineContext: null,
  isEntityMode: false,
  entityContext: null,
};

export const useLogPanelStore = create<LogPanelStore>((set) => ({
  ...initialState,

  openPanel: (context?: LogPanelContext) => {
    set({
      isOpen: true,
      context: context || null,
      isPipelineMode: false,
      pipelineContext: null,
      isEntityMode: false,
      entityContext: null,
    });
  },

  openPipelinePanel: (context: PipelineLogPanelContext) => {
    set({
      isOpen: true,
      context: null,
      isPipelineMode: true,
      pipelineContext: context,
      isEntityMode: false,
      entityContext: null,
    });
  },

  openEntityPanel: (context: EntityLogPanelContext) => {
    set({
      isOpen: true,
      context: null,
      isPipelineMode: false,
      pipelineContext: null,
      isEntityMode: true,
      entityContext: context,
    });
  },

  closePanel: () => {
    set({
      isOpen: false,
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
}));
