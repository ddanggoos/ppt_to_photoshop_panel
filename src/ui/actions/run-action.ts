import { toErrorMessage } from "@shared";
import type { PanelStore } from "../state/panel-state";

/** Runs a user action with busy-state handling. Ignored while another action runs. */
export async function runAction(store: PanelStore, action: () => Promise<void>): Promise<void> {
  if (store.get().busy) return;
  store.update({ busy: true });
  try {
    await action();
  } catch (error) {
    console.error(error);
    store.update({ status: { kind: "error", text: `오류: ${toErrorMessage(error)}` } });
  } finally {
    store.update({ busy: false });
  }
}
