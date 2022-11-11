import BooleanType from '.'
import test from 'ava'
import { silent } from '../../utils/helpers'
import { Exception } from '../../utils/errors'

test.before(() => silent(true))

test('a simple required boolean attribute', (t) => {
    const attribute = new BooleanType({ required: true })
    attribute.value = true
    t.is(attribute.error, undefined)
    t.is(attribute.value, true)
    t.is(attribute.changed, true)
})

test('a simple boolean attribute', (t) => {
    const attribute = new BooleanType({})
    attribute.value = undefined
    t.is(attribute.error, undefined)
    t.is(attribute.value, undefined)
    t.is(attribute.changed, false)
})

test('input converted to boolean via transform', (t) => {
    const attribute = new BooleanType({ transform: (v) => !v })
    attribute.value = undefined
    t.is(attribute.error, undefined)
    t.is(attribute.value === true, true)
    t.is(attribute.changed, true)
})

test('cannot assign an object to boolean attribute', (t) => {
    const attribute = new BooleanType({ required: true })
    attribute.value = JSON.parse('{"a":1}')
    t.is(attribute.error instanceof Exception, true)
    t.deepEqual(attribute.error?.issues, [
        {
            expected: 'boolean',
            message: '"value" is expected to be "boolean" but received "object"',
            path: 'value',
            received: 'object',
        },
    ])
    t.is(!!attribute.value, false)
})
