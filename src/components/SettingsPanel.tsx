import { useRef, useState } from "react";
import { exportBackup } from "../backup/exportBackup";
import { readBackupFile } from "../backup/importBackup";
import type { CommunicationButton } from "../types";

type SettingsPanelProps = {
  buttons: CommunicationButton[];
  onImport: (buttons: CommunicationButton[]) => Promise<void>;
};

export function SettingsPanel({ buttons, onImport }: SettingsPanelProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [message, setMessage] = useState("");

  async function handleImport(file: File | undefined) {
    if (!file) {
      return;
    }

    try {
      const backup = await readBackupFile(file);
      const confirmed = confirm(`Replace current buttons with ${backup.buttons.length} button(s) from this backup?`);

      if (!confirmed) {
        return;
      }

      await onImport(backup.buttons);
      setMessage("Backup imported.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not import that backup.");
    } finally {
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <section className="settings-panel" aria-label="Settings">
      <h2>Settings</h2>
      <div className="settings-actions">
        <button className="secondary-button" type="button" onClick={() => exportBackup(buttons)}>
          Export Backup
        </button>
        <button className="secondary-button" type="button" onClick={() => inputRef.current?.click()}>
          Import Backup
        </button>
        <input
          ref={inputRef}
          className="visually-hidden"
          type="file"
          accept="application/json,.json"
          onChange={(event) => void handleImport(event.target.files?.[0])}
        />
      </div>
      {message ? <p className="status-text">{message}</p> : null}
      <p className="safety-note">
        This app is intended as a communication aid. It is not a substitute for emergency medical care or professional
        medical advice.
      </p>
    </section>
  );
}
