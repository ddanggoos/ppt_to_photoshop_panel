/** Raised when a file is not a readable PowerPoint package. */
export class PptxError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PptxError";
  }
}
