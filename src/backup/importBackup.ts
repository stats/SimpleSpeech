import type { CommunicationButton } from "../types";
import type { BackupFile } from "./exportBackup";

export async function readBackupFile(file: File): Promise<BackupFile> {
  const text = await file.text();
  const parsed = JSON.parse(text) as unknown;

  if (!isBackupFile(parsed)) {
    throw new Error("This backup file is not valid for SimpleSpeech.");
  }

  return parsed;
}

function isBackupFile(value: unknown): value is BackupFile {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<BackupFile>;
  return candidate.schemaVersion === 1 && typeof candidate.exportedAt === "string" && Array.isArray(candidate.buttons) && candidate.buttons.every(isButton);
}

function isButton(value: unknown): value is CommunicationButton {
  if (!value || typeof value !== "object") {
    return false;
  }

  const button = value as Partial<CommunicationButton>;
  return (
    typeof button.id === "string" &&
    typeof button.label === "string" &&
    typeof button.phrase === "string" &&
    typeof button.sortOrder === "number" &&
    typeof button.createdAt === "string" &&
    typeof button.updatedAt === "string" &&
    (button.imageDataUrl === undefined || typeof button.imageDataUrl === "string") &&
    (button.placeholder === undefined || typeof button.placeholder === "string")
  );
}
