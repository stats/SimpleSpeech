import { FormEvent, useEffect, useState } from "react";
import { resizeImage } from "../images/resizeImage";
import type { CommunicationButton } from "../types";

type EditableButton = Omit<CommunicationButton, "id" | "sortOrder" | "createdAt" | "updatedAt">;

type ButtonEditorProps = {
  button: CommunicationButton | null;
  onCancel: () => void;
  onSave: (button: EditableButton) => Promise<void>;
};

export function ButtonEditor({ button, onCancel, onSave }: ButtonEditorProps) {
  const [label, setLabel] = useState("");
  const [phrase, setPhrase] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | undefined>();
  const [placeholder, setPlaceholder] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLabel(button?.label ?? "");
    setPhrase(button?.phrase ?? "");
    setImageDataUrl(button?.imageDataUrl);
    setPlaceholder(button?.placeholder);
    setError("");
  }, [button]);

  async function handleImageSelected(file: File | undefined) {
    if (!file) {
      return;
    }

    try {
      setError("");
      const resized = await resizeImage(file);
      setImageDataUrl(resized);
      setPlaceholder(undefined);
    } catch (imageError) {
      setError(imageError instanceof Error ? imageError.message : "Could not process that image.");
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!label.trim() || !phrase.trim()) {
      setError("Label and phrase are required.");
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        label: label.trim(),
        phrase: phrase.trim(),
        imageDataUrl,
        placeholder
      });
    } catch {
      setError("Could not save this button.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <form className="editor-panel" onSubmit={handleSubmit} aria-label={button ? "Edit button" : "Add button"}>
        <div className="modal-header">
          <h2>{button ? "Edit Button" : "Add Button"}</h2>
          <button className="icon-button" type="button" onClick={onCancel} aria-label="Close editor">
            X
          </button>
        </div>

        <label>
          Label
          <input value={label} onChange={(event) => setLabel(event.target.value)} maxLength={32} autoFocus />
        </label>

        <label>
          Spoken phrase
          <textarea value={phrase} onChange={(event) => setPhrase(event.target.value)} rows={3} />
        </label>

        <div className="image-picker">
          <div className="preview-box">
            {imageDataUrl ? <img src={imageDataUrl} alt="Selected preview" /> : <span>No image</span>}
          </div>

          <label>
            Choose image
            <input type="file" accept="image/*" onChange={(event) => void handleImageSelected(event.target.files?.[0])} />
          </label>

          <label>
            Use camera
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(event) => void handleImageSelected(event.target.files?.[0])}
            />
          </label>

          {imageDataUrl ? (
            <button className="secondary-button" type="button" onClick={() => setImageDataUrl(undefined)}>
              Remove image
            </button>
          ) : null}
        </div>

        {error ? <p className="error-text">{error}</p> : null}

        <div className="modal-actions">
          <button className="secondary-button" type="button" onClick={onCancel}>
            Cancel
          </button>
          <button className="primary-button" type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
