import { AsyncLocalStorage } from "node:async_hooks";

/** Transitional dispatch context; owned factories, rather than this adapter, implement features. */
export interface ActivationScope {
  readonly active: boolean;
  run<T>(work: () => T): T;
  bind<T extends (...args: never[]) => unknown>(work: T): T;
  read<T>(key: symbol): T | undefined;
  write<T>(key: symbol, value: T): void;
  remove(key: symbol): void;
  dispose(): void;
}
const context = new AsyncLocalStorage<ActivationScope>();
let defaultOwner: { scope: ActivationScope; invalidate: () => void } | undefined;

export function scopedActivation(): ActivationScope | undefined {
  return context.getStore();
}
export function activationScope(): ActivationScope | undefined {
  // A present but disposed/missing owner must never borrow the legacy default.
  return scopedActivation() ?? defaultOwner?.scope;
}
export function createActivationScope(): ActivationScope {
  const slots = new Map<symbol, unknown>();
  let active = true;
  const scope: ActivationScope = {
    get active() {
      return active;
    },
    run(work) {
      return context.run(scope, work);
    },
    bind(work) {
      return function (this: unknown, ...args: unknown[]) {
        return scope.run(() => Reflect.apply(work, this, args));
      } as typeof work;
    },
    read<T>(key: symbol) {
      return active ? (slots.get(key) as T | undefined) : undefined;
    },
    write(key, value) {
      if (!active) throw new Error("The Villages activation is inactive.");
      slots.set(key, value);
    },
    remove(key) {
      slots.delete(key);
    },
    dispose() {
      active = false;
      slots.clear();
    },
  };
  return scope;
}

/** Direct configuration selects one legacy host; production activations use explicit scopes. */
export function installDefaultActivation(scope: ActivationScope, invalidate: () => void): () => void {
  defaultOwner?.invalidate();
  const registration = { scope, invalidate };
  defaultOwner = registration;
  return () => {
    if (defaultOwner === registration) defaultOwner = undefined;
  };
}

export function bindActivationService<T extends object>(service: T): T {
  const scope = activationScope();
  if (!scope) return service;
  const methods = new WeakMap<(...args: never[]) => unknown, (...args: never[]) => unknown>();
  return new Proxy(service, {
    get(target, key, receiver) {
      const value = scope.run(() => Reflect.get(target, key, receiver));
      if (typeof value !== "function") return value;
      const callable = value as (...args: never[]) => unknown;
      let bound = methods.get(callable);
      if (!bound) {
        bound = scope.bind(callable);
        methods.set(callable, bound);
      }
      return bound;
    },
  });
}

/** Each registration gets its own token, including repeated use of the same service object. */
export function createActivationBinding<T>(unavailable: string) {
  const key = Symbol(unavailable);
  type Registration = { value: T };
  let legacy: Registration | undefined;
  function maybe(): T | undefined {
    const scope = activationScope();
    return (scope ? scope.read<Registration>(key) : legacy)?.value;
  }
  return {
    maybe,
    get(): T {
      const value = maybe();
      if (value === undefined) throw new Error(unavailable);
      return value;
    },
    configure(value: T): () => void {
      const scope = activationScope();
      const registration = { value };
      if (scope) scope.write(key, registration);
      else legacy = registration;
      return () => {
        if (scope) {
          if (scope.read<Registration>(key) === registration) scope.remove(key);
        } else if (legacy === registration) legacy = undefined;
      };
    },
  };
}
