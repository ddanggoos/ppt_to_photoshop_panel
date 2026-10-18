/**
 * Calls `onClick` for clicks anywhere in `row` except inside `excluded` elements
 * (controls that handle their own clicks, such as the checkbox itself).
 */
export function onRowClick(row: HTMLElement, excluded: HTMLElement[], onClick: () => void): void {
  row.addEventListener("click", (event) => {
    const target = event.target as Node | null;
    if (target && excluded.some((el) => el.contains(target))) return;
    onClick();
  });
}
