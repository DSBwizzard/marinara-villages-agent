/** Device-local draft storage. Artwork needs IndexedDB, not localStorage's small quota. */
export type SavedFoundingDraft<T> = { version: 2; revision: number; savedAt: string; data: T };
const DATABASE = "villages-founding-v2";
const STORE = "drafts";
let connection: Promise<IDBDatabase> | undefined;
function database(): Promise<IDBDatabase> {
  return (connection ??= new Promise((resolve, reject) => {
    const open = indexedDB.open(DATABASE, 1);
    open.onupgradeneeded = () => open.result.createObjectStore(STORE);
    open.onsuccess = () => {
      open.result.onversionchange = () => {
        open.result.close();
        connection = undefined;
      };
      resolve(open.result);
    };
    open.onerror = () => {
      connection = undefined;
      reject(open.error);
    };
    open.onblocked = () => {
      connection = undefined;
      reject(new Error("Close another Villages tab to enable draft saving."));
    };
  }));
}
export async function readFoundingDraft<T>(key: string): Promise<SavedFoundingDraft<T> | null> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE).objectStore(STORE).get(key);
    request.onsuccess = () => resolve(request.result?.version === 2 ? request.result : null);
    request.onerror = () => reject(request.error);
  });
}
/** Compare-and-save keeps another tab's newer draft from being silently overwritten. */
export async function saveFoundingDraft<T>(
  key: string,
  data: T,
  expectedRevision: number,
): Promise<SavedFoundingDraft<T>> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, "readwrite");
    const store = transaction.objectStore(STORE);
    let result: SavedFoundingDraft<T>;
    let conflict = false;
    const read = store.get(key);
    read.onsuccess = () => {
      if ((read.result?.revision ?? 0) !== expectedRevision) {
        conflict = true;
        transaction.abort();
        return;
      }
      result = { version: 2, revision: expectedRevision + 1, savedAt: new Date().toISOString(), data };
      try {
        store.put(result, key);
      } catch (error) {
        reject(error);
        transaction.abort();
      }
    };
    transaction.oncomplete = () => resolve(result);
    transaction.onabort = transaction.onerror = () =>
      reject(
        conflict
          ? new Error("This draft changed in another tab. Reload to resume the latest saved draft.")
          : (transaction.error ?? new Error("Draft could not be saved. Keep this tab open and try again.")),
      );
  });
}
export async function removeFoundingDraft(key: string): Promise<void> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, "readwrite");
    transaction.objectStore(STORE).delete(key);
    transaction.oncomplete = () => resolve();
    transaction.onabort = transaction.onerror = () => reject(transaction.error);
  });
}
export function evenlySpacedFoundingPins(count: number): { x: number; y: number }[] {
  if (!Number.isInteger(count) || count < 3 || count > 5) throw new Error("Choose one to three founding villagers.");
  return Array.from({ length: count }, (_, index) => ({
    x: 0.22 + (index % (count === 5 ? 3 : 2)) * (count === 5 ? 0.28 : 0.56),
    y: index < (count === 5 ? 3 : 2) ? 0.28 : 0.72,
  }));
}
