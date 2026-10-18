import { visibleTextLines, type SlideElement } from "@core";
import { setDisabled } from "../dom";
import { createTextPreview } from "./text-preview";

export const TEXT_BOX_MAX_LINES = 2;

export interface TextBoxRow {
  element: HTMLElement;
  render(checked: boolean, busy: boolean): void;
}

/** One text box inside an expanded slide: | checkbox | text (up to 2 lines) |. Clicking the text toggles it too. */
export function createTextBoxRow(textBox: SlideElement, onToggle: (checked: boolean) => void): TextBoxRow {
  const row = document.createElement("div");
  row.className = "text-box-row";

  const checkbox = document.createElement("sp-checkbox") as HTMLElement & { checked: boolean; disabled?: boolean };
  checkbox.addEventListener("change", () => onToggle(checkbox.checked));

  const preview = createTextPreview(visibleTextLines(textBox), TEXT_BOX_MAX_LINES, "(빈 텍스트 상자)");
  preview.title = textBox.name;
  preview.addEventListener("click", () => {
    if (!checkbox.disabled) onToggle(!checkbox.checked);
  });

  row.append(checkbox, preview);
  return {
    element: row,
    render(checked, busy) {
      checkbox.checked = checked;
      setDisabled(checkbox, busy);
    },
  };
}
