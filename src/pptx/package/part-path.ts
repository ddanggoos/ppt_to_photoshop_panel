/** "ppt/slides/slide1.xml" -> "ppt/slides" */
export function dirname(partPath: string): string {
  const i = partPath.lastIndexOf("/");
  return i === -1 ? "" : partPath.slice(0, i);
}

/** "ppt/presentation.xml" -> "ppt/_rels/presentation.xml.rels" */
export function relsPathFor(partPath: string): string {
  const dir = dirname(partPath);
  const name = dir ? partPath.slice(dir.length + 1) : partPath;
  return `${dir ? dir + "/" : ""}_rels/${name}.rels`;
}

/** Resolves a relationship target (relative or absolute) to a part path. */
export function resolvePartPath(baseDir: string, target: string): string {
  const segments = target.startsWith("/") ? [] : baseDir.split("/").filter(Boolean);
  for (const segment of target.split("/")) {
    if (segment === "" || segment === ".") continue;
    if (segment === "..") segments.pop();
    else segments.push(segment);
  }
  return segments.join("/");
}
