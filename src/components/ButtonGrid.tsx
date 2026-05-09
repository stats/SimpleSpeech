import { CommunicationButtonCard } from "./CommunicationButtonCard";
import type { CommunicationButton } from "../types";

type ButtonGridProps = {
  buttons: CommunicationButton[];
  isEditing: boolean;
  onSpeak: (button: CommunicationButton) => void;
  onEdit: (button: CommunicationButton) => void;
  onDelete: (button: CommunicationButton) => void;
  onMove: (id: string, direction: "up" | "down") => void;
};

export function ButtonGrid({ buttons, isEditing, onSpeak, onEdit, onDelete, onMove }: ButtonGridProps) {
  return (
    <section className="button-grid" aria-label="Communication buttons">
      {buttons.map((button, index) => (
        <CommunicationButtonCard
          key={button.id}
          button={button}
          isEditing={isEditing}
          isFirst={index === 0}
          isLast={index === buttons.length - 1}
          onSpeak={() => onSpeak(button)}
          onEdit={() => onEdit(button)}
          onDelete={() => onDelete(button)}
          onMove={(direction) => onMove(button.id, direction)}
        />
      ))}
    </section>
  );
}
