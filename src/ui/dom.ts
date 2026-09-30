export function getElement(root: Document, id: string): HTMLElement {
  const el = root.getElementById(id);
  if (!el) throw new Error(`Panel element #${id} not found`);
  return el;
}

/** Spectrum components read the `disabled` attribute, not the property. */
export function setDisabled(el: HTMLElement, disabled: boolean): void {
  if (disabled) el.setAttribute("disabled", "");
  else el.removeAttribute("disabled");
}
