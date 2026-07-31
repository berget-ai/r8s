import { describe, it, expect } from 'vitest'
import { jsx, Fragment, render, useContext } from '../src/index'
import { createContext } from '../src/context'

// Test contexts
const ThemeContext = createContext<{ mode: string }>({ mode: 'default' })
const CountContext = createContext<number>(0)
const NestedContext = createContext<string>('outer')

// Helper component that reads context and renders a ConfigMap with the value
function ContextReader(props: { label: string }) {
  const theme = useContext(ThemeContext)
  return jsx('ConfigMap', {
    apiVersion: 'v1',
    kind: 'ConfigMap',
    metadata: { name: props.label },
    data: { mode: theme.mode },
  })
}

function CountReader(props: { label: string }) {
  const count = useContext(CountContext)
  return jsx('ConfigMap', {
    apiVersion: 'v1',
    kind: 'ConfigMap',
    metadata: { name: props.label },
    data: { count: String(count) },
  })
}

describe('Context Provider rendering', () => {
  it('should provide context value to children', () => {
    const element = jsx(ThemeContext.Provider, {
      value: { mode: 'dark' },
      children: jsx(ContextReader, { label: 'test' }),
    })

    const result = render(element)

    expect(result.resources).toHaveLength(1)
    expect((result.resources[0] as any).data.mode).toBe('dark')
  })

  it('should use default value when no provider', () => {
    const element = jsx(ContextReader, { label: 'default-test' })

    const result = render(element)

    expect((result.resources[0] as any).data.mode).toBe('default')
  })

  it('should handle multiple children under provider', () => {
    const element = jsx(ThemeContext.Provider, {
      value: { mode: 'blue' },
      children: [
        jsx(ContextReader, { label: 'child1' }),
        jsx(ContextReader, { label: 'child2' }),
        jsx(ContextReader, { label: 'child3' }),
      ],
    })

    const result = render(element)

    expect(result.resources).toHaveLength(3)
    for (const res of result.resources) {
      expect((res as any).data.mode).toBe('blue')
    }
  })

  it('should restore previous context after provider scope ends', () => {
    // Outer provider sets 'outer', inner provider sets 'inner'
    // After inner scope, context should be back to 'outer'
    const element = jsx(ThemeContext.Provider, {
      value: { mode: 'outer' },
      children: jsx(Fragment, {
        children: [
          jsx(ContextReader, { label: 'before' }),
          jsx(ThemeContext.Provider, {
            value: { mode: 'inner' },
            children: jsx(ContextReader, { label: 'inside' }),
          }),
          jsx(ContextReader, { label: 'after' }),
        ],
      }),
    })

    const result = render(element)

    expect(result.resources).toHaveLength(3)
    expect((result.resources[0] as any).data.mode).toBe('outer')
    expect((result.resources[1] as any).data.mode).toBe('inner')
    expect((result.resources[2] as any).data.mode).toBe('outer')
  })

  it('should support deeply nested providers', () => {
    const element = jsx(ThemeContext.Provider, {
      value: { mode: 'level1' },
      children: jsx(ThemeContext.Provider, {
        value: { mode: 'level2' },
        children: jsx(ThemeContext.Provider, {
          value: { mode: 'level3' },
          children: jsx(ContextReader, { label: 'deep' }),
        }),
      }),
    })

    const result = render(element)

    expect((result.resources[0] as any).data.mode).toBe('level3')
  })

  it('should support multiple independent contexts simultaneously', () => {
    const element = jsx(ThemeContext.Provider, {
      value: { mode: 'dark' },
      children: jsx(CountContext.Provider, {
        value: 42,
        children: jsx(Fragment, {
          children: [jsx(ContextReader, { label: 'theme' }), jsx(CountReader, { label: 'count' })],
        }),
      }),
    })

    const result = render(element)

    expect(result.resources).toHaveLength(2)
    expect((result.resources[0] as any).data.mode).toBe('dark')
    expect((result.resources[1] as any).data.count).toBe('42')
  })

  it('should not leak context to siblings', () => {
    const element = jsx(Fragment, {
      children: [
        jsx(ThemeContext.Provider, {
          value: { mode: 'scoped' },
          children: jsx(ContextReader, { label: 'inside-scope' }),
        }),
        jsx(ContextReader, { label: 'outside-scope' }),
      ],
    })

    const result = render(element)

    expect(result.resources).toHaveLength(2)
    expect((result.resources[0] as any).data.mode).toBe('scoped')
    expect((result.resources[1] as any).data.mode).toBe('default')
  })

  it('should clear context stack between renders', () => {
    // First render with provider
    const element1 = jsx(ThemeContext.Provider, {
      value: { mode: 'first' },
      children: jsx(ContextReader, { label: 'first' }),
    })
    render(element1)

    // Second render without provider — should not see 'first'
    const element2 = jsx(ContextReader, { label: 'second' })
    const result = render(element2)

    expect((result.resources[0] as any).data.mode).toBe('default')
  })

  it('should handle undefined as context value', () => {
    const OptionalContext = createContext<string | undefined>('fallback')
    function OptionalReader() {
      const val = useContext(OptionalContext)
      return jsx('ConfigMap', {
        apiVersion: 'v1',
        kind: 'ConfigMap',
        metadata: { name: 'optional' },
        data: { value: val ?? 'fallback' },
      })
    }

    const element = jsx(OptionalContext.Provider, {
      value: undefined,
      children: jsx(OptionalReader, {}),
    })

    const result = render(element)

    expect((result.resources[0] as any).data.value).toBe('fallback')
  })

  it('should handle null as context value', () => {
    const NullableContext = createContext<string | null>('default-val')
    function NullableReader() {
      const val = useContext(NullableContext)
      return jsx('ConfigMap', {
        apiVersion: 'v1',
        kind: 'ConfigMap',
        metadata: { name: 'nullable' },
        data: { value: val === null ? 'was-null' : 'not-null' },
      })
    }

    const element = jsx(NullableContext.Provider, {
      value: null,
      children: jsx(NullableReader, {}),
    })

    const result = render(element)

    expect((result.resources[0] as any).data.value).toBe('was-null')
  })

  it('should support context with operators array value', () => {
    interface FakeOperator {
      name: string
      source: { type: string; url: string }
    }
    const OperatorTestContext = createContext<FakeOperator[]>([])

    const ops: FakeOperator[] = [
      { name: 'test-op', source: { type: 'manifest', url: 'https://example.com/op.yaml' } },
    ]

    const element = jsx(OperatorTestContext.Provider, {
      value: ops,
      children: jsx('ConfigMap', {
        apiVersion: 'v1',
        kind: 'ConfigMap',
        metadata: { name: 'with-ops' },
      }),
    })

    const result = render(element)

    // Operators from context value should be included
    expect(result.operators).toHaveLength(1)
    expect(result.operators[0].name).toBe('test-op')
  })

  it('should override context with inner provider', () => {
    const element = jsx(ThemeContext.Provider, {
      value: { mode: 'outer' },
      children: jsx(Fragment, {
        children: [
          jsx(ContextReader, { label: 'before-inner' }),
          jsx(ThemeContext.Provider, {
            value: { mode: 'inner' },
            children: jsx(ContextReader, { label: 'inner' }),
          }),
        ],
      }),
    })

    const result = render(element)

    expect((result.resources[0] as any).data.mode).toBe('outer')
    expect((result.resources[1] as any).data.mode).toBe('inner')
  })
})
