import type { Presentation } from "@core";
import { DEFAULT_TEXT_SIZE_PT, type TextStyle } from "@photoshop";
import { createStore, type Store } from "./store";

export type Status =
  | { kind: "idle" }
  | { kind: "info"; text: string }
  | { kind: "error"; text: string };

export interface PanelState {
  presentation: Presentation | null;
  /** Opened file name without the .pptx extension. */
  fileBaseName: string;
  /** Checked slides (1-based numbers), ascending. */
  selectedSlideNumbers: number[];
  /** Font and size applied to every text layer. */
  textStyle: TextStyle;
  busy: boolean;
  status: Status;
}

export type PanelStore = Store<PanelState>;

export function createPanelStore(): PanelStore {
  return createStore<PanelState>({
    presentation: null,
    fileBaseName: "",
    selectedSlideNumbers: [],
    textStyle: { sizePt: DEFAULT_TEXT_SIZE_PT },
    busy: false,
    status: { kind: "idle" },
  });
}
