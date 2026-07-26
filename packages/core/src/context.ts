// Context stack — shared across all context operations.
// Uses a Symbol.for() key on globalThis so that createContext and useContext
// reference the same Map even when @r8s/core and @r8s/core/defaults are
// bundled as separate module instances by esbuild.
const CONTEXT_STACK_KEY = Symbol.for('r8s.contextStack');
const contextStack: Map<symbol, unknown> = (globalThis as any)[CONTEXT_STACK_KEY] ??= new Map();

export interface Context<T> {
  Provider: (props: { value: T; children?: unknown }) => unknown;
  _defaultValue: T;
  _contextId: symbol;
}

export function createContext<T>(defaultValue: T): Context<T> {
  const contextId = Symbol('r8s.context');

  return {
    Provider: ({ value, children }: { value: T; children?: unknown }) => {
      return {
        type: Symbol.for('r8s.context.provider'),
        props: { contextId, value, children },
        key: null,
      };
    },
    _defaultValue: defaultValue,
    _contextId: contextId,
  };
}

export function getContextValue<T>(context: Context<T>): T {
  if (contextStack.has(context._contextId)) {
    return contextStack.get(context._contextId) as T;
  }
  return context._defaultValue;
}

export function pushContextValue<T>(context: Context<T>, value: T): void {
  contextStack.set(context._contextId, value);
}

export function setContextValue<T>(contextId: symbol, value: T): void {
  contextStack.set(contextId, value);
}

export function hasContextValue(contextId: symbol): boolean {
  return contextStack.has(contextId);
}

export function getContextValueById<T>(contextId: symbol): T | undefined {
  return contextStack.get(contextId) as T | undefined;
}

export function restoreContextValue(contextId: symbol, hadPrevious: boolean, previousValue: unknown): void {
  if (hadPrevious) {
    contextStack.set(contextId, previousValue);
  } else {
    contextStack.delete(contextId);
  }
}

export function clearContextStack(): void {
  contextStack.clear();
}
