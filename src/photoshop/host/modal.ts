import { core } from "photoshop";
import type { Document } from "photoshop/dom/Document";

/** Reports progress (0..1) with an optional label shown in Photoshop's progress bar. */
export type ProgressReporter = (value: number, label?: string) => void;

export interface ModalContext {
  progress: ProgressReporter;
  /**
   * Runs `task` as a single history state named `name` on `doc`.
   * If `task` throws, the document is rolled back to where it was.
   */
  historyStep<T>(doc: Document, name: string, task: () => Promise<T>): Promise<T>;
}

type ReportProgressFn = (progress: { value?: number; commandName?: string }) => void;

/**
 * Runs `task` inside `core.executeAsModal`, which is required for any document change.
 * https://developer.adobe.com/photoshop/uxp/2022/ps_reference/media/executeasmodal/
 */
export async function runModal(commandName: string, task: (ctx: ModalContext) => Promise<void>): Promise<void> {
  await core.executeAsModal(
    async (context) => {
      // @types/photoshop declares `reportProgress` as `void`, but it is a function.
      const reportProgress = context.reportProgress as unknown as ReportProgressFn;
      const { hostControl } = context;

      await task({
        progress: (value, label) => reportProgress({ value, commandName: label }),
        async historyStep(doc, name, step) {
          const suspension = await hostControl.suspendHistory({ documentID: doc.id, name });
          try {
            const result = await step();
            await hostControl.resumeHistory(suspension, true);
            return result;
          } catch (error) {
            await hostControl.resumeHistory(suspension, false);
            throw error;
          }
        },
      });
    },
    { commandName },
  );
}
