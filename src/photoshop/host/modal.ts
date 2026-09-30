import { core } from "photoshop";

/** Reports progress (0..1) with an optional label shown in Photoshop's progress bar. */
export type ProgressReporter = (value: number, label?: string) => void;

type ReportProgressFn = (progress: { value?: number; commandName?: string }) => void;

/**
 * Runs `task` inside `core.executeAsModal`, which is required for any document change.
 * https://developer.adobe.com/photoshop/uxp/2022/ps_reference/media/executeasmodal/
 */
export async function runModal(commandName: string, task: (progress: ProgressReporter) => Promise<void>): Promise<void> {
  await core.executeAsModal(
    async (context) => {
      // @types/photoshop declares `reportProgress` as `void`, but it is a function.
      const reportProgress = context.reportProgress as unknown as ReportProgressFn;
      await task((value, label) => reportProgress({ value, commandName: label }));
    },
    { commandName },
  );
}
