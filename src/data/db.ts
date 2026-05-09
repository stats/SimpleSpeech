import Dexie, { type Table } from "dexie";
import type { CommunicationButton } from "../types";

class SimpleSpeechDatabase extends Dexie {
  buttons!: Table<CommunicationButton, string>;

  constructor() {
    super("SimpleSpeechDatabase");
    this.version(1).stores({
      buttons: "id, sortOrder, updatedAt"
    });
  }
}

export const db = new SimpleSpeechDatabase();
