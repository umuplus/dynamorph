import ListType from '.'
import test from 'ava'
import { Exception } from '../../utils/errors'
import { silent } from '../../utils/helpers'

test.before(() => silent(true))

test('a simple required list attribute', (t) => {
    const attribute = new ListType({ fieldName: 'items', min: 1, max: 10, length: 3, required: true })
    attribute.value = ['a', 'b', 'c']
    t.is(attribute.error, undefined)
    t.is(attribute.fieldName, 'items')
    t.deepEqual(attribute.value, ['a', 'b', 'c'])
    t.is(attribute.changed, true)
})

test('a simple list attribute', (t) => {
    const attribute = new ListType({ min: 1, max: 10, length: 3 })
    attribute.value = undefined
    t.is(attribute.error, undefined)
    t.is(attribute.value, undefined)
    t.is(attribute.changed, false)
})

test('a simple list attribute with default', (t) => {
    const attribute = new ListType({ default: () => ['a', 'b', 'c'] })
    attribute.value = undefined
    t.is(attribute.error, undefined)
    t.is(JSON.stringify(attribute.value), '["a","b","c"]')
    t.is(attribute.changed, true)
})

test('input converted to list via transform', (t) => {
    const attribute = new ListType({ transform: (v) => v?.map((k) => k?.toUpperCase() || k) })
    attribute.value = ['a', 'b', 'c']
    t.is(attribute.error, undefined)
    t.deepEqual(attribute.value, ['A', 'B', 'C'])
    t.is(attribute.changed, true)
})

test('custom validator fails for a list attribute', (t) => {
    const attribute = new ListType({ validate: (v) => ((v?.length || 0) % 2 ? 'number of items in the value must be even' : undefined) })
    attribute.value = ['a', 'b', 'c']
    t.is(attribute.error instanceof Exception, true)
    t.deepEqual(attribute.error?.issues, [
        {
            message: 'number of items in the value must be even',
            path: 'value',
        },
    ])
    t.is(!!attribute.value, false)
})

test('cannot assign object to a list attribute', (t) => {
    const attribute = new ListType({})
    attribute.value = JSON.parse('{"a":1}')
    t.deepEqual(attribute.error?.issues, [
        {
            expected: 'array',
            message: '"value" is expected to be "array" but received "object"',
            path: 'value',
            received: 'object',
        },
    ])
    t.is(!!attribute.value, false)
})

test('cannot assign above of allowed range value to list attribute', (t) => {
    const attribute = new ListType({ max: 2 })
    attribute.value = ['a', 'b', 'c', 'd']
    t.deepEqual(attribute.error?.issues, [
        {
            expected: '<=2',
            message: '"length" is expected to be "<=2" but received "4"',
            path: 'length',
            received: 4,
        },
    ])
    t.is(!!attribute.value, false)
})

test('cannot assign below of allowed range value to list attribute', (t) => {
    const attribute = new ListType({ min: 3 })
    attribute.value = ['a']
    t.deepEqual(attribute.error?.issues, [
        {
            expected: '3<=',
            message: '"length" is expected to be "3<=" but received "1"',
            path: 'length',
            received: 1,
        },
    ])
    t.is(!!attribute.value, false)
})

test('cannot assign undefined to required list attribute', (t) => {
    const attribute = new ListType({ required: true })
    attribute.value = undefined
    t.is(attribute.error instanceof Exception, true)
    t.deepEqual(attribute.error?.issues, [
        {
            expected: 'array',
            message: '"value" is expected to be "array" but received "undefined"',
            path: 'value',
            received: 'undefined',
        },
    ])
    t.is(attribute.changed, false)
})
