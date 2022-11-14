import MapType from '.'
import test from 'ava'
import { Exception } from '../../utils/errors'
import { silent } from '../../utils/helpers'

test.before(() => silent(true))

test('a simple required map attribute', (t) => {
    const attribute = new MapType({ fieldName: 'items', required: true })
    attribute.value = { a: 1, b: 2 }
    t.is(attribute.error, undefined)
    t.is(attribute.fieldName, 'items')
    t.deepEqual(attribute.value, { a: 1, b: 2 })
    t.is(attribute.changed, true)
})

test('a simple map attribute', (t) => {
    const attribute = new MapType({})
    attribute.value = undefined
    t.is(attribute.error, undefined)
    t.is(attribute.value, undefined)
    t.is(attribute.changed, false)
})

test('a simple map attribute with default', (t) => {
    const attribute = new MapType({ default: () => ({ a: 1, b: 2 }) })
    attribute.value = undefined
    t.is(attribute.error, undefined)
    t.is(JSON.stringify(attribute.value), '{"a":1,"b":2}')
    t.is(attribute.changed, true)
})

test('custom validator fails for a map attribute', (t) => {
    const attribute = new MapType({ validate: (v) => (v?.a === undefined ? 'a cannot be undefined' : undefined) })
    attribute.value = { b: 1 }
    t.is(attribute.error instanceof Exception, true)
    t.deepEqual(attribute.error?.issues, [
        {
            message: 'a cannot be undefined',
            path: 'value',
        },
    ])
    t.is(!!attribute.value, false)
})

test('cannot assign array to a map attribute', (t) => {
    const attribute = new MapType({})
    attribute.value = JSON.parse('[1,2,3]')
    t.deepEqual(attribute.error?.issues, [
        {
            expected: 'object',
            message: '"value" is expected to be "object" but received "array"',
            path: 'value',
            received: 'array',
        },
    ])
    t.is(!!attribute.value, false)
})

test('cannot assign date to a map attribute', (t) => {
    const attribute = new MapType({})
    attribute.value = new Date()
    t.deepEqual(attribute.error?.issues, [
        {
            expected: 'object',
            message: '"value" is expected to be "object" but received "date"',
            path: 'value',
            received: 'date',
        },
    ])
    t.is(!!attribute.value, false)
})
