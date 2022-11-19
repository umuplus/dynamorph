import BooleanType from '.'
import test from 'ava'
import { silent } from '../../utils/helpers'
import { Exception } from '../../utils/errors'

test.before(() => silent(true))

test('a simple required boolean attribute', (t) => {
    const attribute = new BooleanType({ fieldName: 'isOK', required: true })
    attribute.value = true
    t.is(attribute.error, undefined)
    t.is(attribute.value, true)
    t.is(attribute.changed, true)
    t.is(attribute.fieldName, 'isOK')
    t.is(attribute.type, 'Boolean')
})

test('a simple boolean attribute', (t) => {
    const attribute = new BooleanType({})
    attribute.value = undefined
    t.is(attribute.error, undefined)
    t.is(attribute.value, undefined)
    t.is(attribute.changed, false)
})

test('a simple boolean attribute with default', (t) => {
    const attribute = new BooleanType({ default: () => true })
    attribute.value = undefined
    t.is(attribute.error, undefined)
    t.is(!!attribute.value, true)
    t.is(attribute.changed, true)
})

test('input converted to boolean via transform', (t) => {
    const attribute = new BooleanType({ transform: (v) => !v })
    attribute.value = undefined
    t.is(attribute.error, undefined)
    t.is(attribute.value === true, true)
    t.is(attribute.changed, true)
})

test('cannot assign undefined to a required boolean attribute', (t) => {
    const attribute = new BooleanType({ required: true })
    attribute.value = undefined
    t.is(attribute.error instanceof Exception, true)
    t.deepEqual(attribute.error?.issues, [
        {
            expected: 'boolean',
            message: '"value" is expected to be "boolean" but received "undefined"',
            path: 'value',
            received: 'undefined',
        },
    ])
    t.is(!!attribute.value, false)
})

test('cannot assign an object to boolean attribute', (t) => {
    const attribute = new BooleanType({ required: true })
    attribute.value = JSON.parse('{"a":1}')
    attribute.value = undefined
    t.is(attribute.error instanceof Exception, true)
    t.deepEqual(attribute.error?.issues, [
        {
            expected: 'boolean',
            message: '"value" is expected to be "boolean" but received "object"',
            path: 'value',
            received: 'object',
        },
        {
            expected: 'boolean',
            message: '"value" is expected to be "boolean" but received "undefined"',
            path: 'value',
            received: 'undefined',
        },
    ])
    t.is(!!attribute.value, false)
})

test('a boolean attribute cannot be marked as partition key or sort key', (t) => {
    const attribute = new BooleanType({ partitionKey: true, sortKey: true })
    attribute.value = true
    t.is(attribute.error instanceof Exception, true)
    t.deepEqual(attribute.error?.issues, [
        {
            expected: 'string|number',
            message: 'Partition key cannot be a boolean',
            path: 'PartitionKey',
            received: 'boolean',
        },
        {
            expected: 'string|number',
            message: 'Sort key cannot be a boolean',
            path: 'SortKey',
            received: 'boolean',
        },
    ])
    t.is(!!attribute.value, false)
})

test('custom validator fails for a boolean attribute', (t) => {
    const attribute = new BooleanType({ validate: (v) => (!v ? 'value must be true' : undefined) })
    attribute.value = false
    t.is(attribute.error instanceof Exception, true)
    t.deepEqual(attribute.error?.issues, [
        {
            message: 'value must be true',
            path: 'value',
        },
    ])
    t.is(!!attribute.value, false)
})
