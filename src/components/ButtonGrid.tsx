import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { arrayMove, rectSortingStrategy, SortableContext, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { CommunicationButtonCard } from "./CommunicationButtonCard";
import type { CommunicationButton } from "../types";

type ButtonGridProps = {
  buttons: CommunicationButton[];
  isEditing: boolean;
  onSpeak: (button: CommunicationButton) => void;
  onEdit: (button: CommunicationButton) => void;
  onDelete: (button: CommunicationButton) => void;
  onMove: (id: string, direction: "up" | "down") => void;
  onReorder: (buttons: CommunicationButton[]) => void;
};

export function ButtonGrid({ buttons, isEditing, onSpeak, onEdit, onDelete, onMove, onReorder }: ButtonGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 160,
        tolerance: 8
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = buttons.findIndex((button) => button.id === active.id);
    const newIndex = buttons.findIndex((button) => button.id === over.id);

    if (oldIndex < 0 || newIndex < 0) {
      return;
    }

    onReorder(arrayMove(buttons, oldIndex, newIndex));
  }

  const grid = (
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

  if (!isEditing) {
    return grid;
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={buttons.map((button) => button.id)} strategy={rectSortingStrategy}>
        {grid}
      </SortableContext>
    </DndContext>
  );
}
