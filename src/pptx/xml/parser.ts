import { XMLParser } from "fast-xml-parser";

/** Attribute keys are prefixed with "@_", e.g. `node["@_cx"]`. */
export const ATTR = "@_";

/** Elements that may repeat and must always be parsed as arrays. */
const ALWAYS_ARRAY = new Set(["Relationship", "p:sldId"]);

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: ATTR,
  isArray: (name) => ALWAYS_ARRAY.has(name),
});

// Parsed XML is untyped by nature; callers narrow what they read.
export type XmlNode = Record<string, any>;

export function parseXml(text: string): XmlNode {
  return parser.parse(text);
}
