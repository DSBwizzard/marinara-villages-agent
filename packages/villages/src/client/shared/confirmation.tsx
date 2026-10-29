import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ModalDialog } from "./ModalDialog.js";

type Owner = { active: boolean };
type Choices = { cancel: string; confirm: string };
type Confirmation = { message: string; choices?: Choices; owner: Owner; finish(value: boolean): void };
type Service = {
  request(message: string, owner: Owner, choices?: Choices): Promise<boolean>;
  cancel(owner: Owner): void;
};
const ConfirmationContext = createContext<Service | null>(null);

/** Cancels an unanswered decision when its caller or semantic subject changes. */
export function useConfirmation(scope?: unknown): (message: string, choices?: Choices) => Promise<boolean> {
  const service = useContext(ConfirmationContext);
  if (!service) throw new Error("Villages confirmation provider is unavailable.");
  const owner = useMemo(() => ({ active: true, scope }), [scope]);
  useLayoutEffect(() => {
    owner.active = true;
    return () => {
      owner.active = false;
      service.cancel(owner);
    };
  }, [service, owner]);
  return useCallback(
    (message: string, choices?: Choices) => service.request(message, owner, choices),
    [service, owner],
  );
}

/** Decisions belong to this interface instance and cancel when it is disposed. */
export function ConfirmationProvider({ children }: { children: ReactNode }) {
  const queue = useRef<Confirmation[]>([]);
  const active = useRef(true);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const service = useMemo<Service>(
    () => ({
      request: (message, owner, choices) =>
        new Promise((finish) => {
          if (!active.current || !owner.active) {
            finish(false);
            return;
          }
          const entry = { message, owner, finish, choices };
          queue.current.push(entry);
          if (queue.current.length === 1) setConfirmation(entry);
        }),
      cancel: (owner) => {
        const removed = queue.current.filter((entry) => entry.owner === owner);
        queue.current = queue.current.filter((entry) => entry.owner !== owner);
        removed.forEach((entry) => entry.finish(false));
        if (active.current && removed.length) setConfirmation(queue.current[0] ?? null);
      },
    }),
    [],
  );
  useLayoutEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      queue.current.splice(0).forEach((entry) => entry.finish(false));
    };
  }, []);
  const decide = (value: boolean) => {
    if (!confirmation || queue.current[0] !== confirmation) return;
    queue.current.shift();
    confirmation.finish(value && confirmation.owner.active);
    setConfirmation(queue.current[0] ?? null);
  };
  return (
    <ConfirmationContext.Provider value={service}>
      {children}
      {confirmation ? (
        <ModalDialog title="Confirm" compact onClose={() => decide(false)}>
          <p>{confirmation.message}</p>
          <div className="villages-zone-map-actions">
            <button type="button" autoFocus onClick={() => decide(false)}>
              {confirmation.choices?.cancel ?? "Cancel"}
            </button>
            <button type="button" onClick={() => decide(true)}>
              {confirmation.choices?.confirm ?? "Continue"}
            </button>
          </div>
        </ModalDialog>
      ) : null}
    </ConfirmationContext.Provider>
  );
}
