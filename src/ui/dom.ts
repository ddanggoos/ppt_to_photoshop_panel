export function getElement(root: Document, id: string): HTMLElement {
  const el = root.getElementById(id);
  if (!el) throw new Error(`Panel element #${id} not found`);
  return el;
}

/** Like `getElement`, but also checks the tag so the result is typed (e.g. "select"). */
export function getTypedElement<K extends keyof HTMLElementTagNameMap>(
  root: Document,
  id: string,
  tag: K,
): HTMLElementTagNameMap[K] {
  const el = getElement(root, id);
  if (el.tagName.toLowerCase() !== tag) throw new Error(`Panel element #${id} is not a <${tag}>`);
  return el as HTMLElementTagNameMap[K];
}

/** Spectrum components read the `disabled` attribute, not the property. */
export function setDisabled(el: HTMLElement, disabled: boolean): void {
  if (disabled) el.setAttribute("disabled", "");
  else el.removeAttribute("disabled");
}
