import { XMLParser } from "fast-xml-parser";
import type { XmlElement } from "./xml-element";

const ATTRIBUTES_KEY = ":@";
const TEXT_KEY = "#text";

// preserveOrder keeps sibling order across element types (e.g. <a:r> and <a:br>),
// which matters for text runs and shape stacking order.
const parser = new XMLParser({
  preserveOrder: true,
  ignoreAttributes: false,
  attributeNamePrefix: "",
  trimValues: false,
  parseTagValue: false,
  parseAttributeValue: false,
});

type OrderedNode = Record<string, unknown>;

/** Parses an XML document and returns its root element. */
export function parseXml(text: string): XmlElement {
  const nodes = parser.parse(text) as OrderedNode[];
  const root = nodes.map(toElement).find((el): el is XmlElement => el !== null && !el.name.startsWith("?"));
  if (!root) {
    throw new Error("XML document has no root element.");
  }
  return root;
}

function toElement(node: OrderedNode): XmlElement | null {
  const name = Object.keys(node).find((key) => key !== ATTRIBUTES_KEY && key !== TEXT_KEY);
  if (name === undefined) return null;

  const childNodes = (node[name] as OrderedNode[] | undefined) ?? [];
  const children: XmlElement[] = [];
  let text = "";
  for (const child of childNodes) {
    if (TEXT_KEY in child) text += String(child[TEXT_KEY]);
    else {
      const el = toElement(child);
      if (el) children.push(el);
    }
  }

  const attributes = (node[ATTRIBUTES_KEY] as Record<string, string> | undefined) ?? {};
  return { name, attributes, children, text };
}
