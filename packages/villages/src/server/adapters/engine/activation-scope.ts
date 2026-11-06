import { AsyncLocalStorage } from "node:async_hooks";

/** Explicit activation context for host dispatch and owned service registrations. */
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

export function activationScope(): ActivationScope | undefined {
  return context.getStore();
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
  function maybe(): T | undefined {
    return activationScope()?.read<Registration>(key)?.value;
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
      if (!scope) throw new Error("An explicit Villages activation is required.");
      const registration = { value };
      scope.write(key, registration);
      return () => {
        if (scope.read<Registration>(key) === registration) scope.remove(key);
      };
    },
  };
}
