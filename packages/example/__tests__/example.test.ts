import { describe, it, expect } from 'vitest'
import { render, jsx } from '@r8s/core'
import { OperatorContext } from '@r8s/core/defaults'
import { Widget, exampleOperator } from '../src/index'

// Every package tests three things:
//   1. The operator declaration (name, source type, pinned version)
//   2. Rendering with defaults and with all props set
//   3. Operator deduplication via OperatorContext

describe('exampleOperator', () => {
  it('should declare the operator with a pinned default version', () => {
    const op = exampleOperator()
    expect(op.name).toBe('example-operator')
    expect(op.source.type).toBe('helm')
    expect(op.version).toBe('1.0.0')
  })

  it('should allow overriding the version', () => {
    expect(exampleOperator('2.1.0').version).toBe('2.1.0')
  })
})

describe('Widget', () => {
  it('should render a Widget resource with defaults', () => {
    const result = render(jsx(Widget, { name: 'my-widget' }))

    const widget = result.resources.find((r) => r.kind === 'Widget')
    expect(widget).toBeDefined()
    expect(widget?.apiVersion).toBe('example.com/v1')
    expect(widget?.metadata.name).toBe('my-widget')
    expect(widget?.metadata.namespace).toBe('default')
    expect((widget as any).spec.replicas).toBe(1)
  })

  it('should render with all props set', () => {
    const result = render(jsx(Widget, { name: 'w', namespace: 'production', replicas: 3 }))
    const widget = result.resources.find((r) => r.kind === 'Widget') as any
    expect(widget.metadata.namespace).toBe('production')
    expect(widget.spec.replicas).toBe(3)
  })

  it('should declare its operator dependency', () => {
    const result = render(jsx(Widget, { name: 'my-widget' }))
    expect(result.operators).toHaveLength(1)
    expect(result.operators[0].name).toBe('example-operator')
  })

  it('should not re-declare the operator when provided via context', () => {
    const result = render(
      jsx(OperatorContext.Provider, {
        value: [exampleOperator()],
        children: jsx(Widget, { name: 'my-widget' }),
      })
    )
    expect(result.operators).toHaveLength(1)
  })
})
