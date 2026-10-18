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

/**
 * Sets `disabled` through the property, skipping no-op changes. SWC (Lit) elements reflect it
 * to the attribute themselves; calling `setAttribute("disabled")` on `sp-checkbox` directly
 * throws an AssertionError inside UXP (Photoshop 27.11, UXP 9.4).
 */
export function setDisabled(el: HTMLElement & { disabled?: boolean }, disabled: boolean): void {
  if (Boolean(el.disabled) !== disabled) el.disabled = disabled;
}
