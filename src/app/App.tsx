import { useCallback, useEffect, useState } from "react";
import { ButtonEditor } from "../components/ButtonEditor";
import { ButtonGrid } from "../components/ButtonGrid";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { SettingsPanel } from "../components/SettingsPanel";
import { deleteButton, getButtons, moveButton, replaceAllButtons, saveButton } from "../data/buttonRepository";
import { speakPhrase } from "../speech/speak";
import type { CommunicationButton } from "../types";

export function App() {
  const [buttons, setButtons] = useState<CommunicationButton[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingButton, setEditingButton] = useState<CommunicationButton | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CommunicationButton | null>(null);
  const [status, setStatus] = useState("Loading buttons...");

  const loadButtons = useCallback(async () => {
    const nextButtons = await getButtons();
    setButtons(nextButtons);
    setStatus(nextButtons.length ? "" : "No buttons yet.");
  }, []);

  useEffect(() => {
    void loadButtons().catch(() => setStatus("Could not load saved buttons."));
  }, [loadButtons]);

  async function handleSave(button: Omit<CommunicationButton, "id" | "sortOrder" | "createdAt" | "updatedAt">) {
    await saveButton(button, editingButton ?? undefined);
    setShowEditor(false);
    setEditingButton(null);
    await loadButtons();
  }

  async function handleDeleteConfirmed() {
    if (!deleteTarget) {
      return;
    }

    await deleteButton(deleteTarget.id);
    setDeleteTarget(null);
    await loadButtons();
  }

  async function handleMove(id: string, direction: "up" | "down") {
    await moveButton(id, direction);
    await loadButtons();
  }

  async function handleImport(importedButtons: CommunicationButton[]) {
    await replaceAllButtons(importedButtons);
    await loadButtons();
  }

  return (
    <main className="app-shell">
      <header className="top-bar">
        <div>
          <h1>SimpleSpeech</h1>
          <p>{isEditing ? "Caregiver edit mode" : "Tap a picture to speak"}</p>
        </div>
        <div className="top-actions">
          <button className="secondary-button" type="button" onClick={() => setIsEditing((value) => !value)}>
            {isEditing ? "Done" : "Edit"}
          </button>
          {isEditing ? (
            <button
              className="primary-button"
              type="button"
              onClick={() => {
                setEditingButton(null);
                setShowEditor(true);
              }}
            >
              Add
            </button>
          ) : null}
        </div>
      </header>

      {status ? <p className="status-text">{status}</p> : null}

      <ButtonGrid
        buttons={buttons}
        isEditing={isEditing}
        onSpeak={(button) => speakPhrase(button.phrase)}
        onEdit={(button) => {
          setEditingButton(button);
          setShowEditor(true);
        }}
        onDelete={setDeleteTarget}
        onMove={handleMove}
      />

      {isEditing ? <SettingsPanel buttons={buttons} onImport={handleImport} /> : null}

      {showEditor ? (
        <ButtonEditor
          button={editingButton}
          onCancel={() => {
            setShowEditor(false);
            setEditingButton(null);
          }}
          onSave={handleSave}
        />
      ) : null}

      {deleteTarget ? (
        <ConfirmDialog
          title="Delete button?"
          message={`Delete "${deleteTarget.label}"? This cannot be undone.`}
          confirmLabel="Delete"
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirmed}
        />
      ) : null}
    </main>
  );
}
