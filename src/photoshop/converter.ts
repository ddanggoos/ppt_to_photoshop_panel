import { core } from "photoshop";
import type { PptxPackage } from "../pptx/types";
import { DEFAULT_PPI, emuToPx } from "../pptx/units";
import { createSlideDocument } from "./document";

export interface ConvertOptions {
  /** Base name used for the generated documents. */
  baseName: string;
  /** 1-based slide numbers to convert. Defaults to all slides. */
  slideNumbers?: number[];
  ppi?: number;
}

/** Converts slides into Photoshop documents, one document per slide. */
export async function convertPresentation(pkg: PptxPackage, options: ConvertOptions): Promise<void> {
  const ppi = options.ppi ?? DEFAULT_PPI;
  const { slideWidthEmu, slideHeightEmu, slides } = pkg.info;
  const selected = options.slideNumbers
    ? slides.filter((s) => options.slideNumbers!.includes(s.number))
    : slides;

  await core.executeAsModal(
    async (context) => {
      for (const [i, slide] of selected.entries()) {
        reportProgress(context, { value: i / selected.length, commandName: `Slide ${slide.number}` });
        await createSlideDocument({
          name: `${options.baseName} - Slide ${slide.number}`,
          widthPx: emuToPx(slideWidthEmu, ppi),
          heightPx: emuToPx(slideHeightEmu, ppi),
          ppi,
        });
        // TODO: parse slide.path and create text / image / shape layers.
      }
    },
    { commandName: "Convert PPT slides" },
  );
}

type ProgressReporter = (progress: { value?: number; commandName?: string }) => void;

// @types/photoshop declares `reportProgress` as `void`, but it is a function:
// https://developer.adobe.com/photoshop/uxp/2022/ps_reference/media/executeasmodal/#reportprogress
function reportProgress(context: { reportProgress: unknown }, progress: Parameters<ProgressReporter>[0]): void {
  (context.reportProgress as ProgressReporter)(progress);
}
