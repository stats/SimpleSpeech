import type { CommunicationButton } from "../types";

type CommunicationButtonCardProps = {
  button: CommunicationButton;
  isEditing: boolean;
  isFirst: boolean;
  isLast: boolean;
  onSpeak: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onMove: (direction: "up" | "down") => void;
};

const placeholderText: Record<string, string> = {
  help: "+",
  bathroom: "WC",
  popsicle: "ICE"
};

export function CommunicationButtonCard({
  button,
  isEditing,
  isFirst,
  isLast,
  onSpeak,
  onEdit,
  onDelete,
  onMove
}: CommunicationButtonCardProps) {
  return (
    <article className="button-tile">
      <button className="speak-card" type="button" onClick={onSpeak} aria-label={`Speak ${button.phrase}`}>
        <span className={`picture-frame placeholder-${button.placeholder ?? "custom"}`}>
          {button.imageDataUrl ? (
            <img src={button.imageDataUrl} alt="" />
          ) : (
            <span className="placeholder-mark" aria-hidden="true">
              {placeholderText[button.placeholder ?? ""] ?? button.label.slice(0, 2).toUpperCase()}
            </span>
          )}
        </span>
        <span className="button-label">{button.label}</span>
        <span className="button-phrase">{button.phrase}</span>
      </button>

      {isEditing ? (
        <div className="edit-controls" aria-label={`${button.label} edit controls`}>
          <button type="button" onClick={onEdit}>
            Edit
          </button>
          <button type="button" onClick={() => onMove("up")} disabled={isFirst}>
            Up
          </button>
          <button type="button" onClick={() => onMove("down")} disabled={isLast}>
            Down
          </button>
          <button className="danger-button" type="button" onClick={onDelete}>
            Delete
          </button>
        </div>
      ) : null}
    </article>
  );
}
