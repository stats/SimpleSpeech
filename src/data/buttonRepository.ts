import { db } from "./db";
import type { CommunicationButton } from "../types";

const starterButtons: Array<Pick<CommunicationButton, "label" | "phrase" | "placeholder">> = [
  {
    label: "Help",
    phrase: "I need help",
    placeholder: "help"
  },
  {
    label: "Bathroom",
    phrase: "I need to go to the bathroom",
    placeholder: "bathroom"
  },
  {
    label: "Popsicle",
    phrase: "I would like a popsicle",
    placeholder: "popsicle"
  }
];

function createId() {
  return crypto.randomUUID();
}

function nowIso() {
  return new Date().toISOString();
}

export async function seedButtonsIfEmpty() {
  const count = await db.buttons.count();

  if (count > 0) {
    return;
  }

  const createdAt = nowIso();
  await db.buttons.bulkAdd(
    starterButtons.map((button, index) => ({
      id: createId(),
      label: button.label,
      phrase: button.phrase,
      placeholder: button.placeholder,
      sortOrder: index,
      createdAt,
      updatedAt: createdAt
    }))
  );
}

export async function getButtons() {
  await seedButtonsIfEmpty();
  return db.buttons.orderBy("sortOrder").toArray();
}

export async function saveButton(
  button: Omit<CommunicationButton, "id" | "sortOrder" | "createdAt" | "updatedAt">,
  existing?: CommunicationButton
) {
  const timestamp = nowIso();

  if (existing) {
    const updated: CommunicationButton = {
      ...existing,
      ...button,
      placeholder: button.imageDataUrl ? undefined : button.placeholder,
      updatedAt: timestamp
    };
    await db.buttons.put(updated);
    return updated;
  }

  const count = await db.buttons.count();
  const created: CommunicationButton = {
    ...button,
    id: createId(),
    sortOrder: count,
    createdAt: timestamp,
    updatedAt: timestamp
  };
  await db.buttons.add(created);
  return created;
}

export async function deleteButton(id: string) {
  await db.buttons.delete(id);
  await normalizeSortOrder();
}

export async function replaceAllButtons(buttons: CommunicationButton[]) {
  await db.transaction("rw", db.buttons, async () => {
    await db.buttons.clear();
    await db.buttons.bulkAdd(
      buttons
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((button, index) => ({
          ...button,
          id: button.id || createId(),
          sortOrder: index,
          updatedAt: nowIso()
        }))
    );
  });
}

export async function reorderButtons(buttons: CommunicationButton[]) {
  const timestamp = nowIso();

  await db.transaction("rw", db.buttons, async () => {
    await Promise.all(
      buttons.map((button, sortOrder) =>
        db.buttons.update(button.id, {
          sortOrder,
          updatedAt: timestamp
        })
      )
    );
  });
}

export async function moveButton(id: string, direction: "up" | "down") {
  const buttons = await getButtons();
  const index = buttons.findIndex((button) => button.id === id);
  const targetIndex = direction === "up" ? index - 1 : index + 1;

  if (index < 0 || targetIndex < 0 || targetIndex >= buttons.length) {
    return;
  }

  const reordered = buttons.slice();
  const [button] = reordered.splice(index, 1);
  reordered.splice(targetIndex, 0, button);

  await reorderButtons(reordered);
}

async function normalizeSortOrder() {
  const buttons = await db.buttons.orderBy("sortOrder").toArray();
  await db.transaction("rw", db.buttons, async () => {
    await Promise.all(buttons.map((button, index) => db.buttons.update(button.id, { sortOrder: index })));
  });
}
