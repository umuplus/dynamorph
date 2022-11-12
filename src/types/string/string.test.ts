import test from 'ava'
import { Exception } from '../../utils/errors'
import { silent } from '../../utils/helpers'
import { StringMode, StringType } from '.'

test.before(() => silent(true))

test('a simple string attribute', (t) => {
    const attribute = new StringType({
        fieldName: '_ID',
        min: 1,
        max: 10,
        required: true,
        partitionKey: true,
    })
    attribute.value = 'test1'
    t.is(attribute.fieldName, '_ID')
    t.is(attribute.value, 'test1')
    t.is(attribute.changed, true)
})

test('an email attribute', (t) => {
    const attribute = new StringType({
        min: 1,
        max: 10,
        required: true,
        mode: StringMode.EMAIL,
        partitionKey: true,
    })
    attribute.value = 'test1@t.co'
    t.is(attribute.value, 'test1@t.co')
    t.is(attribute.changed, true)
})

test('transform can overwrites the value of a string attribute', (t) => {
    const attribute = new StringType({
        min: 1,
        max: 10,
        required: true,
        transform: (v) => v?.toUpperCase(),
    })
    attribute.value = 'test1'
    t.is(attribute.value, 'TEST1')
    t.is(attribute.changed, true)
})

test('custom validator fails for a string attribute', (t) => {
    const attribute = new StringType({ validate: (v) => (v?.includes('forbidden') ? 'value cannot contain forbidden' : undefined) })
    attribute.value = 'This is a forbidden document'
    t.is(attribute.error instanceof Exception, true)
    t.deepEqual(attribute.error?.issues, [
        {
            message: 'value cannot contain forbidden',
            path: 'value',
        },
    ])
    t.is(!!attribute.value, false)
})

test('cannot assign out of range value to a string attribute', (t) => {
    const attribute = new StringType({
        min: 1,
        max: 3,
        length: 2,
        required: true,
    })
    attribute.value = 'test1'
    t.is(attribute.error instanceof Exception, true)
    t.deepEqual(attribute.error?.issues, [
        {
            expected: '<=3',
            message: '"length" is expected to be "<=3" but received "5"',
            path: 'length',
            received: 5,
        },
        {
            expected: 2,
            message: '"length" is expected to be "2" but received "5"',
            path: 'length',
            received: 5,
        },
    ])
    t.is(attribute.changed, false)
})

test('a simply formatted string attribute', (t) => {
    const data = { userId: Math.random().toString().split('.').pop(), addressId: Math.random().toString().split('.').pop() }
    const attribute = new StringType({
        format: '{userId}#USR_ADR#{addressId}',
        min: 1,
        max: 250,
        required: true,
        partitionKey: true,
    })
    attribute.value = data
    t.is(attribute.format, '{userId}#USR_ADR#{addressId}')
    t.deepEqual(attribute.compositeAttributes, ['userId', 'addressId'])
    t.is(attribute.value, `${data.userId}#USR_ADR#${data.addressId}`)
    t.is(attribute.changed, true)
})

test('cannot assign string to formatted string attribute', (t) => {
    const attribute = new StringType({
        format: '{userId}#USR_ADR#{addressId}',
        min: 1,
        max: 250,
    })
    attribute.value = 'test1'
    t.is(attribute.error instanceof Exception, true)
    t.deepEqual(attribute.error?.issues, [
        {
            expected: 'object',
            message: '"value" must be an "object" when there is a "format"',
            path: 'value',
            received: 'string',
        },
    ])
    t.is(attribute.changed, false)
})

test('cannot assign object to non-formatted string attribute', (t) => {
    const data = { userId: Math.random().toString().split('.').pop(), addressId: Math.random().toString().split('.').pop() }
    const attribute = new StringType({
        min: 1,
        max: 250,
    })
    attribute.value = data
    t.is(attribute.error instanceof Exception, true)
    t.deepEqual(attribute.error?.issues, [
        {
            expected: 'string',
            message: '"value" must be a "string" when there is no "format"',
            path: 'value',
            received: 'object',
        },
    ])
    t.is(attribute.changed, false)
})

test('cannot assign undefined to required string attribute', (t) => {
    const attribute = new StringType({ required: true })
    attribute.value = undefined
    t.is(attribute.error instanceof Exception, true)
    t.deepEqual(attribute.error?.issues, [
        {
            expected: 'string',
            message: '"value" is expected to be "string" but received "undefined"',
            path: 'value',
            received: 'undefined',
        },
    ])
    t.is(attribute.changed, false)
})
