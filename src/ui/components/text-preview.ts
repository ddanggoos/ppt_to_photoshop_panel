/**
 * Shows up to `maxLines` lines, marking the last one with … when more follow.
 * Shows `emptyText` (dimmed) when there are no lines.
 */
export function createTextPreview(lines: string[], maxLines: number, emptyText: string): HTMLElement {
  const preview = document.createElement("div");
  preview.className = "text-preview";

  if (lines.length === 0) {
    preview.classList.add("empty");
    preview.textContent = emptyText;
    return preview;
  }

  const shown = lines.slice(0, maxLines);
  if (lines.length > maxLines) shown[shown.length - 1] += " …";
  for (const line of shown) {
    const lineEl = document.createElement("div");
    lineEl.className = "preview-line";
    lineEl.textContent = line;
    preview.appendChild(lineEl);
  }
  return preview;
}
