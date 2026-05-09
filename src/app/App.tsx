import { useCallback, useEffect, useState } from "react";
import { ButtonEditor } from "../components/ButtonEditor";
import { ButtonGrid } from "../components/ButtonGrid";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { SettingsPanel } from "../components/SettingsPanel";
import { deleteButton, getButtons, reorderButtons, replaceAllButtons, saveButton } from "../data/buttonRepository";
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

  async function handleReorder(reorderedButtons: CommunicationButton[]) {
    const previousButtons = buttons;
    setButtons(reorderedButtons);
    setStatus("");

    try {
      await reorderButtons(reorderedButtons);
    } catch {
      setButtons(previousButtons);
      setStatus("Could not save the new button order.");
      await loadButtons();
    }
  }

  async function handleImport(importedButtons: CommunicationButton[]) {
    await replaceAllButtons(importedButtons);
    await loadButtons();
  }

  return (
    <main className="app-shell">
      <div className="floating-actions" aria-label="Caregiver controls">
        <button className={isEditing ? "secondary-button": "edit-button"} type="button" onClick={() => setIsEditing((value) => !value)}>
          {isEditing ? "Done" : "✏️"}
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
        onReorder={handleReorder}
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
