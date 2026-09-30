import { hasText, slideTextLines, type Slide } from "@core";

export const PREVIEW_MAX_LINES = 3;

export interface SlideRow {
  element: HTMLElement;
  checkbox: HTMLElement & { checked: boolean };
}

/** Builds one list row: | checkbox | slide number | text preview (up to 3 lines) | */
export function createSlideRow(slide: Slide, onToggle: (checked: boolean) => void): SlideRow {
  const row = document.createElement("div");
  row.className = "slide-row";

  const checkbox = document.createElement("sp-checkbox") as SlideRow["checkbox"];
  if (!hasText(slide)) checkbox.setAttribute("disabled", "");
  checkbox.addEventListener("change", () => onToggle(checkbox.checked));

  const number = document.createElement("span");
  number.className = "slide-number";
  number.textContent = String(slide.number);

  row.append(checkbox, number, createPreview(slide));
  return { element: row, checkbox };
}

function createPreview(slide: Slide): HTMLElement {
  const preview = document.createElement("div");
  preview.className = "slide-preview";

  const lines = slideTextLines(slide);
  if (lines.length === 0) {
    preview.classList.add("empty");
    preview.textContent = "(텍스트 없음)";
    return preview;
  }

  const shown = lines.slice(0, PREVIEW_MAX_LINES);
  if (lines.length > PREVIEW_MAX_LINES) shown[shown.length - 1] += " …";
  for (const line of shown) {
    const lineEl = document.createElement("div");
    lineEl.className = "preview-line";
    lineEl.textContent = line;
    preview.appendChild(lineEl);
  }
  return preview;
}
