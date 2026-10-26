/** Device-local draft storage. Artwork needs IndexedDB, not localStorage's small quota. */
export type SavedDeviceDraft<T> = { version: 4; revision: number; savedAt: string; data: T };
const DATABASE = "villages-drafts-v4";
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
export async function readDeviceDraft<T>(key: string): Promise<SavedDeviceDraft<T> | null> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE).objectStore(STORE).get(key);
    request.onsuccess = () => resolve(request.result?.version === 4 ? request.result : null);
    request.onerror = () => reject(request.error);
  });
}
/** Compare-and-save keeps another tab's newer draft from being silently overwritten. */
export async function saveDeviceDraft<T>(key: string, data: T, expectedRevision: number): Promise<SavedDeviceDraft<T>> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, "readwrite");
    const store = transaction.objectStore(STORE);
    let result: SavedDeviceDraft<T>;
    let conflict = false;
    const read = store.get(key);
    read.onsuccess = () => {
      if ((read.result?.revision ?? 0) !== expectedRevision) {
        conflict = true;
        transaction.abort();
        return;
      }
      result = { version: 4, revision: expectedRevision + 1, savedAt: new Date().toISOString(), data };
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
export async function removeDeviceDraft(key: string): Promise<void> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, "readwrite");
    transaction.objectStore(STORE).delete(key);
    transaction.oncomplete = () => resolve();
    transaction.onabort = transaction.onerror = () => reject(transaction.error);
  });
}
