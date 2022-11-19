import NumberType from '.'
import test from 'ava'
import { Exception } from '../../utils/errors'
import { KeyType } from '../../utils/types'
import { silent } from '../../utils/helpers'

test.before(() => silent(true))

test('a simple required number attribute', (t) => {
    const attribute = new NumberType({ fieldName: 'age', gte: 1, lte: 10, required: true })
    attribute.value = 5
    t.is(attribute.error, undefined)
    t.is(attribute.fieldName, 'age')
    t.is(attribute.value, 5)
    t.is(attribute.changed, true)
    t.is(attribute.type, KeyType.NUMBER)
})

test('a simple number attribute', (t) => {
    const attribute = new NumberType({ gte: 1, lte: 10 })
    attribute.value = undefined
    t.is(attribute.error, undefined)
    t.is(attribute.value, undefined)
    t.is(attribute.changed, false)
})

test('a simple number attribute with default', (t) => {
    const attribute = new NumberType({ default: () => 5 })
    attribute.value = undefined
    t.is(attribute.error, undefined)
    t.is(parseInt(`${attribute.value}`), 5)
    t.is(attribute.changed, true)
})

test('input converted to number via transform', (t) => {
    const attribute = new NumberType({ gte: 0, lte: 1, transform: () => Math.random() })
    attribute.value = undefined
    t.is(attribute.error, undefined)
    t.is(attribute.value === undefined, false)
    t.is(attribute.changed, true)
})

test('custom validator fails for a number attribute', (t) => {
    const attribute = new NumberType({ validate: (v) => (v! % 2 ? 'value must be even' : undefined) })
    attribute.value = 3
    t.is(attribute.error instanceof Exception, true)
    t.deepEqual(attribute.error?.issues, [
        {
            message: 'value must be even',
            path: 'value',
        },
    ])
    t.is(!!attribute.value, false)
})


test('cannot assign object to a number attribute', (t) => {
    const attribute = new NumberType({ gte: 1, lte: 10 })
    attribute.value = JSON.parse('{"a":1}')
    t.deepEqual(attribute.error?.issues, [
        {
            expected: 'number',
            message: '"value" is expected to be "number" but received "object"',
            path: 'value',
            received: 'object',
        },
    ])
    t.is(!!attribute.value, false)
})

test('cannot assign above of allowed range value to number attribute', (t) => {
    const attribute = new NumberType({ gte: 5, lte: 10 })
    attribute.value = 15
    t.deepEqual(attribute.error?.issues, [
        {
            expected: '<=10',
            message: '"value" is expected to be "<=10" but received "15"',
            path: 'value',
            received: 15,
        },
    ])
    t.is(!!attribute.value, false)
})

test('cannot assign below of allowed range value to number attribute', (t) => {
    const attribute = new NumberType({ gte: 5, lte: 10 })
    attribute.value = 1
    t.deepEqual(attribute.error?.issues, [
        {
            expected: '>=5',
            message: '"value" is expected to be ">=5" but received "1"',
            path: 'value',
            received: 1,
        },
    ])
    t.is(!!attribute.value, false)
})

test('cannot assign undefined to required number attribute', (t) => {
    const attribute = new NumberType({ gte: 1, lte: 10, required: true })
    attribute.value = undefined
    t.is(attribute.error instanceof Exception, true)
    t.deepEqual(attribute.error?.issues, [
        {
            expected: 'number',
            message: '"value" is expected to be "number" but received "undefined"',
            path: 'value',
            received: 'undefined',
        },
    ])
    t.is(attribute.changed, false)
})

test('cannot assign float to integer attribute', (t) => {
    const attribute = new NumberType({ int: true })
    attribute.value = 1.5
    t.is(attribute.error instanceof Exception, true)
    t.deepEqual(attribute.error?.issues, [
        {
            expected: 'integer',
            message: '"value" is expected to be "integer" but received "float"',
            path: 'value',
            received: 'float',
        },
    ])
    t.is(attribute.changed, false)
})

test('cannot assign integer to float attribute', (t) => {
    const attribute = new NumberType({ float: true })
    attribute.value = 1
    t.is(attribute.error instanceof Exception, true)
    t.deepEqual(attribute.error?.issues, [
        {
            expected: 'float',
            message: '"value" is expected to be "float" but received "integer"',
            path: 'value',
            received: 'integer',
        },
    ])
    t.is(attribute.changed, false)
})
