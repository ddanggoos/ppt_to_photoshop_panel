/** An XML element with its children kept in document order. */
export interface XmlElement {
  name: string;
  attributes: Record<string, string>;
  children: XmlElement[];
  /** Text directly inside this element, whitespace preserved. */
  text: string;
}

export function findChild(el: XmlElement | undefined, name: string): XmlElement | undefined {
  return el?.children.find((child) => child.name === name);
}

export function findChildren(el: XmlElement | undefined, name: string): XmlElement[] {
  return el ? el.children.filter((child) => child.name === name) : [];
}

/** Follows a path of child names, e.g. `findPath(sp, "p:nvSpPr", "p:cNvPr")`. */
export function findPath(el: XmlElement | undefined, ...names: string[]): XmlElement | undefined {
  return names.reduce<XmlElement | undefined>((node, name) => findChild(node, name), el);
}

export function getAttr(el: XmlElement | undefined, name: string): string | undefined {
  return el?.attributes[name];
}

/** Returns the attribute as a number, or undefined when missing or not numeric. */
export function getNumberAttr(el: XmlElement | undefined, name: string): number | undefined {
  const value = getAttr(el, name);
  if (value === undefined || value.trim() === "") return undefined;
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
}
