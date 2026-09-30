import type { Status } from "../state/panel-state";

export function renderStatusLine(el: HTMLElement, status: Status): void {
  el.textContent = status.kind === "idle" ? "" : status.text;
  el.classList.toggle("error", status.kind === "error");
}
