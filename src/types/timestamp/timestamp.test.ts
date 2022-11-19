import test from 'ava'
import TimestampType, { TimestampMode, TimestampOn } from '.'
import { CustomAttributeType } from '../../utils/types'
import { Exception } from '../../utils/errors'
import { silent } from '../../utils/helpers'

test.before(() => silent(true))

test('a simple required iso string createdAt attribute', (t) => {
    const now = new Date().toISOString().split('T').shift()
    const attribute = new TimestampType({
        fieldName: 'createdAt',
        on: TimestampOn.CREATE,
        mode: TimestampMode.ISO_STRING,
    })
    t.is(attribute.error, undefined)
    t.is(attribute.value?.toString().startsWith(now!), true)
    t.is(attribute.changed, true)
    t.is(attribute.fieldName, 'createdAt')
    t.is(attribute.type, CustomAttributeType.TIMESTAMP)
})

test('a simple required iso string updatedAt attribute', (t) => {
    const now = new Date().toISOString().split('T').shift()
    const attribute = new TimestampType({
        fieldName: 'updatedAt',
        on: TimestampOn.UPDATE,
        mode: TimestampMode.ISO_STRING,
    })
    attribute.value = now
    t.is(attribute.error, undefined)
    t.is(attribute.value, now)
    t.is(attribute.changed, true)
    t.is(attribute.fieldName, 'updatedAt')
})

test('a simple required iso string deletedAt attribute', (t) => {
    const now = new Date().toISOString().split('T').shift()
    const attribute = new TimestampType({
        fieldName: 'deletedAt',
        on: TimestampOn.DELETE,
        mode: TimestampMode.ISO_STRING,
    })
    attribute.value = now
    t.is(attribute.error, undefined)
    t.is(attribute.value, now)
    t.is(attribute.changed, true)
    t.is(attribute.fieldName, 'deletedAt')
})

test('a simple required milliseconds createdAt attribute', (t) => {
    const now = Date.now().toString().substring(0, 10)
    const attribute = new TimestampType({
        fieldName: 'createdAt',
        on: TimestampOn.CREATE,
        mode: TimestampMode.MILLISECONDS,
    })
    t.is(attribute.error, undefined)
    t.is(attribute.value?.toString().startsWith(now!), true)
    t.is(attribute.changed, true)
    t.is(attribute.fieldName, 'createdAt')
})

test('a simple required milliseconds updatedAt attribute', (t) => {
    const now = Date.now()
    const attribute = new TimestampType({
        fieldName: 'updatedAt',
        on: TimestampOn.UPDATE,
        mode: TimestampMode.MILLISECONDS,
    })
    attribute.value = now
    t.is(attribute.error, undefined)
    t.is(attribute.value, now)
    t.is(attribute.date()?.getTime(), now)
    t.is(attribute.changed, true)
    t.is(attribute.fieldName, 'updatedAt')
})

test('a simple required milliseconds deletedAt attribute', (t) => {
    const now = Date.now()
    const attribute = new TimestampType({
        fieldName: 'deletedAt',
        on: TimestampOn.DELETE,
        mode: TimestampMode.MILLISECONDS,
    })
    attribute.value = now
    t.is(attribute.error, undefined)
    t.is(attribute.value, now)
    t.is(attribute.changed, true)
    t.is(attribute.fieldName, 'deletedAt')
})

test('a simple required seconds createdAt attribute', (t) => {
    const now = Math.floor(Date.now() / 1000)
        .toString()
        .substring(0, 10)
    const attribute = new TimestampType({ fieldName: 'createdAt', on: TimestampOn.CREATE, mode: TimestampMode.SECONDS })
    t.is(attribute.error, undefined)
    t.is(attribute.value?.toString().startsWith(now!), true)
    t.is(attribute.changed, true)
    t.is(attribute.fieldName, 'createdAt')
})

test('a simple required seconds updatedAt attribute', (t) => {
    const now = Math.floor(Date.now() / 1000)
    const attribute = new TimestampType({ fieldName: 'updatedAt', on: TimestampOn.UPDATE, mode: TimestampMode.SECONDS })
    attribute.value = now
    t.is(attribute.error, undefined)
    t.is(attribute.value, now)
    t.is(attribute.changed, true)
    t.is(attribute.fieldName, 'updatedAt')
})

test('a simple required seconds deletedAt attribute', (t) => {
    const now = Math.floor(Date.now() / 1000)
    const attribute = new TimestampType({ fieldName: 'deletedAt', on: TimestampOn.DELETE, mode: TimestampMode.SECONDS })
    attribute.value = now
    t.is(attribute.error, undefined)
    t.is(attribute.value, now)
    t.is(attribute.changed, true)
    t.is(attribute.fieldName, 'deletedAt')
})

test('cannot assign an object to a iso string timestamp attribute', (t) => {
    const attribute = new TimestampType({ on: TimestampOn.UPDATE, mode: TimestampMode.ISO_STRING })
    attribute.value = JSON.parse('{"foo": "bar"}')
    t.is(attribute.error instanceof Exception, true)
    t.deepEqual(attribute.error?.issues, [
        {
            expected: 'string',
            message: '"value" is expected to be "string" but received "object"',
            path: 'value',
            received: 'object',
        },
    ])
})

test('cannot assign invalid string to a iso string timestamp attribute', (t) => {
    const attribute = new TimestampType({ on: TimestampOn.UPDATE, mode: TimestampMode.ISO_STRING })
    attribute.value = 'foo'
    t.is(attribute.error instanceof Exception, true)
    t.deepEqual(attribute.error?.issues, [
        {
            expected: 'ISO_DATE',
            message: '"value" is expected to be "ISO_DATE" but received "foo"',
            path: 'value',
            received: 'foo',
        },
    ])
})

test('cannot assign an object to a seconds timestamp attribute', (t) => {
    const attribute = new TimestampType({ on: TimestampOn.UPDATE, mode: TimestampMode.SECONDS })
    attribute.value = JSON.parse('{"foo": "bar"}')
    t.is(attribute.error instanceof Exception, true)
    t.deepEqual(attribute.error?.issues, [
        {
            expected: 'number',
            message: '"value" is expected to be "number" but received "object"',
            path: 'value',
            received: 'object',
        },
    ])
})
