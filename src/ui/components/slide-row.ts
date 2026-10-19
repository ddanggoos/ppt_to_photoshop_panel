import { elementsInReadingOrder, hasText, slideTextLines, type Slide } from "@core";
import { setDisabled } from "../dom";
import { isTextBoxSelected, slideCheckState, type TextSelection } from "../state/selection";
import { onRowClick } from "./row-click";
import { createTextBoxRow, type TextBoxRow } from "./text-box-row";
import { createTextPreview } from "./text-preview";

export const PREVIEW_MAX_LINES = 3;

export interface SlideRowHandlers {
  /** The slide checkbox checks or clears all of its text boxes. */
  onSlideToggle(checked: boolean): void;
  onTextBoxToggle(index: number, checked: boolean): void;
  /** Drops the slide from the list. */
  onRemove(): void;
}

export interface SlideRow {
  element: HTMLElement;
  render(selection: TextSelection, busy: boolean): void;
}

type Checkbox = HTMLElement & { checked: boolean; indeterminate: boolean; disabled?: boolean };

/**
 * One slide as an accordion item, collapsed by default:
 *   | ▸ | checkbox | slide number | text preview | − |   ▸ expands; the number/text toggles the checkbox
 *         | checkbox | text box text |                  one row per text box, in reading order
 */
export function createSlideRow(slide: Slide, handlers: SlideRowHandlers): SlideRow {
  const item = document.createElement("div");
  item.className = "slide-item";

  const header = document.createElement("div");
  header.className = "slide-row";

  const disclosure = document.createElement("div");
  disclosure.className = "disclosure";

  const checkbox = document.createElement("sp-checkbox") as Checkbox;
  checkbox.addEventListener("change", () => handlers.onSlideToggle(checkbox.checked));

  const number = document.createElement("span");
  number.className = "slide-number";
  number.textContent = String(slide.number);

  const remove = document.createElement("div");
  remove.className = "remove-button";
  remove.textContent = "−";
  remove.title = "목록에서 제거";
  let busy = false;
  remove.addEventListener("click", () => {
    if (!busy) handlers.onRemove();
  });

  header.append(disclosure, checkbox, number, createTextPreview(slideTextLines(slide), PREVIEW_MAX_LINES, "(텍스트 없음)"), remove);
  onRowClick(header, [disclosure, checkbox, remove], () => {
    if (!checkbox.disabled) handlers.onSlideToggle(!checkbox.checked);
  });

  const children = document.createElement("div");
  children.className = "slide-children";
  const textBoxes: Array<{ index: number; row: TextBoxRow }> = elementsInReadingOrder(slide).map(({ element, index }) => {
    const row = createTextBoxRow(element, (checked) => handlers.onTextBoxToggle(index, checked));
    children.appendChild(row.element);
    return { index, row };
  });

  if (textBoxes.length > 0) {
    disclosure.textContent = "▸";
    disclosure.title = "텍스트 상자 보기";
    disclosure.addEventListener("click", () => {
      const expanded = !item.classList.contains("expanded");
      if (expanded) item.classList.add("expanded");
      else item.classList.remove("expanded");
      disclosure.textContent = expanded ? "▾" : "▸";
    });
  }

  item.append(header, children);
  return {
    element: item,
    render(selection, isBusy) {
      busy = isBusy;
      const state = slideCheckState(selection, slide);
      checkbox.checked = state === "all";
      checkbox.indeterminate = state === "some";
      setDisabled(checkbox, isBusy || !hasText(slide));
      remove.classList.toggle("disabled", isBusy);
      for (const { index, row } of textBoxes) row.render(isTextBoxSelected(selection, slide.number, index), isBusy);
    },
  };
}
