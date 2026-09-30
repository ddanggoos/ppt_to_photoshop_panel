import type { Presentation } from "@core";
import { createStore, type Store } from "./store";

export type Status =
  | { kind: "idle" }
  | { kind: "info"; text: string }
  | { kind: "error"; text: string };

export interface PanelState {
  presentation: Presentation | null;
  /** Opened file name without the .pptx extension. */
  fileBaseName: string;
  busy: boolean;
  status: Status;
}

export type PanelStore = Store<PanelState>;

export function createPanelStore(): PanelStore {
  return createStore<PanelState>({
    presentation: null,
    fileBaseName: "",
    busy: false,
    status: { kind: "idle" },
  });
}
