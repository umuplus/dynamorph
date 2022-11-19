import StringSetType from '.'
import test from 'ava'
import { ComplexAttributeType } from '../../utils/types'
import { Exception } from '../../utils/errors'
import { silent } from '../../utils/helpers'

test.before(() => silent(true))

test('a simple required string set attribute', (t) => {
    const attribute = new StringSetType({ fieldName: 'items', min: 1, max: 10, size: 3, required: true })
    attribute.value = new Set(['a', 'b', 'c'])
    t.is(attribute.error, undefined)
    t.is(attribute.fieldName, 'items')
    t.deepEqual(attribute.value, new Set(['a', 'b', 'c']))
    t.deepEqual(attribute.plain, ['a', 'b', 'c'])
    t.is(attribute.changed, true)
    t.is(!!attribute.ignore, false)
    t.is(attribute.type, ComplexAttributeType.STRING_SET)
})

test('a simple string set attribute', (t) => {
    const attribute = new StringSetType({ min: 1, max: 10, size: 3 })
    attribute.value = undefined
    t.is(attribute.error, undefined)
    t.is(attribute.value, undefined)
    t.is(attribute.changed, false)
})

test('a simple string set attribute with default', (t) => {
    const attribute = new StringSetType({ default: () => new Set(['a', 'b', 'c']) })
    attribute.value = undefined
    t.is(attribute.error, undefined)
    t.is(JSON.stringify(attribute.plain), '["a","b","c"]')
    t.is(attribute.changed, true)
})

test('input converted to string set via transform', (t) => {
    const attribute = new StringSetType({ transform: (v) => new Set(Array.from(v!).map((k) => k.toUpperCase())) })
    attribute.value = new Set(['a', 'b', 'c'])
    t.is(attribute.error, undefined)
    t.deepEqual(attribute.plain, ['A', 'B', 'C'])
    t.is(attribute.changed, true)
})

test('custom validator fails for a string set attribute', (t) => {
    const attribute = new StringSetType({ validate: (v) => ((v?.size || 0) % 2 ? 'number of items in the value must be even' : undefined) })
    attribute.value = new Set(['a', 'b', 'c'])
    t.is(attribute.error instanceof Exception, true)
    t.deepEqual(attribute.error?.issues, [
        {
            message: 'number of items in the value must be even',
            path: 'value',
        },
    ])
    t.is(!!attribute.value, false)
})

test('cannot assign object to a string set attribute', (t) => {
    const attribute = new StringSetType({})
    attribute.value = JSON.parse('{"a":1}')
    t.deepEqual(attribute.error?.issues, [
        {
            expected: 'Set<string>',
            message: '"value" is expected to be "Set<string>" but received "object"',
            path: 'value',
            received: 'object',
        },
    ])
    t.is(!!attribute.value, false)
})

test('cannot assign above of allowed range value to string set attribute', (t) => {
    const attribute = new StringSetType({ max: 2 })
    attribute.value = new Set(['a', 'b', 'c', 'd'])
    t.deepEqual(attribute.error?.issues, [
        {
            expected: '<=2',
            message: '"size" is expected to be "<=2" but received "4"',
            path: 'size',
            received: 4,
        },
    ])
    t.is(!!attribute.value, false)
})

test('cannot assign below of allowed range value to string set attribute', (t) => {
    const attribute = new StringSetType({ min: 3 })
    attribute.value = new Set(['a'])
    t.deepEqual(attribute.error?.issues, [
        {
            expected: '3<=',
            message: '"size" is expected to be "3<=" but received "1"',
            path: 'size',
            received: 1,
        },
    ])
    t.is(!!attribute.value, false)
})

test('cannot assign undefined to required string set attribute', (t) => {
    const attribute = new StringSetType({ required: true })
    attribute.value = undefined
    t.is(attribute.error instanceof Exception, true)
    t.deepEqual(attribute.error?.issues, [
        {
            expected: 'Set<string>',
            message: '"value" is expected to be "Set<string>" but received "undefined"',
            path: 'value',
            received: 'undefined',
        },
    ])
    t.is(attribute.changed, false)
})
