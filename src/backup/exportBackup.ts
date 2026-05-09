import type { CommunicationButton } from "../types";

export type BackupFile = {
  schemaVersion: 1;
  exportedAt: string;
  buttons: CommunicationButton[];
};

export function exportBackup(buttons: CommunicationButton[]) {
  const backup: BackupFile = {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    buttons
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);

  anchor.href = url;
  anchor.download = `simplespeech-backup-${date}.json`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
