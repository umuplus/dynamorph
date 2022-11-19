import test from 'ava'
import UpdateTokenType from '.'
import { Exception } from '../../utils/errors'
import { silent } from '../../utils/helpers'

test.before(() => silent(true))

test('a simple required update token attribute', (t) => {
    const attribute = new UpdateTokenType({ fieldName: 'updateToken' })
    t.is(attribute.error, undefined)
    t.is(attribute.value.length, 4)
    t.is(attribute.changed, true)
    t.is(attribute.fieldName, 'updateToken')
})

test('assign a value to a simple required update token attribute', (t) => {
    const attribute = new UpdateTokenType({})
    attribute.value = '1234'
    t.is(attribute.error, undefined)
    t.is(attribute.value, '1234')
    t.is(attribute.changed, true)
})

test('a simple required update token attribute with custom length', (t) => {
    const attribute = new UpdateTokenType({ length: 6 })
    t.is(attribute.error, undefined)
    t.is(attribute.value.length, 6)
    t.is(attribute.changed, true)
})

test('assign a value to a simple required update token attribute with custom length', (t) => {
    const attribute = new UpdateTokenType({ length: 6 })
    attribute.value = '123456'
    t.is(attribute.error, undefined)
    t.is(attribute.value, '123456')
    t.is(attribute.changed, true)
})

test('reset a simple required update token attribute with custom length', (t) => {
    const attribute = new UpdateTokenType({ length: 8 })
    attribute.reset()
    t.is(attribute.error, undefined)
    t.is(attribute.value.length, 8)
    t.is(attribute.changed, true)
})

test('cannot assign a value with less letters to an update token attribute', (t) => {
    const attribute = new UpdateTokenType({ length: 5 })
    attribute.value = '123'
    t.is(attribute.error instanceof Exception, true)
    t.deepEqual(attribute.error?.issues, [
        {
            expected: 5,
            message: '"length" is expected to be "5" but received "3"',
            path: 'length',
            received: 3,
        },
    ])
})

test('cannot assign an object to an update token attribute', (t) => {
    const attribute = new UpdateTokenType({})
    attribute.value = JSON.parse('{"a":1}')
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
