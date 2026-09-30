import { storage } from "uxp";

export interface PickedFile {
  name: string;
  data: ArrayBuffer;
}

/** Shows the OS file picker and reads the chosen file. Returns null if cancelled. */
export async function pickFile(extensions: string[]): Promise<PickedFile | null> {
  const file = await storage.localFileSystem.getFileForOpening({ types: extensions });
  if (!file) return null;

  const data = (await file.read({ format: storage.formats.binary })) as ArrayBuffer;
  return { name: file.name, data };
}
