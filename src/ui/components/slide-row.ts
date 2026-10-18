import { elementsInReadingOrder, hasText, slideTextLines, type Slide } from "@core";
import { setDisabled } from "../dom";
import { isTextBoxSelected, slideCheckState, type TextSelection } from "../state/selection";
import { createTextBoxRow, type TextBoxRow } from "./text-box-row";
import { createTextPreview } from "./text-preview";

export const PREVIEW_MAX_LINES = 3;

export interface SlideRowHandlers {
  /** The slide checkbox checks or clears all of its text boxes. */
  onSlideToggle(checked: boolean): void;
  onTextBoxToggle(index: number, checked: boolean): void;
}

export interface SlideRow {
  element: HTMLElement;
  render(selection: TextSelection, busy: boolean): void;
}

type Checkbox = HTMLElement & { checked: boolean; indeterminate: boolean };

/**
 * One slide as an accordion item, collapsed by default:
 *   | ▸ | checkbox | slide number | text preview |   header; clicking outside the checkbox expands it
 *         | checkbox | text box text |              one row per text box, in reading order
 */
export function createSlideRow(slide: Slide, handlers: SlideRowHandlers): SlideRow {
  const item = document.createElement("div");
  item.className = "slide-item";

  const header = document.createElement("div");
  header.className = "slide-row";

  const disclosure = document.createElement("span");
  disclosure.className = "disclosure";

  const checkbox = document.createElement("sp-checkbox") as Checkbox;
  checkbox.addEventListener("change", () => handlers.onSlideToggle(checkbox.checked));

  const number = document.createElement("span");
  number.className = "slide-number";
  number.textContent = String(slide.number);

  header.append(disclosure, checkbox, number, createTextPreview(slideTextLines(slide), PREVIEW_MAX_LINES, "(텍스트 없음)"));

  const children = document.createElement("div");
  children.className = "slide-children";
  const textBoxes: Array<{ index: number; row: TextBoxRow }> = elementsInReadingOrder(slide).map(({ element, index }) => {
    const row = createTextBoxRow(element, (checked) => handlers.onTextBoxToggle(index, checked));
    children.appendChild(row.element);
    return { index, row };
  });

  if (textBoxes.length > 0) {
    disclosure.textContent = "▸";
    header.addEventListener("click", (event) => {
      if (checkbox.contains(event.target as Node)) return;
      const expanded = !item.classList.contains("expanded");
      if (expanded) item.classList.add("expanded");
      else item.classList.remove("expanded");
      disclosure.textContent = expanded ? "▾" : "▸";
    });
  }

  item.append(header, children);
  return {
    element: item,
    render(selection, busy) {
      const state = slideCheckState(selection, slide);
      checkbox.checked = state === "all";
      checkbox.indeterminate = state === "some";
      setDisabled(checkbox, busy || !hasText(slide));
      for (const { index, row } of textBoxes) row.render(isTextBoxSelected(selection, slide.number, index), busy);
    },
  };
}
