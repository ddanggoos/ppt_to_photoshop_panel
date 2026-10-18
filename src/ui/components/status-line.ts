import type { Status } from "../state/panel-state";

/** One line, truncated with … when too long; the full text shows as a tooltip on hover. */
export function renderStatusLine(el: HTMLElement, status: Status): void {
  const text = status.kind === "idle" ? "" : status.text;
  el.textContent = text;
  el.title = text;
  el.classList.toggle("error", status.kind === "error");
}
